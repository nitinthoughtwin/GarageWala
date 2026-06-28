// =============================================================
// Project Director — Shared Type System
// All engine layers communicate through these contracts.
// =============================================================

// ------------------------------------------------------------------
// Story / AI Director types
// ------------------------------------------------------------------

export interface StoryPlan {
  title: string;
  scenes: SceneDescription[];
}

export interface SceneDescription {
  id: string;
  name: string;
  description: string;
  durationHint: number; // seconds
}

// ------------------------------------------------------------------
// Scene JSON — the contract between AI Director and Scene Compiler
// ------------------------------------------------------------------

export type AnimationName =
  | 'idle'
  | 'walk'
  | 'sit'
  | 'eat'
  | 'wave'
  | 'talk'
  | 'cook'
  | 'blink'
  // Cricket animations
  | 'bat'
  | 'bowl'
  | 'field'
  | 'run'
  | 'celebrate'
  | 'cheer';

export type CameraShot = 'Wide' | 'Medium' | 'Close';

export interface CharacterActionDef {
  animation: AnimationName;
  start: number; // seconds
  end: number;   // seconds
}

export interface CharacterDef {
  id: string;         // 'Papa' | 'Mama' | 'Kid'
  actions: CharacterActionDef[];
}

export interface SceneJSON {
  scene: string;       // layout key e.g. 'Kitchen'
  duration: number;    // total seconds
  camera: CameraShot;  // default/opening camera
  characters: CharacterDef[];
}

// ------------------------------------------------------------------
// Director Planner — camera cuts
// ------------------------------------------------------------------

export interface CameraEvent {
  shot: CameraShot;
  start: number;
  end: number;
  focusCharacter?: string; // character id to center on
}

// ------------------------------------------------------------------
// Layout Engine
// ------------------------------------------------------------------

export interface Vec2 {
  x: number;
  y: number;
}

export type LayoutObjectType =
  | 'table'
  | 'chair'
  | 'fridge'
  | 'window'
  | 'cup'
  | 'plate'
  | 'stove'
  | 'counter';

export interface LayoutObject {
  id: string;
  type: LayoutObjectType;
  position: Vec2;
  width: number;
  height: number;
  color?: string;
  zIndex?: number;
}

export interface CharacterSpawnPoint {
  characterId: string;
  position: Vec2;
}

export interface LayoutDefinition {
  name: string;
  backgroundColor: string;
  backgroundGradient?: string[];
  objects: LayoutObject[];
  spawnPoints: CharacterSpawnPoint[];
}

// ------------------------------------------------------------------
// Timeline Engine
// ------------------------------------------------------------------

export interface TimelineEvent {
  id: string;
  characterId: string;
  animation: AnimationName;
  start: number;  // seconds
  end: number;    // seconds
}

export interface CameraTimelineEvent {
  id: string;
  shot: CameraShot;
  start: number;
  end: number;
  focusCharacter?: string;
}

// ------------------------------------------------------------------
// Animation / Character Runtime State
// ------------------------------------------------------------------

export interface CharacterState {
  id: string;
  position: Vec2;
  targetPosition?: Vec2;
  currentAnimation: AnimationName;
  animationProgress: number; // 0-1 within current animation
  facingRight: boolean;
  color: CharacterColors;
  scale: number;
}

export interface CharacterColors {
  body: string;
  head: string;
  ears: string;
  eyeWhite: string;
  eyePupil: string;
  mouth: string;
  tail: string;
  outfit: string;
  outfitAccent: string;
}

// ------------------------------------------------------------------
// Camera Runtime State
// ------------------------------------------------------------------

export interface CameraState {
  shot: CameraShot;
  scale: number;
  offsetX: number;
  offsetY: number;
  targetScale: number;
  targetOffsetX: number;
  targetOffsetY: number;
}

// ------------------------------------------------------------------
// Compiled Scene (output of SceneCompiler)
// ------------------------------------------------------------------

export interface CompiledScene {
  layout: LayoutDefinition;
  characters: CharacterState[];
  timelineEvents: TimelineEvent[];
  cameraEvents: CameraTimelineEvent[];
  duration: number;
}

// ------------------------------------------------------------------
// Engine Runtime State (used by UI / Debug Panel)
// ------------------------------------------------------------------

export interface DebugState {
  fps: number;
  currentTime: number;
  duration: number;
  currentScene: string;
  currentCamera: CameraShot;
  characters: {
    id: string;
    animation: AnimationName;
    position: Vec2;
  }[];
  isPlaying: boolean;
}
