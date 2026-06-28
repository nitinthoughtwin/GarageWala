// =============================================================
// useRenderLoop — React hook wrapping the Engine
// Manages engine lifecycle, canvas ref, debug state, playback.
// =============================================================

import { useRef, useState, useCallback, useEffect } from 'react';
import React from 'react';
import { Engine } from '../engine/Engine';
import type { DebugState, SceneJSON } from '../types';

export interface RenderLoopState {
  isPlaying: boolean;
  isReady: boolean;
  isComplete: boolean;
  debugState: DebugState | null;
  storyText: string;
  sceneJSONs: SceneJSON[];
}

export interface RenderLoopActions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  generate: (prompt: string) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  seekTo: (time: number) => void;
}

const defaultDebug: DebugState = {
  fps: 0,
  currentTime: 0,
  duration: 0,
  currentScene: '-',
  currentCamera: 'Wide',
  characters: [],
  isPlaying: false,
};

export function useRenderLoop(): RenderLoopState & RenderLoopActions {
  const engineRef  = useRef<Engine>(new Engine());
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [isReady,    setIsReady]    = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [debugState, setDebugState] = useState<DebugState | null>(null);
  const [storyText,  setStoryText]  = useState('');
  const [sceneJSONs, setSceneJSONs] = useState<SceneJSON[]>([]);

  // Attach canvas once it's mounted
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    engineRef.current.attachCanvas(canvas, {
      onDebugUpdate: (state) => setDebugState(state),
      onComplete: () => {
        setIsPlaying(false);
        setIsComplete(true);
      },
    });
  }, []);

  const generate = useCallback((prompt: string) => {
    setIsComplete(false);
    setIsReady(false);

    const { sceneJSONs: jsons } = engineRef.current.generate(prompt);
    setStoryText(engineRef.current.getStoryText());
    setSceneJSONs(jsons);
    setIsReady(true);
    setDebugState(defaultDebug);

    // Draw first frame static preview
    engineRef.current.reset();
    console.log('[useRenderLoop] Generation complete.');
  }, []);

  const play = useCallback(() => {
    if (!engineRef.current.isReady()) return;
    setIsComplete(false);
    setIsPlaying(true);
    engineRef.current.play();
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    engineRef.current.pause();
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setIsComplete(false);
    engineRef.current.reset();
    setDebugState(defaultDebug);
  }, []);

  const seekTo = useCallback((time: number) => {
    engineRef.current.seekTo(time);
  }, []);

  return {
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
  };
}
