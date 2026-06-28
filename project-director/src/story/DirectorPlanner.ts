// =============================================================
// Director Planner — Mocked AI Director Layer
// Decides camera shot scheduling for a given SceneJSON.
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
        (e.focusCharacter ? ` (focus: ${e.focusCharacter})` : ''),
      );
    });

    return events;
  }

  private buildCameraSchedule(scene: SceneJSON): CameraTimelineEvent[] {
    const d = scene.duration;

    let plan: Array<{ shot: CameraShot; start: number; end: number; focus?: string }>;

    if (scene.scene === 'Garden') {
      // Cricket-specific cinematic camera plan
      plan = [
        { shot: 'Wide',   start: 0,   end: 2,  focus: undefined },  // Establishing — garden wide
        { shot: 'Medium', start: 2,   end: 4,  focus: 'Papa'    },  // Papa takes stance
        { shot: 'Wide',   start: 4,   end: 5,  focus: undefined },  // See bowler running up
        { shot: 'Medium', start: 5,   end: 7,  focus: 'Mama'    },  // Mama bowling close
        { shot: 'Close',  start: 7,   end: 9,  focus: 'Papa'    },  // Papa's bat swing extreme close
        { shot: 'Wide',   start: 9,   end: 11, focus: undefined },  // Running between wickets
        { shot: 'Medium', start: 11,  end: 13, focus: 'Kid'     },  // Kid cheering
        { shot: 'Wide',   start: 13,  end: d,  focus: undefined },  // Final celebration wide
      ];
    } else {
      // Default kitchen camera plan
      plan = [
        { shot: 'Wide',   start: 0,   end: 3,  focus: undefined },  // Establishing shot
        { shot: 'Medium', start: 3,   end: 5,  focus: 'Papa'    },  // Papa sits
        { shot: 'Wide',   start: 5,   end: 7,  focus: undefined },  // See everyone
        { shot: 'Medium', start: 7,   end: 9,  focus: 'Mama'    },  // Mama cooking
        { shot: 'Close',  start: 9,   end: 11, focus: 'Papa'    },  // Papa eating close
        { shot: 'Wide',   start: 11,  end: d,  focus: undefined },  // Outro wide
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
