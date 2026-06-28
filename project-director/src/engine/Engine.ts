// =============================================================
// Engine — Top-level Orchestrator
// Wires: StoryPlanner → ScenePlanner → SceneCompiler →
//        TimelineEngine + CameraEngine + Renderer
// Exposes a clean API to the UI layer.
// =============================================================

import type { StoryPlan, SceneJSON, CompiledScene, DebugState, AnimationName } from '../types';
import { StoryPlanner } from '../story/StoryPlanner';
import { ScenePlanner } from '../story/ScenePlanner';
import { SceneCompiler } from '../compiler/SceneCompiler';
import { TimelineEngine } from '../timeline/TimelineEngine';
import { CameraEngine } from '../camera/CameraEngine';
import { AnimationLibrary } from '../animations/AnimationLibrary';
import { renderFrame, drawFPS } from '../renderer/CanvasRenderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../layout/layouts';
import { VoiceEngine } from './VoiceEngine';
import { soundEngine } from './SoundEngine';

export interface EngineCallbacks {
  onDebugUpdate: (state: DebugState) => void;
  onComplete: () => void;
}

export class Engine {
  // Pipeline modules
  private storyPlanner   = new StoryPlanner();
  private scenePlanner   = new ScenePlanner();
  private sceneCompiler  = new SceneCompiler();
  private timelineEngine = new TimelineEngine();
  private cameraEngine   = new CameraEngine();
  private animLibrary    = new AnimationLibrary();
  private voiceEngine    = new VoiceEngine();

  // Runtime state
  private compiledScene: CompiledScene | null = null;
  private storyPlan: StoryPlan | null = null;
  private sceneJSONs: SceneJSON[] = [];
  private currentSceneIndex = 0;

  // Playback
  private isPlaying = false;
  private currentTime = 0;
  private lastTimestamp: number | null = null;
  private rafId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  // FPS tracking
  private fpsBuffer: number[] = [];
  private fps = 0;

  // Callbacks
  private callbacks: EngineCallbacks | null = null;

  // Video Export state
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isExporting = false;
  private onExportProgress: ((progress: number) => void) | null = null;
  private onExportComplete: ((blobUrl: string) => void) | null = null;

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /** Generate pipeline: prompt → compile */
  generate(prompt: string): { storyPlan: StoryPlan; sceneJSONs: SceneJSON[] } {
    console.log('[Engine] generate() called with:', prompt);

    // 1. Story planner
    this.storyPlan = this.storyPlanner.plan(prompt);

    // 2. Scene planner
    this.sceneJSONs = this.scenePlanner.plan(this.storyPlan);

    // 3. Compile first scene
    this.currentSceneIndex = 0;
    this.loadScene(0);

    return { storyPlan: this.storyPlan, sceneJSONs: this.sceneJSONs };
  }

  loadProject(storyPlan: StoryPlan, sceneJSONs: SceneJSON[]): void {
    this.storyPlan = storyPlan;
    this.sceneJSONs = sceneJSONs;
    this.currentSceneIndex = 0;
    this.currentTime = 0;
    this.loadScene(0);
    this.renderOnce();
  }

  private loadScene(index: number): void {
    if (!this.sceneJSONs[index]) return;
    const sceneJSON = this.sceneJSONs[index];

    // Compile
    this.compiledScene = this.sceneCompiler.compile(sceneJSON);

    // Load timeline
    this.timelineEngine.load(
      this.compiledScene.timelineEvents,
      this.compiledScene.cameraEvents,
      this.compiledScene.duration,
    );

    // Reset camera
    this.cameraEngine.reset();

    console.log(`[Engine] Scene ${index + 1} loaded.`);
  }

  /** Attach a canvas for rendering */
  attachCanvas(canvas: HTMLCanvasElement, callbacks: EngineCallbacks): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;
    console.log('[Engine] Canvas attached.');
  }

  play(): void {
    if (this.isPlaying) return;
    if (!this.compiledScene) {
      console.warn('[Engine] Nothing compiled yet. Call generate() first.');
      return;
    }
    this.isPlaying = true;
    this.lastTimestamp = null;
    this.rafId = requestAnimationFrame(this.loop.bind(this));
    if (!this.isExporting) {
      soundEngine.playBGM();
    }
    console.log('[Engine] Playback started.');
  }

  pause(): void {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.voiceEngine.cancel();
    soundEngine.stopBGM();
    console.log('[Engine] Playback paused.');
  }

  reset(): void {
    this.pause();
    this.voiceEngine.reset();
    soundEngine.stopBGM();
    this.currentSceneIndex = 0;
    this.currentTime = 0;
    this.lastTimestamp = null;
    this.fpsBuffer = [];
    this.fps = 0;
    this.cameraEngine.reset();

    // Reload scene to reset character positions
    if (this.sceneJSONs.length > 0) {
      this.loadScene(0);
    }

    // Draw the first frame static
    this.renderOnce();
    console.log('[Engine] Reset complete.');
  }

  seekTo(absoluteTime: number): void {
    this.voiceEngine.reset();
    let accumulated = 0;
    let targetIndex = 0;

    for (let i = 0; i < this.sceneJSONs.length; i++) {
      const dur = this.sceneJSONs[i].duration;
      if (absoluteTime >= accumulated && absoluteTime <= accumulated + dur) {
        targetIndex = i;
        break;
      }
      accumulated += dur;
      if (i === this.sceneJSONs.length - 1) {
        targetIndex = i;
      }
    }

    if (this.currentSceneIndex !== targetIndex) {
      this.currentSceneIndex = targetIndex;
      this.loadScene(targetIndex);
    }

    this.currentTime = Math.max(0, absoluteTime - accumulated);
    this.renderOnce();
  }

  isReady(): boolean {
    return this.compiledScene !== null;
  }

  startExport(
    ratio: '16:9' | '9:16',
    onProgress: (progress: number) => void,
    onComplete: (blobUrl: string) => void
  ): void {
    if (this.isExporting || !this.canvas) return;

    this.isExporting = true;
    this.onExportProgress = onProgress;
    this.onExportComplete = onComplete;

    // Reset playhead to start
    this.reset();
    
    // Set recording resolution / aspect ratio temporarily on the canvas
    if (ratio === '9:16') {
      // 304x540 fits 9:16 vertically and keeps coordinates proportional
      this.canvas.width = 304;
      this.canvas.height = 540;
    } else {
      this.canvas.width = CANVAS_WIDTH;
      this.canvas.height = CANVAS_HEIGHT;
    }

    this.recordedChunks = [];
    
    // Capture stream at 30 FPS
    const stream = this.canvas.captureStream(30);
    
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        if (this.canvas) {
          this.canvas.width = CANVAS_WIDTH;
          this.canvas.height = CANVAS_HEIGHT;
        }
        
        this.isExporting = false;
        this.onExportComplete?.(url);
        
        this.onExportProgress = null;
        this.onExportComplete = null;
        
        this.reset();
      };

      this.mediaRecorder.start();
      this.play();
    } catch (err) {
      console.error('[Engine] Failed to initialize MediaRecorder:', err);
      this.isExporting = false;
      if (this.canvas) {
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
      }
    }
  }

  cancelExport(): void {
    if (!this.isExporting) return;
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    this.isExporting = false;
    this.recordedChunks = [];
    
    if (this.canvas) {
      this.canvas.width = CANVAS_WIDTH;
      this.canvas.height = CANVAS_HEIGHT;
    }
    
    this.reset();
  }

  getSceneJSONs(): SceneJSON[] {
    return this.sceneJSONs;
  }

  getStoryText(): string {
    return this.storyPlan ? this.storyPlanner.formatStoryText(this.storyPlan) : '';
  }

  getCurrentTime(): number {
    return this.getSceneOffset(this.currentSceneIndex) + this.currentTime;
  }

  getDuration(): number {
    return this.sceneJSONs.reduce((sum, s) => sum + s.duration, 0);
  }

  private getSceneOffset(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.sceneJSONs[i]?.duration ?? 0;
    }
    return offset;
  }

  // ------------------------------------------------------------------
  // RAF Loop
  // ------------------------------------------------------------------

  private loop(timestamp: number): void {
    if (!this.isPlaying) return;

    // Delta time
    const dt = this.lastTimestamp !== null
      ? Math.min((timestamp - this.lastTimestamp) / 1000, 0.1)
      : 0.016;
    this.lastTimestamp = timestamp;

    // Advance time
    this.currentTime += dt;

    // Check scene end
    const duration = this.compiledScene?.duration ?? 0;
    if (this.currentTime >= duration) {
      if (this.currentSceneIndex < this.sceneJSONs.length - 1) {
        this.currentSceneIndex++;
        this.loadScene(this.currentSceneIndex);
        this.currentTime = 0;
        this.voiceEngine.reset();
      } else {
        this.currentTime = duration;
        this.tick(dt);
        this.pause();
        
        if (this.isExporting && this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
        
        this.callbacks?.onComplete();
        return;
      }
    }

    if (this.isExporting && this.onExportProgress) {
      const absoluteProgress = (this.getCurrentTime() / this.getDuration()) * 100;
      this.onExportProgress(Math.min(absoluteProgress, 100));
    }

    this.tick(dt);
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  private tick(dt: number): void {
    if (!this.compiledScene || !this.ctx || !this.canvas) return;

    const t = this.currentTime;

    // 1. Get active animations from timeline
    const activeAnims = this.timelineEngine.getActiveAnimations(t);
    const activeCamera = this.timelineEngine.getActiveCamera(t);

    // Check speech triggers
    for (const dialogue of this.compiledScene.dialogues) {
      if (t >= dialogue.start && t <= dialogue.end) {
        if (this.isPlaying) {
          const speakId = `${dialogue.characterId}-${dialogue.start}`;
          this.voiceEngine.speak(dialogue, speakId);
        }
      }
    }

    // 2. Update character states
    for (const char of this.compiledScene.characters) {
      const anim = (activeAnims[char.id] ?? 'idle') as AnimationName;
      char.currentAnimation = anim;

      // Check if speaking
      char.isSpeaking = this.compiledScene.dialogues.some(
        d => d.characterId === char.id && t >= d.start && t <= d.end
      );

      // If walking, set target position toward chair/table
      let targetPos = char.targetPosition;
      if (anim === 'walk') {
        const chairs = this.compiledScene.layout.objects;
        targetPos = this.animLibrary.getSitTarget(char.id, chairs)
          ?? { x: char.position.x, y: char.position.y };
      }

      const next = this.animLibrary.tick(char, t, dt, anim === 'walk' ? targetPos : undefined);
      char.position = next.position;
      char.facingRight = next.facingRight;
      char.animationProgress = next.animationProgress;
      if (anim === 'walk' && next.targetPosition) {
        char.targetPosition = next.targetPosition;
      }

      // Procedural Sound Effects trigger
      if (this.isPlaying && !this.isExporting) {
        const isWalking = anim === 'walk' || anim === 'limp-walk';
        if (isWalking && Math.floor(t * 2.5) !== Math.floor((t - dt) * 2.5)) {
          soundEngine.playSFX('step');
        }

        if (anim === 'giggle' && Math.floor(t / 1.5) !== Math.floor((t - dt) / 1.5)) {
          soundEngine.playSFX('giggle');
        }

        const event = this.compiledScene.timelineEvents.find(
          e => e.characterId === char.id && e.animation === anim && t >= e.start && t <= e.end
        );
        if (event) {
          const relativeTime = t - event.start;
          const prevRelative = (t - dt) - event.start;

          if (anim === 'bat' && relativeTime >= 1.2 && prevRelative < 1.2) {
            soundEngine.playSFX('hit');
          }
          if ((anim === 'celebrate' || anim === 'cheer') && relativeTime >= 0 && prevRelative < 0) {
            soundEngine.playSFX('cheer');
          }
        }
      }
    }

    // 3. Update camera
    const focusChar = activeCamera.focusCharacter
      ? this.compiledScene.characters.find((c) => c.id === activeCamera.focusCharacter)
      : undefined;
    this.cameraEngine.setShot(activeCamera.shot, focusChar?.position);
    this.cameraEngine.tick(dt);

    // 4. Render
    const transProgress = this.compiledScene.transition ? Math.min(this.currentTime / 1.0, 1.0) : undefined;
    renderFrame(
      this.ctx,
      this.cameraEngine,
      this.compiledScene.layout,
      this.compiledScene.characters,
      t,
      this.canvas.width,
      this.canvas.height,
      this.compiledScene.dialogues,
      this.compiledScene.transition,
      transProgress
    );

    // 5. FPS
    this.updateFPS(dt);
    drawFPS(this.ctx, this.fps);

    // 6. Debug callback
    this.callbacks?.onDebugUpdate(this.buildDebugState(activeCamera.shot));
  }

  private renderOnce(): void {
    if (!this.compiledScene || !this.ctx || !this.canvas) return;
    const transProgress = this.compiledScene.transition ? Math.min(this.currentTime / 1.0, 1.0) : undefined;
    renderFrame(
      this.ctx,
      this.cameraEngine,
      this.compiledScene.layout,
      this.compiledScene.characters,
      this.currentTime,
      this.canvas.width,
      this.canvas.height,
      this.compiledScene.dialogues,
      this.compiledScene.transition,
      transProgress
    );
  }

  private updateFPS(dt: number): void {
    this.fpsBuffer.push(1 / dt);
    if (this.fpsBuffer.length > 30) this.fpsBuffer.shift();
    this.fps = this.fpsBuffer.reduce((a, b) => a + b, 0) / this.fpsBuffer.length;
  }

  private buildDebugState(currentCamera: import('../types').CameraShot): DebugState {
    const scene = this.compiledScene;
    return {
      fps: Math.round(this.fps),
      currentTime: this.currentTime,
      duration: scene?.duration ?? 0,
      currentScene: scene?.layout.name ?? '-',
      currentCamera,
      characters: scene?.characters.map((c) => ({
        id: c.id,
        animation: c.currentAnimation,
        position: { ...c.position },
      })) ?? [],
      isPlaying: this.isPlaying,
    };
  }
}
