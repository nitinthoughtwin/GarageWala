// =============================================================
// Story Planner — Mocked AI Director Layer
// Converts a user prompt into a high-level StoryPlan.
// In Phase 2, replace the mock with a real LLM call.
// =============================================================

import type { StoryPlan } from '../types';

const MOCK_PLANS: Record<string, StoryPlan> = {
  default: {
    title: 'Cat Family Breakfast',
    scenes: [
      {
        id: 'scene-1',
        name: 'Kitchen',
        description:
          'The cat family gathers in the kitchen for breakfast. Papa Cat walks to the table and sits. Mama Cat cooks at the stove. Kid Cat waves cheerfully.',
        durationHint: 12,
      },
    ],
  },
  cricket: {
    title: 'Cat Family Cricket Match',
    scenes: [
      {
        id: 'scene-1',
        name: 'Garden',
        description:
          'A sunny day in the garden! Papa Cat opens the batting, taking a mighty stance at the crease. Mama Cat runs up and delivers a fast bowl. Kid Cat fields at the boundary, ready to take a catch. Papa hits a big shot and the family celebrates!',
        durationHint: 14,
      },
    ],
  },
};

export class StoryPlanner {
  plan(prompt: string): StoryPlan {
    console.log('[StoryPlanner] Planning story for prompt:', prompt);

    // Detect keywords to route to the right mock plan
    const lp = prompt.toLowerCase();
    let key = 'default';
    if (lp.includes('cricket') || lp.includes('garden') || lp.includes('bat') || lp.includes('bowl')) {
      key = 'cricket';
    }
    const plan = MOCK_PLANS[key] ?? MOCK_PLANS['default'];

    console.log('[StoryPlanner] Story plan created:', plan.title);
    return plan;
  }

  formatStoryText(plan: StoryPlan): string {
    const lines: string[] = [`📖 ${plan.title}`, ''];
    plan.scenes.forEach((scene, i) => {
      lines.push(`Scene ${i + 1}: ${scene.name}`);
      lines.push(scene.description);
      lines.push(`Duration: ${scene.durationHint}s`);
      lines.push('');
    });
    return lines.join('\n');
  }
}
