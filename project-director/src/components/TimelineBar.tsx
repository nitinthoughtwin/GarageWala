// =============================================================
// TimelineBar Component (Phase 4 — Multi-Scene)
// Visual timeline showing character animation tracks across all scenes
// with scene break indicators and click-to-seek support.
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
  PapaCat:    '#f59e0b',
  MamaCat:    '#f97316',
  KidCat:     '#a3e635',
  GrandpaCat: '#94a3b8',
  BabyCat:    '#fde68a',
  PapaRabbit: '#60a5fa',
  MamaRabbit: '#f472b6',
  KidRabbit:  '#34d399',
  // backward compatibility
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
  // Phase 2
  jump:      '#16a34a',
  dance:     '#d946ef',
  sleep:     '#1e1b4b',
  think:     '#f59e0b',
  point:     '#f43f5e',
  angry:     '#e11d48',
  surprised: '#a855f7',
  hop:       '#10b981',
  garden:    '#059669',
  read:      '#b45309',
  crawl:     '#60a5fa',
  doze:      '#475569',
  'limp-walk': '#475569',
  giggle:    '#a855f7',
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

  // Get all unique character IDs across all scenes
  const allCharIds = Array.from(
    new Set(sceneJSONs.flatMap((s) => s.characters.map((c) => c.id)))
  );

  // Compute scene offsets
  const sceneOffsets: number[] = [];
  let currentOffset = 0;
  sceneJSONs.forEach((scene) => {
    sceneOffsets.push(currentOffset);
    currentOffset += scene.duration;
  });

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="timeline-container">
      {/* Time ruler */}
      <div className="timeline-ruler">
        {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => {
          // Only draw label every 5 seconds to avoid clutter
          const showLabel = i % 5 === 0 || i === Math.ceil(duration);
          return (
            <div
              key={i}
              className="timeline-tick"
              style={{ left: `${(i / duration) * 100}%` }}
            >
              {showLabel && <span className="tick-label">{i}s</span>}
            </div>
          );
        })}
      </div>

      {/* Tracks */}
      <div
        id="timeline-track-area"
        ref={trackAreaRef}
        className="timeline-track-area relative overflow-hidden"
        onClick={handleClick}
      >
        {/* Render Scene dividers in background */}
        {sceneJSONs.map((scene, idx) => {
          const leftPercent = (sceneOffsets[idx] / duration) * 100;
          return (
            <div
              key={idx}
              className="absolute top-0 bottom-0 border-l border-dashed border-white/20 z-10 pointer-events-none"
              style={{ left: `${leftPercent}%` }}
            >
              <span className="absolute top-1 left-2 text-[9px] font-bold text-white/40 tracking-wider uppercase whitespace-nowrap bg-slate-950/80 px-1 rounded">
                🎬 {scene.scene}
              </span>
            </div>
          );
        })}

        {allCharIds.map((charId) => (
          <div key={charId} className="timeline-track">
            {/* Track label */}
            <div
              className="track-label"
              style={{ color: TRACK_COLORS[charId] ?? '#94a3b8' }}
            >
              {charId.replace('Cat', '').replace('Rabbit', '')}
            </div>

            {/* Animation blocks */}
            <div className="track-blocks relative">
              {sceneJSONs.map((scene, sceneIdx) => {
                const charDef = scene.characters.find((c) => c.id === charId);
                if (!charDef) return null;

                const offset = sceneOffsets[sceneIdx];

                return (
                  <React.Fragment key={sceneIdx}>
                    {charDef.actions.map((action, actionIdx) => {
                      const absoluteStart = offset + action.start;
                      const absoluteEnd = offset + action.end;
                      const left = (absoluteStart / duration) * 100;
                      const width = ((absoluteEnd - absoluteStart) / duration) * 100;

                      return (
                        <div
                          key={`${sceneIdx}-${actionIdx}`}
                          className="track-block"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: ANIM_COLORS[action.animation] ?? '#374151',
                          }}
                          title={`${charId}: ${action.animation} (${absoluteStart.toFixed(1)}s–${absoluteEnd.toFixed(1)}s)`}
                        >
                          <span className="track-block-label">{action.animation}</span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}

        {/* Playhead */}
        <div
          className="timeline-playhead z-20"
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
