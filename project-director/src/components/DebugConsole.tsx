// =============================================================
// DebugConsole Component
// Live updating debug panel showing engine internals
// =============================================================

import React from 'react';
import type { DebugState } from '../types';

interface DebugConsoleProps {
  state: DebugState | null;
}

const ANIMATION_COLORS: Record<string, string> = {
  idle:      '#94a3b8',
  walk:      '#60a5fa',
  sit:       '#a78bfa',
  eat:       '#f97316',
  wave:      '#34d399',
  cook:      '#f59e0b',
  talk:      '#ec4899',
  blink:     '#94a3b8',
  // Cricket
  bat:       '#fbbf24',
  bowl:      '#f43f5e',
  field:     '#10b981',
  run:       '#3b82f6',
  celebrate: '#a855f7',
  cheer:     '#06b6d4',
};

const CAMERA_COLORS: Record<string, string> = {
  Wide:   '#60a5fa',
  Medium: '#f59e0b',
  Close:  '#ef4444',
};

export const DebugConsole: React.FC<DebugConsoleProps> = ({ state }) => {
  if (!state) {
    return (
      <div className="debug-console debug-empty">
        <div className="debug-icon">🔍</div>
        <p>Generate a scene to see debug data</p>
      </div>
    );
  }

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <div className="debug-console">
      {/* Status bar */}
      <div className="debug-row debug-status">
        <span className={`status-dot ${state.isPlaying ? 'status-playing' : 'status-paused'}`} />
        <span className="debug-label">{state.isPlaying ? 'PLAYING' : 'PAUSED'}</span>
        <span className="debug-fps">
          <span className="fps-value">{state.fps}</span> FPS
        </span>
      </div>

      {/* Scene */}
      <div className="debug-row">
        <span className="debug-key">Scene</span>
        <span className="debug-val debug-scene">{state.currentScene}</span>
      </div>

      {/* Camera */}
      <div className="debug-row">
        <span className="debug-key">Camera</span>
        <span
          className="debug-val debug-badge"
          style={{ color: CAMERA_COLORS[state.currentCamera] ?? '#fff' }}
        >
          {state.currentCamera}
        </span>
      </div>

      {/* Time */}
      <div className="debug-row">
        <span className="debug-key">Time</span>
        <span className="debug-val">
          {state.currentTime.toFixed(2)}s / {state.duration.toFixed(0)}s
        </span>
      </div>

      {/* Progress bar */}
      <div className="debug-progress-wrap">
        <div className="debug-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Characters */}
      <div className="debug-section-title">Characters</div>
      {state.characters.map((char) => (
        <div key={char.id} className="debug-char-row">
          <span className="debug-char-id">{char.id}</span>
          <span
            className="debug-anim-badge"
            style={{ backgroundColor: `${ANIMATION_COLORS[char.animation] ?? '#64748b'}22`,
                     color: ANIMATION_COLORS[char.animation] ?? '#94a3b8',
                     borderColor: `${ANIMATION_COLORS[char.animation] ?? '#64748b'}44` }}
          >
            {char.animation}
          </span>
          <span className="debug-pos">
            ({Math.round(char.position.x)}, {Math.round(char.position.y)})
          </span>
        </div>
      ))}
    </div>
  );
};
