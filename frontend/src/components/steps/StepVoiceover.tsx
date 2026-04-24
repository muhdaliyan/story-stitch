/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Image as ImageIcon, Mic2, Sparkles, RefreshCw, Upload, Download, X } from 'lucide-react';
import type { Scene } from '../../types';

interface StepVoiceoverProps {
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  generatingVoiceovers: Record<string, boolean>;
  synthesizingVoiceovers: Record<string, boolean>;
  isGeneratingAllVoiceovers: boolean;
  isSynthesizingAllVoiceovers: boolean;
  onGenerateVoiceover: (sceneId: string) => void;
  onGenerateAllVoiceovers: () => void;
  onSynthesizeVoiceover: (sceneId: string) => void;
  onSynthesizeAllVoiceovers: () => void;
  onUploadAsset: (sceneId?: string, type?: 'image' | 'video' | 'audio') => void;
  onDownloadAsset: (url: string | undefined, filename: string) => void;
  onNextStep: () => void;
}

const AVAILABLE_VOICES = [
  { name: 'Rachel', description: 'Soft & Narrative' },
  { name: 'Adam', description: 'Deep & Cinematic' },
  { name: 'Serena', description: 'Professional & Clear' },
  { name: 'Josh', description: 'Young & Energetic' },
  { name: 'Arnold', description: 'Authoritative' },
  { name: 'Domi', description: 'Strong & Expressive' },
  { name: 'Sam', description: 'Warm & Friendly' },
];

export function StepVoiceover({
  scenes,
  setScenes,
  generatingVoiceovers,
  synthesizingVoiceovers,
  isGeneratingAllVoiceovers,
  isSynthesizingAllVoiceovers,
  onGenerateVoiceover,
  onGenerateAllVoiceovers,
  onSynthesizeVoiceover,
  onSynthesizeAllVoiceovers,
  onUploadAsset,
  onDownloadAsset,
  onNextStep,
}: StepVoiceoverProps) {
  return (
    <motion.div
      key="step-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-6xl mx-auto pb-32"
    >
      <header className="mb-12 relative flex items-end justify-between border-b border-ink/5 pb-12">
        <div>
          <span className="text-[10px] tracking-[0.2em] font-bold text-teal uppercase mb-2 block">Step 5 of 6</span>
          <h2 className="text-7xl mb-4 italic">Voice</h2>
          <p className="text-xl text-ink/60">Professional narration for every scene</p>
        </div>

        <div className="flex gap-3 flex-wrap justify-end">
          <button
            onClick={onGenerateAllVoiceovers}
            disabled={isGeneratingAllVoiceovers}
            className="flex items-center gap-3 bg-flame/10 text-flame px-6 py-3 rounded-full hover:bg-flame/20 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isGeneratingAllVoiceovers ? (
              <><RefreshCw className="w-4 h-4 animate-spin" />Generating Scripts...</>
            ) : (
              <><Sparkles className="w-4 h-4" />Generate All Scripts</>
            )}
          </button>
          <button
            onClick={onSynthesizeAllVoiceovers}
            disabled={isSynthesizingAllVoiceovers}
            className="flex items-center gap-3 bg-teal/10 text-teal px-6 py-3 rounded-full hover:bg-teal/20 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isSynthesizingAllVoiceovers ? (
              <><RefreshCw className="w-4 h-4 animate-spin" />Synthesizing All...</>
            ) : (
              <><Mic2 className="w-4 h-4" />Synthesize All</>
            )}
          </button>
          <button
            onClick={onNextStep}
            className="flex items-center gap-3 bg-ink text-white px-6 py-3 rounded-full hover:scale-105 transition-all shadow-xl"
          >
            <span>Finalize Film</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid gap-10">
        {scenes.map((scene, idx) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-8"
          >
            {/* Number badge */}
            <div className="shrink-0 pt-6">
              <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-serif text-xl border-4 border-white shadow-xl">
                {scene.number}
              </div>
            </div>

            {/* Card */}
            <div className="flex-1 node-card overflow-hidden flex flex-col lg:flex-row">
              {/* Visual Reference Thumbnail */}
              <div className="w-full lg:w-80 aspect-video bg-surface-low border-r border-ink/5 relative group shrink-0">
                {scene.imageUrl ? (
                  <img src={scene.imageUrl} alt={`Scene ${scene.number}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-ink/20 italic">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-10" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Waiting for Visual</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px] z-10">
                  <button
                    onClick={() => onUploadAsset(scene.id, 'audio')}
                    className="bg-white text-ink rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-xl"
                  >
                    <Mic2 className="w-3 h-3" />
                    Upload Voiceover
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-8 flex flex-col lg:flex-row gap-8">
                {/* Left: Script */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Voiceover Script</label>
                    <button
                      onClick={() => onGenerateVoiceover(scene.id)}
                      disabled={generatingVoiceovers[scene.id]}
                      className="text-[10px] font-bold text-flame uppercase hover:underline flex items-center gap-2"
                    >
                      <Sparkles className={`w-3 h-3 ${generatingVoiceovers[scene.id] ? 'animate-spin' : ''}`} />
                      AI Script Suggestion
                    </button>
                  </div>

                  <textarea
                    value={scene.voiceoverScript || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setScenes(prev => prev.map(s => (s.id === scene.id ? { ...s, voiceoverScript: val } : s)));
                    }}
                    className="w-full bg-transparent border-none outline-none text-xl font-serif text-ink leading-relaxed placeholder:text-ink/10 resize-none h-40 mb-4"
                    placeholder="Wait for the signal... It's coming from Sector 7..."
                  />

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => onSynthesizeVoiceover(scene.id)}
                      disabled={synthesizingVoiceovers[scene.id] || !scene.voiceoverScript?.trim()}
                      className="flex items-center gap-2 bg-teal/10 text-teal px-5 py-2 rounded-full hover:bg-teal/20 transition-all font-bold text-[10px] uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Mic2 className={`w-3 h-3 ${synthesizingVoiceovers[scene.id] ? 'animate-spin' : ''}`} />
                      {synthesizingVoiceovers[scene.id] ? 'Synthesizing…' : 'Synthesize Voice'}
                    </button>
                  </div>

                  {scene.voiceoverAudioUrl && (
                    <div className="mt-8 border-t border-ink/5 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-teal">
                          Voiceover Preview
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDownloadAsset(scene.voiceoverAudioUrl, `scene-${scene.number}-voiceover.mp3`)}
                            className="text-[9px] font-bold uppercase tracking-widest text-ink/40 hover:text-ink"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, voiceoverAudioUrl: undefined } : s))}
                            className="text-[9px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <audio controls src={scene.voiceoverAudioUrl} className="w-full h-10 rounded-lg filter invert hue-rotate-180 opacity-60" />
                    </div>
                  )}
                </div>

                {/* Right: Scene Voice Selector */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6 bg-surface-low/30 p-6 rounded-2xl border border-ink/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Mic2 className="w-16 h-16" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-widest text-ink/30 mb-3 block">Narrator For This Scene</label>
                      <select
                        value={scene.voiceModel || 'Rachel'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setScenes(prev => prev.map(s => (s.id === scene.id ? { ...s, voiceModel: val } : s)));
                        }}
                        className="w-full bg-white border border-ink/5 rounded-xl px-4 py-3 text-[10px] font-bold text-ink outline-none focus:border-flame transition-colors"
                      >
                        {AVAILABLE_VOICES.map(v => (
                          <option key={v.name} value={v.name}>{v.name} ({v.description})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-ink/30">Narration Speed</label>
                        <span className="text-[9px] font-mono text-flame">{scene.speed || 1.0}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.2"
                        step="0.05"
                        value={scene.speed || 1.0}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setScenes(prev => prev.map(s => (s.id === scene.id ? { ...s, speed: val } : s)));
                        }}
                        className="w-full h-1 bg-ink/5 rounded-lg appearance-none cursor-pointer accent-flame"
                      />
                    </div>



                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-ink/30">Stability</label>
                        <span className="text-[9px] font-mono text-flame">{scene.stability ?? 0.5}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={scene.stability ?? 0.5}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setScenes(prev => prev.map(s => (s.id === scene.id ? { ...s, stability: val } : s)));
                        }}
                        className="w-full h-1 bg-ink/5 rounded-lg appearance-none cursor-pointer accent-flame"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-ink/30">Clarity</label>
                        <span className="text-[9px] font-mono text-flame">{scene.similarity ?? 0.75}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={scene.similarity ?? 0.75}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setScenes(prev => prev.map(s => (s.id === scene.id ? { ...s, similarity: val } : s)));
                        }}
                        className="w-full h-1 bg-ink/5 rounded-lg appearance-none cursor-pointer accent-flame"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          const voice = scene.voiceModel || 'Rachel';
                          const speed = scene.speed || 1.0;
                          const stability = scene.stability ?? 0.5;
                          const similarity = scene.similarity ?? 0.75;
                          setScenes(prev => prev.map(s => ({
                            ...s,
                            voiceModel: voice,
                            speed: speed,
                            stability: stability,
                            similarity: similarity
                          })));
                        }}
                        className="w-full bg-teal/10 text-teal py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-teal/20 transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Apply to all scenes
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
