// =============================================================
// Scene Planner — Mocked AI Director Layer
// Converts a StoryPlan into detailed SceneJSON definitions.
// In Phase 2, replace the mock with a real LLM call.
// =============================================================

import type { StoryPlan, SceneJSON } from '../types';

const MOCK_SCENES: Record<string, SceneJSON> = {
  Kitchen: {
    scene: 'Kitchen',
    duration: 12,
    camera: 'Wide',
    characters: [
      {
        id: 'Papa',
        actions: [
          { animation: 'walk', start: 0, end: 3 },
          { animation: 'sit',  start: 3, end: 4 },
          { animation: 'eat',  start: 4, end: 12 },
        ],
      },
      {
        id: 'Mama',
        actions: [
          { animation: 'idle', start: 0, end: 1 },
          { animation: 'cook', start: 1, end: 12 },
        ],
      },
      {
        id: 'Kid',
        actions: [
          { animation: 'idle', start: 0, end: 2 },
          { animation: 'wave', start: 2, end: 5 },
          { animation: 'idle', start: 5, end: 8 },
          { animation: 'eat',  start: 8, end: 12 },
        ],
      },
    ],
  },
  Garden: {
    scene: 'Garden',
    duration: 14,
    camera: 'Wide',
    characters: [
      {
        id: 'Papa',
        actions: [
          { animation: 'idle',      start: 0,  end: 2  },   // Takes stance
          { animation: 'bat',       start: 2,  end: 9  },   // Batting
          { animation: 'run',       start: 9,  end: 11 },   // Running between wickets
          { animation: 'celebrate', start: 11, end: 14 },   // Celebrates big hit
        ],
      },
      {
        id: 'Mama',
        actions: [
          { animation: 'idle',  start: 0,  end: 2  },   // Setting up
          { animation: 'bowl',  start: 2,  end: 10 },   // Bowling
          { animation: 'field', start: 10, end: 12 },   // Fielding after delivery
          { animation: 'cheer', start: 12, end: 14 },   // Cheering Papa's shot
        ],
      },
      {
        id: 'Kid',
        actions: [
          { animation: 'field',    start: 0,  end: 9  },   // Fielding at boundary
          { animation: 'run',      start: 9,  end: 11 },   // Chasing the ball
          { animation: 'cheer',    start: 11, end: 14 },   // Cheering with everyone
        ],
      },
    ],
  },
};

export class ScenePlanner {
  plan(storyPlan: StoryPlan): SceneJSON[] {
    console.log('[ScenePlanner] Converting story plan into scene JSONs...');

    return storyPlan.scenes.map((sceneDesc) => {
      const key = sceneDesc.name;
      const scene = MOCK_SCENES[key] ?? MOCK_SCENES['Kitchen'];
      console.log(`[ScenePlanner] Scene "${key}" planned.`);
      return { ...scene, duration: sceneDesc.durationHint };
    });
  }
}
