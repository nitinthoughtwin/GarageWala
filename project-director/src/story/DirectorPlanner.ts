// =============================================================
// Director Planner — Mocked AI Director Layer (Phase 2)
// Decides camera shot scheduling for all Phase 2 layouts.
// Injects cinematic camera cuts automatically.
// =============================================================

import type { SceneJSON, CameraTimelineEvent, CameraShot } from '../types';

export class DirectorPlanner {
  plan(scene: SceneJSON): CameraTimelineEvent[] {
    console.log('[DirectorPlanner] Planning camera shots for scene:', scene.scene);

    const events: CameraTimelineEvent[] = this.buildCameraSchedule(scene);

    events.forEach((e) => {
      console.log(
        `[DirectorPlanner] Camera "${e.shot}" from ${e.start}s to ${e.end}s` +
        (e.focusCharacter ? ` (focus: ${e.focusCharacter})` : '')
      );
    });

    return events;
  }

  private buildCameraSchedule(scene: SceneJSON): CameraTimelineEvent[] {
    const d = scene.duration;
    let plan: Array<{ shot: CameraShot; start: number; end: number; focus?: string }> = [];

    const name = scene.scene;

    if (name === 'Garden') {
      plan = [
        { shot: 'Wide',   start: 0,   end: 2,  focus: undefined },
        { shot: 'Medium', start: 2,   end: 4,  focus: 'PapaRabbit' },
        { shot: 'Wide',   start: 4,   end: 5,  focus: undefined },
        { shot: 'Medium', start: 5,   end: 7,  focus: 'MamaRabbit' },
        { shot: 'Close',  start: 7,   end: 9,  focus: 'PapaRabbit' },
        { shot: 'Wide',   start: 9,   end: 11, focus: undefined },
        { shot: 'Medium', start: 11,  end: 13, focus: 'KidRabbit' },
        { shot: 'Wide',   start: 13,  end: d,  focus: undefined },
      ];
    } else if (name === 'Living Room') {
      plan = [
        { shot: 'Wide',   start: 0,   end: 3,  focus: undefined },
        { shot: 'Medium', start: 3,   end: 7,  focus: 'KidCat' },
        { shot: 'Close',  start: 7,   end: 11, focus: 'BabyCat' },
        { shot: 'Wide',   start: 11,  end: d,  focus: undefined },
      ];
    } else if (name === 'Park') {
      plan = [
        { shot: 'Wide',   start: 0,   end: 3,  focus: undefined },
        { shot: 'Medium', start: 3,   end: 7,  focus: 'KidRabbit' },
        { shot: 'Medium', start: 7,   end: 11, focus: 'KidCat' },
        { shot: 'Wide',   start: 11,  end: d,  focus: undefined },
      ];
    } else if (name === 'School') {
      plan = [
        { shot: 'Wide',   start: 0,   end: 3,  focus: undefined },
        { shot: 'Medium', start: 3,   end: 7,  focus: 'MamaCat' },
        { shot: 'Close',  start: 7,   end: 10, focus: 'KidCat' },
        { shot: 'Wide',   start: 10,  end: d,  focus: undefined },
      ];
    } else if (name === 'Birthday Party') {
      plan = [
        { shot: 'Wide',   start: 0,   end: 3,  focus: undefined },
        { shot: 'Medium', start: 3,   end: 7,  focus: 'KidCat' },
        { shot: 'Close',  start: 7,   end: 10, focus: 'KidRabbit' },
        { shot: 'Wide',   start: 10,  end: d,  focus: undefined },
      ];
    } else if (name === 'Bedtime') {
      plan = [
        { shot: 'Wide',   start: 0,   end: 3,  focus: undefined },
        { shot: 'Medium', start: 3,   end: 7,  focus: 'KidCat' },
        { shot: 'Medium', start: 7,   end: 10, focus: 'KidRabbit' },
        { shot: 'Wide',   start: 10,  end: d,  focus: undefined },
      ];
    } else if (name === 'Market') {
      plan = [
        { shot: 'Wide',   start: 0,   end: 3,  focus: undefined },
        { shot: 'Medium', start: 3,   end: 7,  focus: 'MamaCat' },
        { shot: 'Medium', start: 7,   end: 11, focus: 'PapaRabbit' },
        { shot: 'Wide',   start: 11,  end: d,  focus: undefined },
      ];
    } else {
      // Kitchen / Default
      plan = [
        { shot: 'Wide',   start: 0,   end: 3,  focus: undefined },
        { shot: 'Medium', start: 3,   end: 5,  focus: 'PapaCat' },
        { shot: 'Wide',   start: 5,   end: 7,  focus: undefined },
        { shot: 'Medium', start: 7,   end: 9,  focus: 'MamaCat' },
        { shot: 'Close',  start: 9,   end: 11, focus: 'PapaCat' },
        { shot: 'Wide',   start: 11,  end: d,  focus: undefined },
      ];
    }

    const filtered = plan.filter((e) => e.start < d) as Array<{
      shot: CameraShot; start: number; end: number; focus?: string;
    }>;

    return filtered.map((e, i) => ({
      id: `cam-${i}`,
      shot: e.shot,
      start: e.start,
      end: Math.min(e.end, d),
      focusCharacter: e.focus,
    }));
  }
}
