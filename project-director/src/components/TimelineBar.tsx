// =============================================================
// TimelineBar Component
// Visual timeline showing character animation tracks
// =============================================================

import React, { useRef, useCallback } from 'react';
import type { SceneJSON } from '../types';

interface TimelineBarProps {
  sceneJSONs: SceneJSON[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
}

const TRACK_COLORS: Record<string, string> = {
  Papa:  '#f59e0b',
  Mama:  '#f97316',
  Kid:   '#a3e635',
};

const ANIM_COLORS: Record<string, string> = {
  idle:      '#374151',
  walk:      '#1d4ed8',
  sit:       '#7c3aed',
  eat:       '#ea580c',
  wave:      '#059669',
  cook:      '#d97706',
  talk:      '#db2777',
  blink:     '#374151',
  // Cricket
  bat:       '#b45309',
  bowl:      '#be123c',
  field:     '#065f46',
  run:       '#1e3a8a',
  celebrate: '#6b21a8',
  cheer:     '#0e7490',
};

export const TimelineBar: React.FC<TimelineBarProps> = ({
  sceneJSONs,
  currentTime,
  duration,
  onSeek,
  isPlaying,
}) => {
  const trackAreaRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackAreaRef.current || duration === 0) return;
      const rect = trackAreaRef.current.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      onSeek(Math.max(0, Math.min(ratio * duration, duration)));
    },
    [duration, onSeek],
  );

  if (!sceneJSONs.length || duration === 0) {
    return (
      <div className="timeline-empty">
        <span>Timeline will appear after generation</span>
      </div>
    );
  }

  const scene = sceneJSONs[0];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="timeline-container">
      {/* Time ruler */}
      <div className="timeline-ruler">
        {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
          <div
            key={i}
            className="timeline-tick"
            style={{ left: `${(i / duration) * 100}%` }}
          >
            <span className="tick-label">{i}s</span>
          </div>
        ))}
      </div>

      {/* Tracks */}
      <div
        id="timeline-track-area"
        ref={trackAreaRef}
        className="timeline-track-area"
        onClick={handleClick}
      >
        {scene.characters.map((char) => (
          <div key={char.id} className="timeline-track">
            {/* Track label */}
            <div
              className="track-label"
              style={{ color: TRACK_COLORS[char.id] ?? '#94a3b8' }}
            >
              {char.id}
            </div>

            {/* Animation blocks */}
            <div className="track-blocks">
              {char.actions.map((action, idx) => {
                const left  = (action.start / duration) * 100;
                const width = ((action.end - action.start) / duration) * 100;
                return (
                  <div
                    key={idx}
                    className="track-block"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: ANIM_COLORS[action.animation] ?? '#374151',
                    }}
                    title={`${char.id}: ${action.animation} (${action.start}s–${action.end}s)`}
                  >
                    <span className="track-block-label">{action.animation}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Playhead */}
        <div
          className="timeline-playhead"
          style={{ left: `${progress}%` }}
        >
          <div className="playhead-head" />
          <div className="playhead-line" />
        </div>
      </div>

      {/* Time display */}
      <div className="timeline-footer">
        <span className="time-display">
          {currentTime.toFixed(2)}s
        </span>
        <span className={`playback-status ${isPlaying ? 'status-play' : 'status-stop'}`}>
          {isPlaying ? '▶ Playing' : '■ Stopped'}
        </span>
        <span className="time-display">{duration.toFixed(0)}s</span>
      </div>
    </div>
  );
};
