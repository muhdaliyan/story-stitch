/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clapperboard, X, Plus, Video, Layout, ArrowRight, Trash2, Clock, Layers, Sparkles } from 'lucide-react';
import type { ProjectData } from '../types';
import type { MouseEvent } from 'react';

interface ProjectModalProps {
  isOpen: boolean;
  projects: ProjectData[];
  activeProjectId: string | null;
  newProjectName: string;
  setNewProjectName: (v: string) => void;
  newProjectFormat: 'short' | 'long';
  setNewProjectFormat: (v: 'short' | 'long') => void;
  newProjectFrequency: number;
  setNewProjectFrequency: (v: number) => void;
  newProjectDuration: number;
  setNewProjectDuration: (v: number) => void;
  onClose: () => void;
  onCreateProject: () => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string, e: MouseEvent) => void;
}

const sceneCount = (duration: number, freq: number) => Math.max(1, Math.floor(duration / freq));

export function ProjectModal({
  isOpen,
  projects,
  activeProjectId,
  newProjectName,
  setNewProjectName,
  newProjectFormat,
  setNewProjectFormat,
  newProjectFrequency,
  setNewProjectFrequency,
  newProjectDuration,
  setNewProjectDuration,
  onClose,
  onCreateProject,
  onSelectProject,
  onDeleteProject,
}: ProjectModalProps) {
  const maxDuration = newProjectFormat === 'short' ? 60 : 300;

  // Local raw strings so users can fully clear and retype without snap-back
  const [durationRaw, setDurationRaw] = useState(String(newProjectDuration));
  const [freqRaw,     setFreqRaw]     = useState(String(newProjectFrequency));

  // Keep raw values in sync when format changes (resets duration)
  useEffect(() => { setDurationRaw(String(newProjectDuration)); }, [newProjectDuration]);
  useEffect(() => { setFreqRaw(String(newProjectFrequency));    }, [newProjectFrequency]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 backdrop-blur-lg p-4 md:p-6"
          onClick={() => activeProjectId && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative"
            onClick={e => e.stopPropagation()}
          >

            {/* ── Close button ─────────────────────────────────────────── */}
            {activeProjectId && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-30 w-9 h-9 rounded-full bg-ink/5 hover:bg-ink/10 flex items-center justify-center transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-ink/50" />
              </button>
            )}

            {/* ════════════════════════════════════════════════════════════
                LEFT — Recent Projects
            ════════════════════════════════════════════════════════════ */}
            <div className="w-full md:w-[300px] shrink-0 bg-surface-low/60 border-r border-ink/5 flex flex-col">
              {/* Header */}
              <div className="px-8 pt-8 pb-5 border-b border-ink/5">
                <div className="flex items-center gap-2 mb-1">
                  <Clapperboard className="w-4 h-4 text-flame" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-flame">StoryStitch</span>
                </div>
                <h2 className="text-2xl font-serif italic text-ink">Your Productions</h2>
              </div>

              {/* Project list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none">
                {projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center mb-3">
                      <Layers className="w-5 h-5 text-ink/20" />
                    </div>
                    <p className="text-xs font-bold text-ink/20 uppercase tracking-widest">No projects yet</p>
                    <p className="text-xs text-ink/20 mt-1">Create your first film →</p>
                  </div>
                ) : (
                  projects.map(p => {
                    const isActive = p.id === activeProjectId;
                    return (
                      <motion.div
                        key={p.id}
                        onClick={() => onSelectProject(p.id)}
                        whileHover={{ x: 2 }}
                        role="button"
                        tabIndex={0}
                        className={`w-full group text-left p-4 rounded-2xl transition-all flex flex-col gap-2 cursor-pointer ${isActive
                          ? 'bg-flame/5 border-2 border-flame text-ink shadow-sm'
                          : 'bg-white hover:bg-ink/3 border border-ink/8 shadow-sm'
                          }`}
                      >
                        {/* Top row: icon + name + step badge */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-flame/10' : 'bg-surface-low'
                            }`}>
                            {p.format === 'short'
                              ? <Video className={`w-4 h-4 ${isActive ? 'text-flame' : 'text-flame/60'}`} />
                              : <Layout className={`w-4 h-4 ${isActive ? 'text-teal' : 'text-teal/60'}`} />
                            }
                          </div>

                          <p className={`font-bold text-sm truncate flex-1 leading-tight ${isActive ? 'text-ink' : 'text-ink/80'
                            }`}>{p.name}</p>

                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isActive ? 'bg-flame/10 text-flame' : 'bg-ink/5 text-ink/30'
                            }`}>
                            Step {p.currentStep}/6
                          </span>
                        </div>

                        {/* Bottom row: meta + delete */}
                        <div className="flex items-center justify-between pl-11">
                          <p className="text-[10px] font-medium text-ink/35">
                            {p.format === 'short' ? 'Short' : 'Long'} · {p.targetDuration}s · {sceneCount(p.targetDuration, p.sceneFrequency)} scenes
                          </p>
                          <button
                            onClick={e => { e.stopPropagation(); onDeleteProject(p.id, e); }}
                            className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-400 transition-all"
                            title="Delete project"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                RIGHT — Create New Project
            ════════════════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-none">
              {/* Header */}

              <div className="flex-1 px-10 py-8 space-y-7">

                {/* Project Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 block">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Last Signal"
                    value={newProjectName}
                    autoFocus
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && newProjectName.trim() && onCreateProject()}
                    className="w-full bg-surface-low/60 border-2 border-ink/5 focus:border-flame/40 rounded-2xl px-5 py-3.5 font-semibold text-ink text-sm outline-none transition-all placeholder:text-ink/20"
                  />
                </div>

                {/* Format selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 block">
                    Video Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {([['short', 'Short · Vertical', 'Reels, TikTok, Shorts', Video, 'text-flame'],
                    ['long', 'Long · Landscape', 'YouTube, Films', Layout, 'text-teal']] as const
                    ).map(([fmt, title, sub, Icon, color]) => (
                      <button
                        key={fmt}
                        onClick={() => { setNewProjectFormat(fmt); setNewProjectDuration(fmt === 'short' ? 60 : 180); }}
                        className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${newProjectFormat === fmt
                          ? 'border-flame bg-flame/5 shadow-sm'
                          : 'border-ink/5 bg-surface-low/40 hover:border-ink/15'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${newProjectFormat === fmt ? 'bg-flame text-white' : 'bg-ink/5'
                          }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${newProjectFormat === fmt ? 'text-flame' : 'text-ink/70'}`}>{title}</p>
                          <p className="text-[10px] text-ink/30 mt-0.5">{sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration + Frequency side-by-side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Duration */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-ink/30" />
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
                        Duration (sec)
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={durationRaw}
                        onChange={e => setDurationRaw(e.target.value.replace(/[^0-9]/g, ''))}
                        onBlur={() => {
                          const val = Math.min(maxDuration, Math.max(5, parseInt(durationRaw) || 5));
                          setNewProjectDuration(val);
                          setDurationRaw(String(val));
                        }}
                        className="w-full bg-surface-low/60 border-2 border-ink/5 focus:border-flame/40 rounded-2xl px-4 py-3 font-bold text-ink text-center text-lg outline-none transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-ink/30 font-bold">s</span>
                    </div>
                    <p className="text-[9px] text-ink/25 text-center">Max {newProjectFormat === 'short' ? '60s' : '5 min'}</p>
                  </div>

                  {/* Scene Frequency */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3 h-3 text-ink/30" />
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
                        Each Scene Length (sec)
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={freqRaw}
                        onChange={e => setFreqRaw(e.target.value.replace(/[^0-9]/g, ''))}
                        onBlur={() => {
                          const val = Math.min(30, Math.max(5, parseInt(freqRaw) || 5));
                          setNewProjectFrequency(val);
                          setFreqRaw(String(val));
                        }}
                        className="w-full bg-surface-low/60 border-2 border-ink/5 focus:border-flame/40 rounded-2xl px-4 py-3 font-bold text-ink text-center text-lg outline-none transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-ink/30 font-bold">s</span>
                    </div>
                    <p className="text-[9px] text-ink/25 text-center">5 – 30 seconds</p>
                  </div>
                </div>

                {/* Scene count preview */}
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-flame/5 border border-flame/10">
                  <Sparkles className="w-4 h-4 text-flame shrink-0" />
                  <p className="text-xs text-ink/60">
                    AI will generate{' '}
                    <span className="font-bold text-flame text-sm">
                      {sceneCount(newProjectDuration, newProjectFrequency)}
                    </span>{' '}
                    scene{sceneCount(newProjectDuration, newProjectFrequency) !== 1 ? 's' : ''} ·{' '}
                    {newProjectDuration}s total at {newProjectFrequency}s each
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="px-10 pb-10">
                <button
                  onClick={onCreateProject}
                  disabled={!newProjectName.trim()}
                  className="w-full bg-ink text-white py-5 rounded-full font-bold uppercase tracking-[0.15em] text-sm shadow-xl hover:bg-ink/90 active:scale-[0.98] disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                >
                  <span>Start Production</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
