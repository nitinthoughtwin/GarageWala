// =============================================================
// Layout Engine — Predefined Room Layouts
// The AI/compiler NEVER receives raw coordinates.
// It references named spawn points and object IDs.
// The layout resolves positions deterministically.
// Canvas: 960 × 540 (16:9)
// =============================================================

import type { LayoutDefinition } from '../types';

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

// ------------------------------------------------------------------
// Kitchen Layout
// ------------------------------------------------------------------
export const KitchenLayout: LayoutDefinition = {
  name: 'Kitchen',
  backgroundColor: '#fef9c3',
  backgroundGradient: ['#fef9c3', '#fde68a'],
  objects: [
    // Floor
    {
      id: 'floor',
      type: 'counter',
      position: { x: 0, y: 390 },
      width: 960,
      height: 150,
      color: '#d97706',
      zIndex: 0,
    },
    // Back wall
    {
      id: 'wall',
      type: 'counter',
      position: { x: 0, y: 0 },
      width: 960,
      height: 390,
      color: '#fef3c7',
      zIndex: 0,
    },
    // Window (left side)
    {
      id: 'window',
      type: 'window',
      position: { x: 40, y: 60 },
      width: 160,
      height: 120,
      color: '#bae6fd',
      zIndex: 1,
    },
    // Kitchen counter / stove area (right side)
    {
      id: 'counter',
      type: 'counter',
      position: { x: 700, y: 240 },
      width: 260,
      height: 150,
      color: '#92400e',
      zIndex: 1,
    },
    {
      id: 'stove',
      type: 'stove',
      position: { x: 730, y: 200 },
      width: 120,
      height: 80,
      color: '#374151',
      zIndex: 2,
    },
    {
      id: 'fridge',
      type: 'fridge',
      position: { x: 870, y: 160 },
      width: 80,
      height: 220,
      color: '#e5e7eb',
      zIndex: 2,
    },
    // Dining table (center)
    {
      id: 'table',
      type: 'table',
      position: { x: 320, y: 330 },
      width: 320,
      height: 80,
      color: '#92400e',
      zIndex: 2,
    },
    // Chairs
    {
      id: 'chair-left',
      type: 'chair',
      position: { x: 290, y: 350 },
      width: 60,
      height: 90,
      color: '#78350f',
      zIndex: 1,
    },
    {
      id: 'chair-right',
      type: 'chair',
      position: { x: 600, y: 350 },
      width: 60,
      height: 90,
      color: '#78350f',
      zIndex: 1,
    },
    // Plate on table
    {
      id: 'plate-1',
      type: 'plate',
      position: { x: 390, y: 335 },
      width: 50,
      height: 20,
      color: '#f3f4f6',
      zIndex: 3,
    },
    {
      id: 'plate-2',
      type: 'plate',
      position: { x: 520, y: 335 },
      width: 50,
      height: 20,
      color: '#f3f4f6',
      zIndex: 3,
    },
    // Cup
    {
      id: 'cup',
      type: 'cup',
      position: { x: 455, y: 320 },
      width: 28,
      height: 38,
      color: '#fbbf24',
      zIndex: 3,
    },
  ],
  spawnPoints: [
    { characterId: 'Papa', position: { x: 100, y: 310 } },
    { characterId: 'Mama', position: { x: 760, y: 280 } },
    { characterId: 'Kid',  position: { x: 560, y: 310 } },
  ],
};

// ------------------------------------------------------------------
// Garden Layout — Cricket Scene
// ------------------------------------------------------------------
export const GardenLayout: LayoutDefinition = {
  name: 'Garden',
  backgroundColor: '#bbf7d0',
  backgroundGradient: ['#86efac', '#4ade80'],
  objects: [
    // Sky
    {
      id: 'sky',
      type: 'counter',
      position: { x: 0, y: 0 },
      width: 960,
      height: 340,
      color: '#bfdbfe',
      zIndex: 0,
    },
    // Grass ground
    {
      id: 'grass',
      type: 'counter',
      position: { x: 0, y: 340 },
      width: 960,
      height: 200,
      color: '#16a34a',
      zIndex: 0,
    },
    // Ground highlight strip (lighter grass stripe)
    {
      id: 'grass-stripe',
      type: 'counter',
      position: { x: 0, y: 340 },
      width: 960,
      height: 8,
      color: '#15803d',
      zIndex: 1,
    },
    // Cricket pitch (centre rectangle)
    {
      id: 'pitch',
      type: 'counter',
      position: { x: 340, y: 330 },
      width: 280,
      height: 60,
      color: '#d97706',
      zIndex: 1,
    },
    // Bowling crease line (near end)
    {
      id: 'crease-near',
      type: 'counter',
      position: { x: 340, y: 376 },
      width: 280,
      height: 4,
      color: '#fef3c7',
      zIndex: 2,
    },
    // Batting crease line (far end)
    {
      id: 'crease-far',
      type: 'counter',
      position: { x: 340, y: 330 },
      width: 280,
      height: 4,
      color: '#fef3c7',
      zIndex: 2,
    },
    // Wickets — batting end (left, near pitcher)
    {
      id: 'wickets-bat',
      type: 'stove',      // reusing stove type, drawn specially
      position: { x: 356, y: 298 },
      width: 40,
      height: 50,
      color: '#fef3c7',
      zIndex: 3,
    },
    // Wickets — bowling end (right)
    {
      id: 'wickets-bowl',
      type: 'stove',
      position: { x: 558, y: 298 },
      width: 40,
      height: 50,
      color: '#fef3c7',
      zIndex: 3,
    },
    // Left boundary tree 1
    {
      id: 'tree-left-1',
      type: 'window',
      position: { x: 30, y: 160 },
      width: 100,
      height: 140,
      color: '#15803d',
      zIndex: 1,
    },
    // Right boundary tree
    {
      id: 'tree-right',
      type: 'window',
      position: { x: 820, y: 140 },
      width: 110,
      height: 160,
      color: '#15803d',
      zIndex: 1,
    },
    // Centre-left bush
    {
      id: 'bush-1',
      type: 'fridge',
      position: { x: 140, y: 290 },
      width: 60,
      height: 55,
      color: '#16a34a',
      zIndex: 1,
    },
    // Right bush
    {
      id: 'bush-2',
      type: 'fridge',
      position: { x: 760, y: 300 },
      width: 55,
      height: 48,
      color: '#15803d',
      zIndex: 1,
    },
    // Cricket ball (on pitch, near wickets)
    {
      id: 'ball',
      type: 'cup',
      position: { x: 458, y: 350 },
      width: 18,
      height: 18,
      color: '#dc2626',
      zIndex: 4,
    },
  ],
  spawnPoints: [
    // Papa bats — at batting end (left of pitch)
    { characterId: 'Papa', position: { x: 380, y: 330 } },
    // Mama bowls — far end (right of pitch)
    { characterId: 'Mama', position: { x: 680, y: 315 } },
    // Kid fields — off to the right side
    { characterId: 'Kid',  position: { x: 820, y: 345 } },
  ],
};

// ------------------------------------------------------------------
// Layout Registry — add more layouts here as the engine grows
// ------------------------------------------------------------------
export const LAYOUTS: Record<string, LayoutDefinition> = {
  Kitchen: KitchenLayout,
  Garden:  GardenLayout,
};

export function getLayout(name: string): LayoutDefinition {
  const layout = LAYOUTS[name];
  if (!layout) {
    console.warn(`[LayoutEngine] Layout "${name}" not found, falling back to Kitchen.`);
    return KitchenLayout;
  }
  return layout;
}
