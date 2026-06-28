// =============================================================
// Animation Library — Stateless animation state resolver
// Given a CharacterState + current time, returns the updated
// position/animation for that frame.
// Kept separate from CharacterLibrary (drawing) and
// TimelineEngine (scheduling).
// =============================================================

import type { CharacterState, AnimationName, Vec2 } from '../types';

// Walk speed in pixels/second
const WALK_SPEED = 80;

export class AnimationLibrary {
  /**
   * Advances a character's state based on current animation and delta time.
   * Returns a NEW CharacterState — never mutates.
   */
  tick(
    state: CharacterState,
    currentTime: number,
    deltaTime: number,
    targetPositionOverride?: Vec2,
  ): CharacterState {
    const next = { ...state, position: { ...state.position } };

    // If there's a target position (for walk), move toward it
    if (targetPositionOverride) {
      next.targetPosition = { ...targetPositionOverride };
    }

    if (next.currentAnimation === 'walk' && next.targetPosition) {
      const dx = next.targetPosition.x - next.position.x;
      const dy = next.targetPosition.y - next.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 2) {
        const speed = WALK_SPEED * deltaTime;
        const ratio = Math.min(speed / dist, 1);
        next.position.x += dx * ratio;
        next.position.y += dy * ratio;
        next.facingRight = dx > 0;
      }
    }

    // Blink overlay — always running regardless of main animation
    const blinkPhase = (currentTime % 3.5) < 0.12;
    next.animationProgress = blinkPhase ? 1 : 0;

    return next;
  }

  /**
   * Resolves the walk target for a character transitioning to 'sit'.
   * Returns the chair position from the layout.
   */
  getSitTarget(characterId: string, layoutObjects: { id: string; position: Vec2 }[]): Vec2 | undefined {
    // Map characters to their chairs
    const chairMap: Record<string, string> = {
      Papa: 'chair-left',
      PapaCat: 'chair-left',
      GrandpaCat: 'chair-left',
      Kid:  'chair-right',
      KidCat:  'chair-right',
      KidRabbit: 'chair-right',
    };
    const chairId = chairMap[characterId];
    if (!chairId) return undefined;

    const chair = layoutObjects.find((o) => o.id === chairId);
    if (!chair) return undefined;

    return { x: chair.position.x + 30, y: chair.position.y + 40 };
  }

  /**
   * Returns true if animation is a "stationary" animation
   * (character doesn't move from their position)
   */
  isStationary(animation: AnimationName): boolean {
    return ['idle', 'sit', 'eat', 'wave', 'cook', 'talk', 'blink'].includes(animation);
  }
}
