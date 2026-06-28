// =============================================================
// Timeline Engine
// Manages the flat list of animation events and camera events.
// tick(time) → returns the set of active events at that moment.
// =============================================================

import type { TimelineEvent, CameraTimelineEvent, AnimationName, CameraShot } from '../types';

export interface ActiveAnimations {
  [characterId: string]: AnimationName;
}

export interface ActiveCamera {
  shot: CameraShot;
  focusCharacter?: string;
}

export class TimelineEngine {
  private events: TimelineEvent[] = [];
  private cameraEvents: CameraTimelineEvent[] = [];
  public duration: number = 0;

  load(events: TimelineEvent[], cameraEvents: CameraTimelineEvent[], duration: number): void {
    this.events = events;
    this.cameraEvents = cameraEvents;
    this.duration = duration;
    console.log(`[TimelineEngine] Loaded ${events.length} animation events, ${cameraEvents.length} camera events. Duration: ${duration}s`);
  }

  /**
   * Returns the active animation for each character at the given time.
   */
  getActiveAnimations(time: number): ActiveAnimations {
    const result: ActiveAnimations = {};

    for (const event of this.events) {
      if (time >= event.start && time < event.end) {
        result[event.characterId] = event.animation;
      }
    }

    return result;
  }

  /**
   * Returns the active camera shot at the given time.
   */
  getActiveCamera(time: number): ActiveCamera {
    for (const event of this.cameraEvents) {
      if (time >= event.start && time < event.end) {
        return { shot: event.shot, focusCharacter: event.focusCharacter };
      }
    }
    return { shot: 'Wide' };
  }

  /**
   * Returns all events for a given character (for timeline visualization).
   */
  getCharacterEvents(characterId: string): TimelineEvent[] {
    return this.events.filter((e) => e.characterId === characterId);
  }

  /**
   * Returns all unique character IDs in the timeline.
   */
  getCharacterIds(): string[] {
    return [...new Set(this.events.map((e) => e.characterId))];
  }

  reset(): void {
    console.log('[TimelineEngine] Reset');
  }
}
