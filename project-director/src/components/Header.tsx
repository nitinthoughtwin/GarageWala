// =============================================================
// Header Component (Phase 2)
// App title + preset topic selector + prompt input + buttons
// =============================================================

import React, { useState } from 'react';

interface HeaderProps {
  onGenerate: (prompt: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onExport: () => void;
  isPlaying: boolean;
  isReady: boolean;
}

const PRESETS = [
  { label: '🍳 Kitchen Breakfast', prompt: 'Cat family is eating breakfast.' },
  { label: '🏏 Garden Cricket', prompt: 'Cat family is playing cricket in the garden' },
  { label: '🛋️ Living Room Gathering', prompt: 'Cat family and Rabbit family meeting in Living Room' },
  { label: '🌳 Park Picnic', prompt: 'Family picnic in the park' },
  { label: '🏫 School Classroom', prompt: 'Kids learning ABC at school' },
  { label: '🎉 Birthday Party', prompt: 'Kid Cat celebrating birthday party' },
  { label: '🌙 Bedtime Sleep', prompt: 'Goodnight and sleeping routine bedtime' },
  { label: '🍎 Market Bazaar', prompt: 'Buying apples at market bazaar' },
];

export const Header: React.FC<HeaderProps> = ({
  onGenerate,
  onPlay,
  onPause,
  onReset,
  onExport,
  isPlaying,
  isReady,
}) => {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Simulate async processing with short delay for UX feedback
    await new Promise((r) => setTimeout(r, 600));
    onGenerate(prompt.trim());
    setIsGenerating(false);
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      setPrompt(e.target.value);
    }
  };

  return (
    <header className="header-bar flex flex-col md:flex-row md:items-center justify-between gap-4 h-auto py-3 md:h-20 px-6">
      {/* Brand */}
      <div className="brand flex items-center gap-3">
        <div className="brand-icon text-3xl">🎬</div>
        <div className="brand-text">
          <h1 className="brand-title text-xl font-bold">Project Director</h1>
          <p className="brand-tagline text-[10px] tracking-wider uppercase text-slate-500">AI Directed 2D Cartoon Engine</p>
        </div>
      </div>

      {/* Preset & Prompt Input Area */}
      <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full max-w-4xl">
        {/* Preset Selector */}
        <div className="flex items-center bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1">
          <span className="text-sm mr-2 text-slate-400">Topic Presets:</span>
          <select
            className="bg-transparent text-sm text-amber-400 font-semibold focus:outline-none cursor-pointer pr-4"
            onChange={handlePresetChange}
            value={PRESETS.find(p => p.prompt === prompt)?.prompt || ''}
          >
            <option value="" disabled className="bg-slate-950 text-slate-400">-- Choose Topic --</option>
            {PRESETS.map((p, idx) => (
              <option key={idx} value={p.prompt} className="bg-slate-950 text-slate-200">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Input */}
        <div className="prompt-input-wrap flex-1 flex items-center gap-3 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1">
          <span className="prompt-label">📝</span>
          <input
            id="prompt-input"
            type="text"
            className="prompt-input bg-transparent w-full focus:outline-none text-sm text-slate-200"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Describe your scene… e.g. Cat family is eating breakfast."
          />
        </div>
      </div>

      {/* Controls */}
      <div className="controls flex gap-2">
        <button
          id="btn-generate"
          className={`btn btn-primary px-4 py-2 text-sm font-semibold rounded-lg ${isGenerating ? 'btn-loading' : ''}`}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner mr-2" />
              <span>Generating…</span>
            </>
          ) : (
            <>✨ Generate</>
          )}
        </button>

        <button
          id="btn-play"
          className="btn btn-success px-4 py-2 text-sm font-semibold rounded-lg"
          onClick={isPlaying ? onPause : onPlay}
          disabled={!isReady}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          id="btn-reset"
          className="btn btn-ghost px-4 py-2 text-sm font-semibold rounded-lg"
          onClick={onReset}
          disabled={!isReady}
        >
          ↺ Reset
        </button>

        <button
          id="btn-export"
          className="btn px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
          onClick={onExport}
          disabled={!isReady}
        >
          💾 Export
        </button>
      </div>
    </header>
  );
};
