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
    console.log('[Engine] Playback started.');
  }

  pause(): void {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    console.log('[Engine] Playback paused.');
  }

  reset(): void {
    this.pause();
    this.currentTime = 0;
    this.lastTimestamp = null;
    this.fpsBuffer = [];
    this.fps = 0;
    this.cameraEngine.reset();

    // Reload scene to reset character positions
    if (this.sceneJSONs.length > 0) {
      this.loadScene(this.currentSceneIndex);
    }

    // Draw the first frame static
    this.renderOnce();
    console.log('[Engine] Reset complete.');
  }

  seekTo(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.compiledScene?.duration ?? 0));
  }

  isReady(): boolean {
    return this.compiledScene !== null;
  }

  getSceneJSONs(): SceneJSON[] {
    return this.sceneJSONs;
  }

  getStoryText(): string {
    return this.storyPlan ? this.storyPlanner.formatStoryText(this.storyPlan) : '';
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.compiledScene?.duration ?? 0;
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
      this.currentTime = duration;
      this.tick(dt);
      this.pause();
      this.callbacks?.onComplete();
      return;
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

    // 2. Update character states
    for (const char of this.compiledScene.characters) {
      const anim = (activeAnims[char.id] ?? 'idle') as AnimationName;
      char.currentAnimation = anim;

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
    }

    // 3. Update camera
    const focusChar = activeCamera.focusCharacter
      ? this.compiledScene.characters.find((c) => c.id === activeCamera.focusCharacter)
      : undefined;
    this.cameraEngine.setShot(activeCamera.shot, focusChar?.position);
    this.cameraEngine.tick(dt);

    // 4. Render
    renderFrame(
      this.ctx,
      this.cameraEngine,
      this.compiledScene.layout,
      this.compiledScene.characters,
      t,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );

    // 5. FPS
    this.updateFPS(dt);
    drawFPS(this.ctx, this.fps);

    // 6. Debug callback
    this.callbacks?.onDebugUpdate(this.buildDebugState(activeCamera.shot));
  }

  private renderOnce(): void {
    if (!this.compiledScene || !this.ctx) return;
    renderFrame(
      this.ctx,
      this.cameraEngine,
      this.compiledScene.layout,
      this.compiledScene.characters,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
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
