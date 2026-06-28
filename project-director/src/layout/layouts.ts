// =============================================================
// Layout Engine — Predefined Room and Outdoor Layouts (Phase 2 & 7)
// Wires: deterministically resolved spawn points and objects.
// Canvas: 960 × 540 (16:9)
// =============================================================

import type { LayoutDefinition } from '../types';

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

// ------------------------------------------------------------------
// 1. Kitchen Layout
// ------------------------------------------------------------------
export const KitchenLayout: LayoutDefinition = {
  name: 'Kitchen',
  backgroundColor: '#fef9c3',
  backgroundGradient: ['#fef9c3', '#fde68a'],
  objects: [
    { id: 'floor', type: 'counter', position: { x: 0, y: 390 }, width: 960, height: 150, color: '#d97706', zIndex: 0 },
    { id: 'wall', type: 'counter', position: { x: 0, y: 0 }, width: 960, height: 390, color: '#fef3c7', zIndex: 0 },
    { id: 'window', type: 'window', position: { x: 40, y: 60 }, width: 160, height: 120, color: '#bae6fd', zIndex: 1 },
    { id: 'counter', type: 'counter', position: { x: 700, y: 240 }, width: 260, height: 150, color: '#92400e', zIndex: 1 },
    { id: 'stove', type: 'stove', position: { x: 730, y: 200 }, width: 120, height: 80, color: '#374151', zIndex: 2 },
    { id: 'fridge', type: 'fridge', position: { x: 870, y: 160 }, width: 80, height: 220, color: '#e5e7eb', zIndex: 2 },
    { id: 'table', type: 'table', position: { x: 320, y: 330 }, width: 320, height: 80, color: '#92400e', zIndex: 2 },
    { id: 'chair-left', type: 'chair', position: { x: 290, y: 350 }, width: 60, height: 90, color: '#78350f', zIndex: 1 },
    { id: 'chair-right', type: 'chair', position: { x: 600, y: 350 }, width: 60, height: 90, color: '#78350f', zIndex: 1 },
    { id: 'plate-1', type: 'plate', position: { x: 390, y: 335 }, width: 50, height: 20, color: '#f3f4f6', zIndex: 3 },
    { id: 'plate-2', type: 'plate', position: { x: 520, y: 335 }, width: 50, height: 20, color: '#f3f4f6', zIndex: 3 },
    { id: 'cup', type: 'cup', position: { x: 455, y: 320 }, width: 28, height: 38, color: '#fbbf24', zIndex: 3 },
  ],
  spawnPoints: [
    { characterId: 'PapaCat', position: { x: 100, y: 430 } },
    { characterId: 'MamaCat', position: { x: 740, y: 420 } },
    { characterId: 'KidCat',  position: { x: 560, y: 430 } },
    { characterId: 'GrandpaCat', position: { x: 220, y: 430 } },
    { characterId: 'BabyCat', position: { x: 480, y: 460 } },
    // backward compatibility
    { characterId: 'Papa', position: { x: 100, y: 430 } },
    { characterId: 'Mama', position: { x: 740, y: 420 } },
    { characterId: 'Kid',  position: { x: 560, y: 430 } },
  ],
};

// ------------------------------------------------------------------
// 2. Garden Layout (Cricket Match)
// ------------------------------------------------------------------
export const GardenLayout: LayoutDefinition = {
  name: 'Garden',
  backgroundColor: '#bbf7d0',
  backgroundGradient: ['#86efac', '#4ade80'],
  objects: [
    { id: 'sky', type: 'counter', position: { x: 0, y: 0 }, width: 960, height: 340, color: '#bfdbfe', zIndex: 0 },
    { id: 'grass', type: 'counter', position: { x: 0, y: 340 }, width: 960, height: 200, color: '#16a34a', zIndex: 0 },
    { id: 'grass-stripe', type: 'counter', position: { x: 0, y: 340 }, width: 960, height: 8, color: '#15803d', zIndex: 1 },
    { id: 'pitch', type: 'counter', position: { x: 340, y: 330 }, width: 280, height: 60, color: '#d97706', zIndex: 1 },
    { id: 'crease-near', type: 'counter', position: { x: 340, y: 376 }, width: 280, height: 4, color: '#fef3c7', zIndex: 2 },
    { id: 'crease-far', type: 'counter', position: { x: 340, y: 330 }, width: 280, height: 4, color: '#fef3c7', zIndex: 2 },
    { id: 'wickets-bat', type: 'stove', position: { x: 356, y: 298 }, width: 40, height: 50, color: '#fef3c7', zIndex: 3 },
    { id: 'wickets-bowl', type: 'stove', position: { x: 558, y: 298 }, width: 40, height: 50, color: '#fef3c7', zIndex: 3 },
    { id: 'tree-left-1', type: 'window', position: { x: 30, y: 160 }, width: 100, height: 140, color: '#15803d', zIndex: 1 },
    { id: 'tree-right', type: 'window', position: { x: 820, y: 140 }, width: 110, height: 160, color: '#15803d', zIndex: 1 },
    { id: 'bush-1', type: 'fridge', position: { x: 140, y: 290 }, width: 60, height: 55, color: '#16a34a', zIndex: 1 },
    { id: 'bush-2', type: 'fridge', position: { x: 760, y: 300 }, width: 55, height: 48, color: '#15803d', zIndex: 1 },
    { id: 'ball', type: 'cup', position: { x: 458, y: 350 }, width: 18, height: 18, color: '#dc2626', zIndex: 4 },
  ],
  spawnPoints: [
    { characterId: 'PapaCat', position: { x: 380, y: 390 } },
    { characterId: 'MamaCat', position: { x: 680, y: 390 } },
    { characterId: 'KidCat',  position: { x: 820, y: 410 } },
    { characterId: 'PapaRabbit', position: { x: 380, y: 390 } },
    { characterId: 'MamaRabbit', position: { x: 680, y: 390 } },
    { characterId: 'KidRabbit',  position: { x: 820, y: 410 } },
    // backward compatibility
    { characterId: 'Papa', position: { x: 380, y: 390 } },
    { characterId: 'Mama', position: { x: 680, y: 390 } },
    { characterId: 'Kid',  position: { x: 820, y: 410 } },
  ],
};

// ------------------------------------------------------------------
// 3. Living Room Layout
// ------------------------------------------------------------------
export const LivingRoomLayout: LayoutDefinition = {
  name: 'Living Room',
  backgroundColor: '#bfdbfe',
  backgroundGradient: ['#eff6ff', '#dbeafe'],
  objects: [
    { id: 'floor', type: 'counter', position: { x: 0, y: 380 }, width: 960, height: 160, color: '#78350f', zIndex: 0 },
    { id: 'wall', type: 'counter', position: { x: 0, y: 0 }, width: 960, height: 380, color: '#1e3a8a', zIndex: 0 },
    { id: 'carpet', type: 'carpet', position: { x: 260, y: 400 }, width: 440, height: 100, color: '#ec4899', zIndex: 1 },
    { id: 'sofa', type: 'sofa', position: { x: 340, y: 300 }, width: 280, height: 110, color: '#dc2626', zIndex: 2 },
    { id: 'tv', type: 'tv', position: { x: 60, y: 260 }, width: 140, height: 130, color: '#374151', zIndex: 2 },
    { id: 'lamp', type: 'lamp', position: { x: 860, y: 200 }, width: 60, height: 190, color: '#f59e0b', zIndex: 2 },
    { id: 'bookshelf', type: 'bookshelf', position: { x: 700, y: 180 }, width: 120, height: 210, color: '#b45309', zIndex: 1 },
  ],
  spawnPoints: [
    { characterId: 'PapaCat', position: { x: 390, y: 340 } }, // sits on sofa
    { characterId: 'MamaCat', position: { x: 480, y: 340 } }, // sits on sofa
    { characterId: 'KidCat',  position: { x: 300, y: 430 } }, // sits on carpet
    { characterId: 'GrandpaCat', position: { x: 740, y: 420 } }, // stands by books
    { characterId: 'BabyCat', position: { x: 500, y: 450 } }, // crawling on carpet
    { characterId: 'PapaRabbit', position: { x: 390, y: 340 } },
    { characterId: 'MamaRabbit', position: { x: 480, y: 340 } },
    { characterId: 'KidRabbit',  position: { x: 300, y: 430 } },
  ],
};

// ------------------------------------------------------------------
// 4. Park Layout
// ------------------------------------------------------------------
export const ParkLayout: LayoutDefinition = {
  name: 'Park',
  backgroundColor: '#bbf7d0',
  backgroundGradient: ['#dcfce7', '#bbf7d0'],
  objects: [
    { id: 'sky', type: 'counter', position: { x: 0, y: 0 }, width: 960, height: 320, color: '#bae6fd', zIndex: 0 },
    { id: 'grass', type: 'counter', position: { x: 0, y: 320 }, width: 960, height: 220, color: '#22c55e', zIndex: 0 },
    { id: 'pond', type: 'pond', position: { x: 600, y: 380 }, width: 300, height: 120, color: '#3b82f6', zIndex: 1 },
    { id: 'bench', type: 'bench', position: { x: 300, y: 330 }, width: 200, height: 80, color: '#78350f', zIndex: 2 },
    { id: 'swing', type: 'swing', position: { x: 80, y: 220 }, width: 140, height: 190, color: '#475569', zIndex: 2 },
    { id: 'tree-1', type: 'tree', position: { x: 500, y: 120 }, width: 120, height: 210, color: '#15803d', zIndex: 1 },
    { id: 'flower-1', type: 'flower', position: { x: 260, y: 380 }, width: 30, height: 40, color: '#ef4444', zIndex: 2 },
    { id: 'flower-2', type: 'flower', position: { x: 520, y: 410 }, width: 30, height: 40, color: '#ec4899', zIndex: 2 },
  ],
  spawnPoints: [
    { characterId: 'KidCat', position: { x: 130, y: 343 } }, // on swing seat
    { characterId: 'KidRabbit', position: { x: 340, y: 360 } }, // sits on bench
    { characterId: 'GrandpaCat', position: { x: 420, y: 360 } }, // sits on bench next to Kid
    { characterId: 'PapaCat', position: { x: 530, y: 420 } },
    { characterId: 'MamaCat', position: { x: 260, y: 420 } },
    { characterId: 'BabyCat', position: { x: 640, y: 440 } }, // crawling
    { characterId: 'PapaRabbit', position: { x: 530, y: 420 } },
    { characterId: 'MamaRabbit', position: { x: 260, y: 420 } },
  ],
};

// ------------------------------------------------------------------
// 5. School Classroom Layout
// ------------------------------------------------------------------
export const SchoolLayout: LayoutDefinition = {
  name: 'School',
  backgroundColor: '#fed7aa',
  backgroundGradient: ['#ffedd5', '#fed7aa'],
  objects: [
    { id: 'floor', type: 'counter', position: { x: 0, y: 380 }, width: 960, height: 160, color: '#d97706', zIndex: 0 },
    { id: 'wall', type: 'counter', position: { x: 0, y: 0 }, width: 960, height: 380, color: '#f97316', zIndex: 0 },
    { id: 'blackboard', type: 'blackboard', position: { x: 300, y: 80 }, width: 360, height: 160, color: '#065f46', zIndex: 1 },
    { id: 'desk-left', type: 'desk', position: { x: 160, y: 340 }, width: 140, height: 80, color: '#b45309', zIndex: 2 },
    { id: 'desk-right', type: 'desk', position: { x: 660, y: 340 }, width: 140, height: 80, color: '#b45309', zIndex: 2 },
    { id: 'chair-left', type: 'chair', position: { x: 200, y: 360 }, width: 50, height: 75, color: '#78350f', zIndex: 1 },
    { id: 'chair-right', type: 'chair', position: { x: 700, y: 360 }, width: 50, height: 75, color: '#78350f', zIndex: 1 },
    { id: 'bookbag-1', type: 'bookbag', position: { x: 120, y: 380 }, width: 35, height: 45, color: '#ef4444', zIndex: 3 },
    { id: 'bookbag-2', type: 'bookbag', position: { x: 810, y: 380 }, width: 35, height: 45, color: '#3b82f6', zIndex: 3 },
  ],
  spawnPoints: [
    { characterId: 'KidCat', position: { x: 215, y: 390 } }, // sits at left chair
    { characterId: 'KidRabbit', position: { x: 715, y: 390 } }, // sits at right chair
    { characterId: 'MamaCat', position: { x: 480, y: 410 } }, // stands at blackboard (teacher)
    { characterId: 'PapaCat', position: { x: 380, y: 420 } },
    { characterId: 'PapaRabbit', position: { x: 580, y: 420 } },
  ],
};

// ------------------------------------------------------------------
// 6. Birthday Party Layout
// ------------------------------------------------------------------
export const BirthdayPartyLayout: LayoutDefinition = {
  name: 'Birthday Party',
  backgroundColor: '#fbcfe8',
  backgroundGradient: ['#fdf2f8', '#fbcfe8'],
  objects: [
    { id: 'floor', type: 'counter', position: { x: 0, y: 380 }, width: 960, height: 160, color: '#65a30d', zIndex: 0 },
    { id: 'wall', type: 'counter', position: { x: 0, y: 0 }, width: 960, height: 380, color: '#db2777', zIndex: 0 },
    { id: 'banner', type: 'banner', position: { x: 200, y: 30 }, width: 560, height: 50, color: '#fbbf24', zIndex: 1 },
    { id: 'table', type: 'table', position: { x: 300, y: 330 }, width: 360, height: 80, color: '#92400e', zIndex: 2 },
    { id: 'cake', type: 'cake', position: { x: 440, y: 270 }, width: 80, height: 65, color: '#f43f5e', zIndex: 3 },
    { id: 'gift-1', type: 'gift', position: { x: 220, y: 390 }, width: 50, height: 50, color: '#3b82f6', zIndex: 2 },
    { id: 'gift-2', type: 'gift', position: { x: 690, y: 390 }, width: 60, height: 55, color: '#a855f7', zIndex: 2 },
    { id: 'balloon-1', type: 'balloon', position: { x: 80, y: 80 }, width: 40, height: 60, color: '#f43f5e', zIndex: 1 },
    { id: 'balloon-2', type: 'balloon', position: { x: 140, y: 60 }, width: 40, height: 60, color: '#60a5fa', zIndex: 1 },
    { id: 'balloon-3', type: 'balloon', position: { x: 820, y: 80 }, width: 40, height: 60, color: '#34d399', zIndex: 1 },
  ],
  spawnPoints: [
    { characterId: 'KidCat', position: { x: 480, y: 410 } }, // behind/next to table
    { characterId: 'KidRabbit', position: { x: 410, y: 410 } },
    { characterId: 'PapaCat', position: { x: 120, y: 420 } },
    { characterId: 'MamaCat', position: { x: 200, y: 420 } },
    { characterId: 'PapaRabbit', position: { x: 840, y: 420 } },
    { characterId: 'MamaRabbit', position: { x: 760, y: 420 } },
    { characterId: 'BabyCat', position: { x: 330, y: 430 } },
  ],
};

// ------------------------------------------------------------------
// 7. Bedtime Layout
// ------------------------------------------------------------------
export const BedtimeLayout: LayoutDefinition = {
  name: 'Bedtime',
  backgroundColor: '#1e1b4b',
  backgroundGradient: ['#0f172a', '#1e1b4b'],
  objects: [
    { id: 'floor', type: 'counter', position: { x: 0, y: 390 }, width: 960, height: 150, color: '#475569', zIndex: 0 },
    { id: 'wall', type: 'counter', position: { x: 0, y: 0 }, width: 960, height: 390, color: '#1e1e3f', zIndex: 0 },
    { id: 'window', type: 'window', position: { x: 400, y: 50 }, width: 160, height: 120, color: '#1e293b', zIndex: 1 },
    { id: 'moon', type: 'moon', position: { x: 450, y: 70 }, width: 40, height: 40, color: '#fef08a', zIndex: 1 },
    { id: 'bed-left', type: 'bed', position: { x: 60, y: 300 }, width: 240, height: 110, color: '#3b82f6', zIndex: 2 },
    { id: 'bed-right', type: 'bed', position: { x: 660, y: 300 }, width: 240, height: 110, color: '#ec4899', zIndex: 2 },
    { id: 'lamp', type: 'lamp', position: { x: 460, y: 290 }, width: 40, height: 100, color: '#fbbf24', zIndex: 2 },
  ],
  spawnPoints: [
    { characterId: 'KidCat', position: { x: 175, y: 365 } }, // in bed left (mattress level)
    { characterId: 'KidRabbit', position: { x: 775, y: 365 } }, // in bed right (mattress level)
    { characterId: 'MamaCat', position: { x: 340, y: 420 } },
    { characterId: 'PapaCat', position: { x: 580, y: 420 } },
  ],
};

// ------------------------------------------------------------------
// 8. Market / Bazaar Layout
// ------------------------------------------------------------------
export const MarketLayout: LayoutDefinition = {
  name: 'Market',
  backgroundColor: '#ffedd5',
  backgroundGradient: ['#fed7aa', '#ffedd5'],
  objects: [
    { id: 'sky', type: 'counter', position: { x: 0, y: 0 }, width: 960, height: 300, color: '#bae6fd', zIndex: 0 },
    { id: 'ground', type: 'counter', position: { x: 0, y: 300 }, width: 960, height: 240, color: '#92400e', zIndex: 0 },
    { id: 'stall-left', type: 'stall', position: { x: 80, y: 160 }, width: 240, height: 170, color: '#eab308', zIndex: 2 },
    { id: 'stall-right', type: 'stall', position: { x: 640, y: 160 }, width: 240, height: 170, color: '#f97316', zIndex: 2 },
    { id: 'umbrella-left', type: 'umbrella', position: { x: 60, y: 90 }, width: 280, height: 90, color: '#ef4444', zIndex: 3 },
    { id: 'umbrella-right', type: 'umbrella', position: { x: 620, y: 90 }, width: 280, height: 90, color: '#3b82f6', zIndex: 3 },
    { id: 'basket-1', type: 'basket', position: { x: 140, y: 300 }, width: 50, height: 40, color: '#d97706', zIndex: 3 },
    { id: 'basket-2', type: 'basket', position: { x: 720, y: 300 }, width: 50, height: 40, color: '#d97706', zIndex: 3 },
    { id: 'tree-left', type: 'window', position: { x: -40, y: 80 }, width: 100, height: 240, color: '#16a34a', zIndex: 1 },
    { id: 'tree-right', type: 'window', position: { x: 900, y: 80 }, width: 100, height: 240, color: '#16a34a', zIndex: 1 },
  ],
  spawnPoints: [
    { characterId: 'MamaCat', position: { x: 180, y: 330 } }, // seller left stall
    { characterId: 'PapaRabbit', position: { x: 740, y: 330 } }, // seller right stall
    { characterId: 'KidCat', position: { x: 420, y: 390 } }, // shopper
    { characterId: 'KidRabbit', position: { x: 500, y: 395 } }, // shopper
    { characterId: 'GrandpaCat', position: { x: 340, y: 390 } }, // shopper
  ],
};

// ------------------------------------------------------------------
// Layout Registry
// ------------------------------------------------------------------
export const LAYOUTS: Record<string, LayoutDefinition> = {
  Kitchen: KitchenLayout,
  Garden: GardenLayout,
  'Living Room': LivingRoomLayout,
  Park: ParkLayout,
  School: SchoolLayout,
  'Birthday Party': BirthdayPartyLayout,
  Bedtime: BedtimeLayout,
  Market: MarketLayout,
};

export function getLayout(name: string): LayoutDefinition {
  const layout = LAYOUTS[name];
  if (!layout) {
    console.warn(`[LayoutEngine] Layout "${name}" not found, falling back to Kitchen.`);
    return KitchenLayout;
  }
  return layout;
}
