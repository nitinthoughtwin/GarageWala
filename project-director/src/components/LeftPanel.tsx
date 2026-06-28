// =============================================================
// Left Panel — Debug and Info Sidebar (Phase 2)
// Tabs: Story | Scenes | Roster | Scene JSON | Debug Console
// =============================================================

import React, { useState } from 'react';
import type { DebugState, SceneJSON, StoryPlan } from '../types';
import { DebugConsole } from './DebugConsole';
import { ALL_CHARACTER_PROFILES } from '../characters/CharacterRegistry';

type TabId = 'story' | 'scenes' | 'roster' | 'projects' | 'json' | 'debug';

interface LeftPanelProps {
  storyText: string;
  sceneJSONs: SceneJSON[];
  debugState: DebugState | null;
  isReady: boolean;
  storyPlan: StoryPlan | null;
  onLoadProject: (storyPlan: StoryPlan, sceneJSONs: SceneJSON[]) => void;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'story',    label: 'Story',      icon: '📖' },
  { id: 'scenes',   label: 'Scenes',     icon: '🎞️' },
  { id: 'roster',   label: 'Roster',     icon: '👥' },
  { id: 'projects', label: 'Projects',   icon: '💾' },
  { id: 'json',     label: 'Scene JSON', icon: '{ }' },
  { id: 'debug',    label: 'Debug',      icon: '🔍' },
];

export const LeftPanel: React.FC<LeftPanelProps> = ({
  storyText,
  sceneJSONs,
  debugState,
  isReady,
  storyPlan,
  onLoadProject,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('story');
  const [projects, setProjects] = useState<{ name: string; storyPlan: StoryPlan; sceneJSONs: SceneJSON[]; timestamp: number }[]>([]);

  React.useEffect(() => {
    if (activeTab === 'projects') {
      loadProjects();
    }
  }, [activeTab]);

  const loadProjects = () => {
    try {
      const data = localStorage.getItem('director_ai_projects');
      if (data) {
        setProjects(JSON.parse(data));
      } else {
        setProjects([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveCurrentProject = () => {
    if (!storyPlan || !sceneJSONs.length) return;
    const name = window.prompt('Enter a name for this project:', storyPlan.title || 'My Cartoon');
    if (!name) return;

    try {
      const current = localStorage.getItem('director_ai_projects');
      const list = current ? JSON.parse(current) : [];
      list.push({
        name,
        storyPlan,
        sceneJSONs,
        timestamp: Date.now(),
      });
      localStorage.setItem('director_ai_projects', JSON.stringify(list));
      loadProjects();
    } catch (e) {
      alert('Failed to save project: ' + e);
    }
  };

  const deleteProject = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const current = localStorage.getItem('director_ai_projects');
      if (current) {
        const list = JSON.parse(current);
        list.splice(idx, 1);
        localStorage.setItem('director_ai_projects', JSON.stringify(list));
        loadProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Group characters by family for the roster tab
  const catFamily = ALL_CHARACTER_PROFILES.filter((c) => c.family === 'Cat Family');
  const rabbitFamily = ALL_CHARACTER_PROFILES.filter((c) => c.family === 'Rabbit Family');

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
                <p>Enter a prompt or select a topic above to generate your story</p>
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

        {activeTab === 'roster' && (
          <div className="roster-panel p-4 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3 border-b border-white/5 pb-1">
                🐱 Cat Family
              </h3>
              <div className="space-y-2">
                {catFamily.map((char) => (
                  <div key={char.id} className="bg-slate-900/40 border border-white/5 rounded-lg p-3 flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-100">{char.displayName}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full">
                        {char.role}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 pt-1">
                      <span>Species: {char.species}</span>
                      <span>Signature: <code className="text-amber-400/80">{char.signature}</code></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-green-500 mb-3 border-b border-white/5 pb-1">
                🐰 Rabbit Family
              </h3>
              <div className="space-y-2">
                {rabbitFamily.map((char) => (
                  <div key={char.id} className="bg-slate-900/40 border border-white/5 rounded-lg p-3 flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-100">{char.displayName}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full">
                        {char.role}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 pt-1">
                      <span>Species: {char.species}</span>
                      <span>Signature: <code className="text-green-400/80">{char.signature}</code></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-panel p-4 flex flex-col h-full overflow-hidden">
            {storyPlan && (
              <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex flex-col space-y-2 items-center">
                <span className="text-xs text-amber-300 font-semibold text-center">
                  You have a compiled cartoon loaded!
                </span>
                <button
                  className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition"
                  onClick={saveCurrentProject}
                >
                  💾 Save Current Project
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-1 mb-2">
                Saved Projects ({projects.length})
              </h3>
              {projects.length > 0 ? (
                projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-xl p-3 flex flex-col space-y-2 transition group cursor-pointer"
                    onClick={() => onLoadProject(proj.storyPlan, proj.sceneJSONs)}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition truncate max-w-[200px]">
                        {proj.name}
                      </span>
                      <button
                        className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded transition"
                        onClick={(e) => deleteProject(idx, e)}
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>🎬 {proj.sceneJSONs.length} Scenes</span>
                      <span>{new Date(proj.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state pt-10">
                  <div className="empty-icon text-3xl mb-2">💾</div>
                  <p className="text-xs text-slate-500 text-center">No projects saved yet.</p>
                </div>
              )}
            </div>
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
