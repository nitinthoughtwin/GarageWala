// =============================================================
// Scene Planner — Mocked & Procedural AI Director Layer (Phase 6)
// Converts a StoryPlan into detailed SceneJSON definitions.
// Generates character action tracks dynamically for custom prompts.
// =============================================================

import type { StoryPlan, SceneJSON, CharacterDef, CharacterActionDef } from '../types';
import { ALL_CHARACTER_PROFILES } from '../characters/CharacterRegistry';

const MOCK_SCENES: Record<string, SceneJSON> = {
  Kitchen: {
    scene: 'Kitchen',
    duration: 12,
    camera: 'Wide',
    characters: [
      {
        id: 'PapaCat',
        actions: [
          { animation: 'walk', start: 0, end: 3 },
          { animation: 'sit',  start: 3, end: 4 },
          { animation: 'eat',  start: 4, end: 12 },
        ],
      },
      {
        id: 'MamaCat',
        actions: [
          { animation: 'idle', start: 0, end: 1 },
          { animation: 'cook', start: 1, end: 12 },
        ],
      },
      {
        id: 'KidCat',
        actions: [
          { animation: 'idle', start: 0, end: 2 },
          { animation: 'wave', start: 2, end: 5 },
          { animation: 'idle', start: 5, end: 8 },
          { animation: 'eat',  start: 8, end: 12 },
        ],
      },
      {
        id: 'GrandpaCat',
        actions: [
          { animation: 'limp-walk', start: 0, end: 4 },
          { animation: 'sit',       start: 4, end: 5 },
          { animation: 'doze',      start: 5, end: 12 },
        ],
      },
      {
        id: 'BabyCat',
        actions: [
          { animation: 'crawl',  start: 0, end: 6 },
          { animation: 'giggle', start: 6, end: 12 },
        ],
      },
    ],
    dialogues: [
      { characterId: 'KidCat', text: 'Look Mama, I can wave with one hand!', start: 2, end: 5 },
      { characterId: 'PapaCat', text: 'Hmm... What a delicious breakfast!', start: 5.5, end: 8.5 },
      { characterId: 'MamaCat', text: 'Eat your pancakes, kids. I made them fresh!', start: 9, end: 12 },
    ],
  },
  Garden: {
    scene: 'Garden',
    duration: 14,
    camera: 'Wide',
    characters: [
      {
        id: 'PapaRabbit',
        actions: [
          { animation: 'idle',      start: 0,  end: 2  },
          { animation: 'bat',       start: 2,  end: 9  },
          { animation: 'run',       start: 9,  end: 11 },
          { animation: 'celebrate', start: 11, end: 14 },
        ],
      },
      {
        id: 'MamaRabbit',
        actions: [
          { animation: 'idle',  start: 0,  end: 2  },
          { animation: 'bowl',  start: 2,  end: 10 },
          { animation: 'field', start: 10, end: 12 },
          { animation: 'cheer', start: 12, end: 14 },
        ],
      },
      {
        id: 'KidRabbit',
        actions: [
          { animation: 'field',    start: 0,  end: 9  },
          { animation: 'run',      start: 9,  end: 11 },
          { animation: 'cheer',    start: 11, end: 14 },
        ],
      },
    ],
    dialogues: [
      { characterId: 'PapaRabbit', text: 'Watch out, here comes a huge hit!', start: 2, end: 5 },
      { characterId: 'MamaRabbit', text: 'Ready? Try to hit this fast ball!', start: 5.5, end: 8.5 },
      { characterId: 'KidRabbit', text: "I got it! I am chasing the ball!", start: 9, end: 11.5 },
    ],
  },
};

export class ScenePlanner {
  plan(storyPlan: StoryPlan): SceneJSON[] {
    console.log('[ScenePlanner] Converting story plan into scene JSONs...');

    return storyPlan.scenes.map((sceneDesc) => {
      // If story plan generated custom characters and dialogues procedurally
      if (sceneDesc.characterIds && sceneDesc.dialogues) {
        const characters: CharacterDef[] = sceneDesc.characterIds.map((charId) => {
          const actions = this.generateProceduralActions(charId, sceneDesc.name, sceneDesc.durationHint);
          return {
            id: charId,
            actions,
          };
        });

        return {
          scene: sceneDesc.name,
          duration: sceneDesc.durationHint,
          camera: 'Wide',
          characters,
          dialogues: sceneDesc.dialogues,
          transition: sceneDesc.transition,
        };
      }

      // Fallback presets
      const key = sceneDesc.name;
      const scene = MOCK_SCENES[key] ?? MOCK_SCENES['Kitchen'];
      return { 
        ...scene, 
        duration: sceneDesc.durationHint,
        transition: sceneDesc.transition,
      };
    });
  }

  /**
   * Dynamically build character animations based on character role and scene type.
   */
  private generateProceduralActions(
    charId: string,
    sceneName: string,
    duration: number
  ): CharacterActionDef[] {
    const profile = ALL_CHARACTER_PROFILES.find((p) => p.id === charId);
    const role = profile?.role ?? 'Child';
    const species = profile?.species ?? 'cat';

    const actions: CharacterActionDef[] = [];

    // 1. Initial movement (first 3s)
    if (role === 'Elder') {
      actions.push({ animation: 'limp-walk', start: 0, end: 3 });
    } else if (role === 'Baby') {
      actions.push({ animation: 'crawl', start: 0, end: 3 });
    } else if (sceneName === 'Garden' && role === 'Father') {
      actions.push({ animation: 'idle', start: 0, end: 2 });
    } else {
      actions.push({ animation: 'walk', start: 0, end: 3 });
    }

    // 2. Middle action (3s to duration - 3s)
    const midEnd = Math.max(3, duration - 3);

    if (sceneName === 'Kitchen' && role === 'Mother') {
      actions.push({ animation: 'cook', start: 3, end: midEnd });
    } else if (sceneName === 'Garden') {
      if (role === 'Father') actions.push({ animation: 'bat', start: 2, end: midEnd });
      else if (role === 'Mother') actions.push({ animation: 'bowl', start: 2, end: midEnd });
      else actions.push({ animation: 'field', start: 3, end: midEnd });
    } else if (sceneName === 'School') {
      if (role === 'Mother') actions.push({ animation: 'talk', start: 3, end: midEnd });
      else actions.push({ animation: 'think', start: 3, end: midEnd });
    } else if (sceneName === 'Park') {
      if (role === 'Mother') actions.push({ animation: 'garden', start: 3, end: midEnd });
      else if (role === 'Father') actions.push({ animation: 'read', start: 3, end: midEnd });
      else if (role === 'Elder') actions.push({ animation: 'sit', start: 3, end: midEnd });
      else actions.push({ animation: 'jump', start: 3, end: midEnd });
    } else if (sceneName === 'Bedtime') {
      if (role === 'Child') actions.push({ animation: 'sleep', start: 3, end: duration });
      else actions.push({ animation: 'talk', start: 3, end: midEnd });
    } else {
      // General signature animations
      let anim = profile?.signature ?? 'idle';
      if (anim === 'hop' && species !== 'rabbit') anim = 'jump';
      if (anim === 'crawl' && role !== 'Baby') anim = 'walk';
      actions.push({ animation: anim, start: 3, end: midEnd });
    }

    // 3. Ending celebration / cheer / sleep (last 3s)
    if (midEnd < duration) {
      if (sceneName === 'Bedtime') {
        actions.push({ animation: 'sleep', start: midEnd, end: duration });
      } else if (role === 'Child' || role === 'Baby') {
        actions.push({ animation: 'celebrate', start: midEnd, end: duration });
      } else if (role === 'Elder') {
        actions.push({ animation: 'doze', start: midEnd, end: duration });
      } else {
        actions.push({ animation: 'cheer', start: midEnd, end: duration });
      }
    }

    return actions;
  }
}
