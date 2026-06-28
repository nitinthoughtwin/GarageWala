// =============================================================
// App.tsx — Root component (Phase 7 — Sound & SaaS Polish)
// Wires all panels together using useRenderLoop
// =============================================================

import { useState } from 'react';
import { Header } from './components/Header';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { ExportModal } from './components/ExportModal';
import { useRenderLoop } from './renderer/useRenderLoop';

export default function App() {
  const {
    canvasRef,
    isPlaying,
    isReady,
    isComplete,
    debugState,
    storyText,
    sceneJSONs,
    storyPlan,
    generate,
    play,
    pause,
    reset,
    seekTo,
    startExport,
    cancelExport,
    loadProject,
  } = useRenderLoop();

  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="app-root relative">
      {/* Header */}
      <Header
        onGenerate={generate}
        onPlay={play}
        onPause={pause}
        onReset={reset}
        onExport={() => setIsExportOpen(true)}
        isPlaying={isPlaying}
        isReady={isReady}
      />

      {/* Main content */}
      <main className="app-main">
        <LeftPanel
          storyText={storyText}
          sceneJSONs={sceneJSONs}
          debugState={debugState}
          isReady={isReady}
          storyPlan={storyPlan}
          onLoadProject={loadProject}
        />

        <RightPanel
          canvasRef={canvasRef}
          sceneJSONs={sceneJSONs}
          debugState={debugState}
          isPlaying={isPlaying}
          isReady={isReady}
          isComplete={isComplete}
          onPlay={play}
          onPause={pause}
          onReset={reset}
          onSeek={seekTo}
        />
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onStartExport={startExport}
        onCancelExport={cancelExport}
      />
    </div>
  );
}
