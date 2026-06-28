// =============================================================
// Scene Compiler
// The heart of the engine.
// Converts a SceneJSON (AI output) into a CompiledScene
// (executable by the renderer) without any AI coordinate control.
// =============================================================

import type {
  SceneJSON,
  CompiledScene,
  TimelineEvent,
  CharacterState,
} from '../types';
import { getLayout } from '../layout/layouts';
import { createCharacterState } from '../characters/CharacterLibrary';
import { DirectorPlanner } from '../story/DirectorPlanner';

let eventIdCounter = 0;
function nextId(): string {
  return `evt-${++eventIdCounter}`;
}

export class SceneCompiler {
  private directorPlanner = new DirectorPlanner();

  compile(sceneJSON: SceneJSON): CompiledScene {
    console.log('[SceneCompiler] Compiling scene:', sceneJSON.scene);

    // 1. Resolve layout
    const layout = getLayout(sceneJSON.scene);
    console.log(`[SceneCompiler] Layout resolved: ${layout.name} (${layout.objects.length} objects)`);

    // 2. Spawn characters at their spawn points
    const characters: CharacterState[] = sceneJSON.characters.map((charDef) => {
      const spawnPoint = layout.spawnPoints.find((sp) => sp.characterId === charDef.id);
      const position   = spawnPoint?.position ?? { x: 200, y: 310 };
      const state      = createCharacterState(charDef.id, position);
      console.log(`[SceneCompiler] Spawned ${charDef.id} at (${position.x}, ${position.y})`);
      return state;
    });

    // 3. Build timeline events from character actions
    const timelineEvents: TimelineEvent[] = [];
    for (const charDef of sceneJSON.characters) {
      for (const action of charDef.actions) {
        timelineEvents.push({
          id: nextId(),
          characterId: charDef.id,
          animation: action.animation,
          start: action.start,
          end: action.end,
        });
        console.log(
          `[SceneCompiler] Event: ${charDef.id} → ${action.animation} [${action.start}s – ${action.end}s]`,
        );
      }
    }

    // 4. Get camera events from Director Planner
    const cameraEvents = this.directorPlanner.plan(sceneJSON);

    // 5. Return compiled scene
    const compiled: CompiledScene = {
      layout,
      characters,
      timelineEvents,
      cameraEvents,
      duration: sceneJSON.duration,
    };

    console.log('[SceneCompiler] Compilation complete.');
    return compiled;
  }
}
