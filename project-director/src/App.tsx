// =============================================================
// App.tsx — Root component
// Wires all panels together using useRenderLoop
// =============================================================


import { Header } from './components/Header';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
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
    generate,
    play,
    pause,
    reset,
    seekTo,
  } = useRenderLoop();

  return (
    <div className="app-root">
      {/* Header */}
      <Header
        onGenerate={generate}
        onPlay={play}
        onPause={pause}
        onReset={reset}
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
    </div>
  );
}
