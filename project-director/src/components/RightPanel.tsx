// =============================================================
// Right Panel — Canvas + Timeline
// =============================================================

import React from 'react';
import type { SceneJSON, DebugState } from '../types';
import { TimelineBar } from './TimelineBar';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../layout/layouts';

interface RightPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  sceneJSONs: SceneJSON[];
  debugState: DebugState | null;
  isPlaying: boolean;
  isReady: boolean;
  isComplete: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  canvasRef,
  sceneJSONs,
  debugState,
  isPlaying,
  isReady,
  isComplete,
  onPlay,
  onPause,
  onReset,
  onSeek,
}) => {
  const currentTime = debugState?.currentTime ?? 0;
  const duration    = debugState?.duration ?? 0;

  return (
    <section className="right-panel">
      {/* Canvas area */}
      <div className="canvas-container">
        {/* Canvas header */}
        <div className="canvas-header">
          <div className="canvas-header-left">
            <span className="canvas-label">🎥 Animation Canvas</span>
            {debugState && (
              <span className="canvas-scene-tag">{debugState.currentScene}</span>
            )}
          </div>
          <div className="canvas-header-right">
            {debugState && (
              <>
                <span className="camera-badge">
                  📷 {debugState.currentCamera}
                </span>
                <span className="fps-badge">
                  {debugState.fps} FPS
                </span>
              </>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas-wrap">
          <canvas
            id="animation-canvas"
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="animation-canvas"
          />

          {/* Overlay when not ready */}
          {!isReady && (
            <div className="canvas-overlay">
              <div className="overlay-content">
                <div className="overlay-icon">🎬</div>
                <p className="overlay-title">Project Director</p>
                <p className="overlay-subtitle">
                  Enter a prompt and click Generate to begin
                </p>
              </div>
            </div>
          )}

          {/* Complete overlay */}
          {isComplete && (
            <div className="canvas-overlay canvas-overlay-complete">
              <div className="overlay-content">
                <div className="overlay-icon">🎉</div>
                <p className="overlay-title">Scene Complete!</p>
                <button className="btn btn-ghost" onClick={onReset}>
                  ↺ Watch Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Playback controls bar */}
        <div className="playback-bar">
          <button
            id="canvas-btn-reset"
            className="playback-btn"
            onClick={onReset}
            disabled={!isReady}
            title="Reset"
          >
            ⏮
          </button>
          <button
            id="canvas-btn-play"
            className={`playback-btn playback-btn-main ${isPlaying ? 'is-playing' : ''}`}
            onClick={isPlaying ? onPause : onPlay}
            disabled={!isReady}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Progress */}
          <div className="playback-progress">
            <div
              className="playback-fill"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>

          <span className="playback-time">
            {currentTime.toFixed(1)}s / {duration.toFixed(0)}s
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-section">
        <div className="timeline-section-header">
          <span>⏱ Timeline</span>
          <span className="timeline-hint">Click to seek</span>
        </div>
        <TimelineBar
          sceneJSONs={sceneJSONs}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          isPlaying={isPlaying}
        />
      </div>
    </section>
  );
};
