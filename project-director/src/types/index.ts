// =============================================================
// Project Director — Shared Type System  (Phase 2 — Expanded)
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
  transition?: 'fade' | 'iris' | 'cut';
  characterIds?: string[];
  dialogues?: DialogueDef[];
}

// ------------------------------------------------------------------
// Scene JSON — the contract between AI Director and Scene Compiler
// ------------------------------------------------------------------

export type AnimationName =
  // Core
  | 'idle'
  | 'walk'
  | 'sit'
  | 'eat'
  | 'wave'
  | 'talk'
  | 'cook'
  | 'blink'
  // Cricket
  | 'bat'
  | 'bowl'
  | 'field'
  | 'run'
  | 'celebrate'
  | 'cheer'
  // Phase 2 — General
  | 'jump'
  | 'dance'
  | 'sleep'
  | 'think'
  | 'point'
  | 'angry'
  | 'surprised'
  // Phase 2 — Rabbit-specific
  | 'hop'
  | 'garden'
  | 'read'
  // Phase 2 — Cat-specific
  | 'crawl'
  | 'doze'
  | 'limp-walk'
  | 'giggle';

export type CameraShot = 'Wide' | 'Medium' | 'Close';

export type CharacterSpecies = 'cat' | 'rabbit';

export interface CharacterActionDef {
  animation: AnimationName;
  start: number; // seconds
  end: number;   // seconds
}

export interface CharacterDef {
  id: string;
  actions: CharacterActionDef[];
}

export interface DialogueDef {
  characterId: string;
  text: string;
  start: number; // seconds
  end: number;   // seconds
}

export interface SceneJSON {
  scene: string;
  duration: number;
  camera: CameraShot;
  characters: CharacterDef[];
  dialogues?: DialogueDef[];
  transition?: 'fade' | 'iris' | 'cut';
}

// ------------------------------------------------------------------
// Director Planner — camera cuts
// ------------------------------------------------------------------

export interface CameraEvent {
  shot: CameraShot;
  start: number;
  end: number;
  focusCharacter?: string;
}

// ------------------------------------------------------------------
// Layout Engine
// ------------------------------------------------------------------

export interface Vec2 {
  x: number;
  y: number;
}

export type LayoutObjectType =
  // Kitchen
  | 'table'
  | 'chair'
  | 'fridge'
  | 'window'
  | 'cup'
  | 'plate'
  | 'stove'
  | 'counter'
  // Garden / Outdoor
  | 'tree'
  | 'bush'
  | 'bench'
  | 'swing'
  | 'pond'
  | 'flower'
  | 'fence'
  // Living Room
  | 'sofa'
  | 'tv'
  | 'lamp'
  | 'carpet'
  | 'bookshelf'
  // School
  | 'desk'
  | 'blackboard'
  | 'bookbag'
  // Birthday
  | 'cake'
  | 'balloon'
  | 'gift'
  | 'banner'
  // Bedtime
  | 'bed'
  | 'moon'
  | 'curtain'
  // Market
  | 'stall'
  | 'basket'
  | 'umbrella';

export interface LayoutObject {
  id: string;
  type: LayoutObjectType;
  position: Vec2;
  width: number;
  height: number;
  color?: string;
  zIndex?: number;
  meta?: Record<string, unknown>; // extra hints for renderer
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
  start: number;
  end: number;
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
  species: CharacterSpecies;   // NEW — determines which draw function to use
  position: Vec2;
  targetPosition?: Vec2;
  currentAnimation: AnimationName;
  animationProgress: number;
  facingRight: boolean;
  color: CharacterColors;
  scale: number;
  isSpeaking?: boolean;       // NEW — true if speaking dialogue currently
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
  dialogues: DialogueDef[];
  duration: number;
  transition?: 'fade' | 'iris' | 'cut';
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

// ------------------------------------------------------------------
// Character Registry entry — describes a character for the UI roster
// ------------------------------------------------------------------

export interface CharacterProfile {
  id: string;
  species: CharacterSpecies;
  displayName: string;
  family: string;          // 'Cat Family' | 'Rabbit Family'
  role: string;            // 'Father' | 'Mother' | 'Child' | 'Elder' | 'Baby'
  signature: AnimationName; // their "hero" animation shown in roster
}
