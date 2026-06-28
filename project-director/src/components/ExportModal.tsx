// =============================================================
// ExportModal Component (Phase 5)
// Allows selecting aspect ratio and displays export progress.
// Captures and downloads the recorded WebM file.
// =============================================================

import React, { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExport: (ratio: '16:9' | '9:16', onProgress: (p: number) => void, onComplete: (url: string) => void) => void;
  onCancelExport: () => void;
}

type ExportState = 'idle' | 'exporting' | 'complete';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onStartExport,
  onCancelExport,
}) => {
  const [ratio, setRatio] = useState<'16:9' | '9:16'>('16:9');
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleStart = () => {
    setExportState('exporting');
    setProgress(0);

    onStartExport(
      ratio,
      (p) => {
        setProgress(p);
      },
      (blobUrl) => {
        setExportState('complete');
        
        // Auto trigger download
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `project-director-cartoon-${ratio.replace(':', 'x')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    );
  };

  const handleCancel = () => {
    onCancelExport();
    setExportState('idle');
    setProgress(0);
    onClose();
  };

  const handleClose = () => {
    setExportState('idle');
    setProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/90 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col items-center">
        {/* Decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-xl font-bold text-slate-100 mb-2">💾 Export Cartoon Episode</h2>
        
        {exportState === 'idle' && (
          <div className="w-full flex flex-col items-center">
            <p className="text-sm text-slate-400 text-center mb-6">
              Choose your format size. The director will record the scene frame-by-frame.
            </p>

            {/* Ratio selection */}
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <button
                className={`flex flex-col items-center justify-center p-4 border rounded-xl transition ${
                  ratio === '16:9'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                }`}
                onClick={() => setRatio('16:9')}
              >
                <div className="text-2xl mb-1">🖥️</div>
                <span className="font-bold text-sm">Widescreen</span>
                <span className="text-[10px] opacity-75">16:9 (Desktop)</span>
              </button>

              <button
                className={`flex flex-col items-center justify-center p-4 border rounded-xl transition ${
                  ratio === '9:16'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                }`}
                onClick={() => setRatio('9:16')}
              >
                <div className="text-2xl mb-1">📱</div>
                <span className="font-bold text-sm">Vertical</span>
                <span className="text-[10px] opacity-75">9:16 (Shorts/Reels)</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                className="btn btn-ghost flex-1 py-2 rounded-lg text-sm"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary flex-1 py-2 rounded-lg text-sm font-bold"
                onClick={handleStart}
              >
                Start Recording
              </button>
            </div>
          </div>
        )}

        {exportState === 'exporting' && (
          <div className="w-full flex flex-col items-center py-4">
            {/* Animated Progress Circle */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-white/5 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-amber-500 fill-none transition-all duration-300"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - progress / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-xl font-extrabold text-slate-100">{Math.round(progress)}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Progress</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 font-medium mb-1">Recording your cartoon...</p>
            <p className="text-[10px] text-slate-500 mb-6 text-center max-w-[280px]">
              Keep this browser tab open and visible. Recording runs at real-time play speed.
            </p>

            <button
              className="btn btn-danger py-2 px-6 rounded-lg text-sm"
              onClick={handleCancel}
            >
              Stop & Abort
            </button>
          </div>
        )}

        {exportState === 'complete' && (
          <div className="w-full flex flex-col items-center py-4">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-lg font-bold text-slate-100 mb-1">Export Completed!</p>
            <p className="text-xs text-slate-400 text-center mb-6 max-w-[280px]">
              Your video download has been triggered. You can close this modal now.
            </p>

            <button
              className="btn btn-primary py-2 px-8 rounded-lg text-sm font-bold"
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
