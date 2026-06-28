// =============================================================
// Header Component
// App title + prompt input + Generate/Play/Pause/Reset buttons
// =============================================================

import React, { useState } from 'react';

interface HeaderProps {
  onGenerate: (prompt: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  isPlaying: boolean;
  isReady: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onGenerate,
  onPlay,
  onPause,
  onReset,
  isPlaying,
  isReady,
}) => {
  const [prompt, setPrompt] = useState('Cat family is eating breakfast.');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Simulate async processing with short delay for UX feedback
    await new Promise((r) => setTimeout(r, 600));
    onGenerate(prompt.trim());
    setIsGenerating(false);
  };

  return (
    <header className="header-bar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-icon">🎬</div>
        <div className="brand-text">
          <h1 className="brand-title">Project Director</h1>
          <p className="brand-tagline">AI Directed 2D Cartoon Engine</p>
        </div>
      </div>

      {/* Prompt Area */}
      <div className="prompt-area">
        <div className="prompt-input-wrap">
          <span className="prompt-label">📝</span>
          <input
            id="prompt-input"
            type="text"
            className="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Describe your scene… e.g. Cat family is eating breakfast."
          />
        </div>

        {/* Controls */}
        <div className="controls">
          <button
            id="btn-generate"
            className={`btn btn-primary ${isGenerating ? 'btn-loading' : ''}`}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner" />
                <span>Generating…</span>
              </>
            ) : (
              <>✨ Generate</>
            )}
          </button>

          <button
            id="btn-play"
            className="btn btn-success"
            onClick={isPlaying ? onPause : onPlay}
            disabled={!isReady}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            id="btn-reset"
            className="btn btn-ghost"
            onClick={onReset}
            disabled={!isReady}
          >
            ↺ Reset
          </button>
        </div>
      </div>
    </header>
  );
};
