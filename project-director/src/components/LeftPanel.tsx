// =============================================================
// Left Panel — Debug sidebar
// Tabs: Prompt | Story | Scene List | Scene JSON | Debug Console
// =============================================================

import React, { useState } from 'react';
import type { DebugState, SceneJSON } from '../types';
import { DebugConsole } from './DebugConsole';

type TabId = 'story' | 'scenes' | 'json' | 'debug';

interface LeftPanelProps {
  storyText: string;
  sceneJSONs: SceneJSON[];
  debugState: DebugState | null;
  isReady: boolean;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'story',  label: 'Story',      icon: '📖' },
  { id: 'scenes', label: 'Scenes',     icon: '🎞️' },
  { id: 'json',   label: 'Scene JSON', icon: '{ }' },
  { id: 'debug',  label: 'Debug',      icon: '🔍' },
];

export const LeftPanel: React.FC<LeftPanelProps> = ({
  storyText,
  sceneJSONs,
  debugState,
  isReady,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('story');

  return (
    <aside className="left-panel">
      {/* Panel header */}
      <div className="panel-header">
        <span className="panel-title">Director's Notes</span>
        {isReady && <span className="panel-ready-badge">READY</span>}
      </div>

      {/* Tabs */}
      <div className="tab-bar" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'story' && (
          <div className="story-panel">
            {storyText ? (
              <pre className="story-text">{storyText}</pre>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎬</div>
                <p>Enter a prompt and click Generate to create your story</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scenes' && (
          <div className="scenes-panel">
            {sceneJSONs.length > 0 ? (
              <div className="scene-list">
                {sceneJSONs.map((scene, i) => (
                  <div key={i} className="scene-card">
                    <div className="scene-card-header">
                      <span className="scene-num">Scene {i + 1}</span>
                      <span className="scene-name">{scene.scene}</span>
                      <span className="scene-duration">{scene.duration}s</span>
                    </div>
                    <div className="scene-card-body">
                      <div className="scene-meta">
                        <span className="meta-label">Camera:</span>
                        <span className="meta-val">{scene.camera}</span>
                      </div>
                      <div className="scene-meta">
                        <span className="meta-label">Characters:</span>
                        <span className="meta-val">{scene.characters.map((c) => c.id).join(', ')}</span>
                      </div>
                      <div className="char-actions">
                        {scene.characters.map((char) => (
                          <div key={char.id} className="char-action-group">
                            <span className="char-action-name">{char.id}</span>
                            <div className="action-tags">
                              {char.actions.map((a, ai) => (
                                <span key={ai} className="action-tag">
                                  {a.animation} ({a.start}–{a.end}s)
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎞️</div>
                <p>Scenes will appear after generation</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="json-panel">
            {sceneJSONs.length > 0 ? (
              <pre className="json-view">
                {JSON.stringify(sceneJSONs, null, 2)}
              </pre>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">{ }</div>
                <p>Scene JSON will appear after generation</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'debug' && (
          <DebugConsole state={debugState} />
        )}
      </div>
    </aside>
  );
};
