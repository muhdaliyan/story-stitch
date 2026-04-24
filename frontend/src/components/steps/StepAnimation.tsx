/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ArrowRight, Image as ImageIcon, Film, Sparkles, RefreshCw, Upload, Download } from 'lucide-react';
import type { Scene } from '../../types';

interface StepAnimationProps {
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  generatingAnimations: Record<string, boolean>;
  isGeneratingAllAnimations: boolean;
  onGenerateAnimationPrompt: (sceneId: string) => void;
  onGenerateAllAnimationPrompts: () => void;
  onUploadAsset: (sceneId?: string, type?: 'image' | 'video' | 'audio') => void;
  onDownloadAsset: (url: string | undefined, filename: string) => void;
  onNextStep: () => void;
}

export function StepAnimation({
  scenes,
  setScenes,
  generatingAnimations,
  isGeneratingAllAnimations,
  onGenerateAnimationPrompt,
  onGenerateAllAnimationPrompts,
  onUploadAsset,
  onDownloadAsset,
  onNextStep,
}: StepAnimationProps) {
  return (
    <motion.div
      key="step-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-6xl mx-auto"
    >
      <header className="mb-12 relative flex items-end justify-between">
        <div>
          <span className="text-[10px] tracking-[0.2em] font-bold text-teal uppercase mb-2 block">
            Optional Step 4 of 6
          </span>
          <h2 className="text-7xl mb-4 italic">Animation</h2>
          <p className="text-xl text-ink/60">Define how the camera and subjects move in each scene.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onGenerateAllAnimationPrompts}
            disabled={isGeneratingAllAnimations}
            className="flex items-center gap-3 bg-flame/10 text-flame px-8 py-4 rounded-full hover:bg-flame/20 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isGeneratingAllAnimations ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Suggest All AI
              </>
            )}
          </button>
          <button
            onClick={onNextStep}
            className="flex items-center gap-3 bg-ink text-white px-8 py-4 rounded-full hover:scale-105 transition-all shadow-xl"
          >
            <span>Next: Voiceover</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid gap-8">
        {scenes.map((scene, idx) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-8"
          >
            {/* Number badge — outside the card */}
            <div className="shrink-0 pt-6">
              <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-serif text-xl border-4 border-white shadow-xl">
                {scene.number}
              </div>
            </div>

            {/* Card */}
            <div className="flex-1 node-card p-0 overflow-hidden flex flex-col xl:flex-row">
            {/* Visual Reference / Video Preview */}
            <div className="w-full xl:w-72 bg-surface-mid relative overflow-hidden shrink-0 border-b xl:border-b-0 xl:border-r border-ink/5 aspect-video xl:aspect-auto">
              {scene.animationVideoUrl ? (
                <video src={scene.animationVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : scene.imageUrl ? (
                <img src={scene.imageUrl} alt={`Scene ${scene.number}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/10">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}

              {/* Upload/Download overlay */}
              <div className="absolute inset-0 bg-ink/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                <button
                  onClick={() => onUploadAsset(scene.id, 'video')}
                  className="bg-white text-ink rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Upload className="w-3 h-3" />
                  Upload Animation
                </button>

                {(scene.animationVideoUrl || scene.imageUrl) && (
                  <button
                    onClick={() => {
                      const url = scene.animationVideoUrl || scene.imageUrl;
                      const ext = scene.animationVideoUrl ? 'mp4' : 'png';
                      onDownloadAsset(url, `scene-${scene.number}-asset.${ext}`);
                    }}
                    className="bg-ink/60 text-white rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-ink transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download Asset
                  </button>
                )}
              </div>
            </div>

            {/* Animation Prompt Editor */}
            <div className="flex-1 p-8">
              <div className="grid md:grid-cols-2 gap-8 h-full">
                {/* Scene Reference */}
                <div className="border-r border-ink/5 pr-8 hidden md:block">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/20 mb-3 block">
                    Scene Reference
                  </label>
                  <p className="text-sm text-ink/60 leading-relaxed font-serif italic mb-4">{scene.narrative}</p>
                  <div className="p-3 bg-surface-low/50 rounded-xl border border-ink/5">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-teal/40 mb-1 block">
                      Visual Prompt
                    </label>
                    <p className="text-[10px] text-teal/60 italic leading-snug">{scene.visual}</p>
                  </div>
                </div>

                {/* Movement editor */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-flame" />
                      <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Movement Style</label>
                    </div>
                    <button
                      onClick={() => onGenerateAnimationPrompt(scene.id)}
                      disabled={generatingAnimations[scene.id]}
                      className="text-[10px] font-bold text-flame uppercase hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      {generatingAnimations[scene.id] ? 'AI Thinking...' : 'AI Suggestion'}
                    </button>
                  </div>

                  <textarea
                    value={scene.animationPrompt || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setScenes(prev => prev.map(s => (s.id === scene.id ? { ...s, animationPrompt: val } : s)));
                    }}
                    className="w-full bg-transparent border-none outline-none text-lg font-serif text-ink leading-relaxed placeholder:text-ink/10 resize-none h-24 mb-4"
                    placeholder="Slow zoom in, pan left to right, cinematic drone shot..."
                  />

                  <div className="mt-auto flex flex-wrap gap-2">
                    {['Pan', 'Zoom', 'Tilt', 'Static', 'Dolly'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => {
                          const current = scene.animationPrompt || '';
                          const newVal = current ? `${current}, ${preset}` : preset;
                          setScenes(prev => prev.map(s => (s.id === scene.id ? { ...s, animationPrompt: newVal } : s)));
                        }}
                        className="text-[10px] font-bold uppercase tracking-tighter px-3 py-1.5 rounded-full border border-ink/10 text-ink/40 hover:border-flame hover:text-flame transition-all"
                      >
                        + {preset}
                      </button>
                    ))}
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
