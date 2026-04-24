/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Image as ImageIcon, Sparkles, RefreshCw, Copy, Check, Download, Upload, Maximize2, X } from 'lucide-react';
import type { Scene } from '../../types';

interface StepVisualsProps {
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  generatingImages: Record<string, boolean>;
  isGeneratingAllImages: boolean;
  copyStatus: Record<string, boolean>;
  onGenerateImage: (sceneId: string, prompt: string) => void;
  onGenerateAllImages: () => void;
  onCopyPrompt: (sceneId: string, text: string) => void;
  onUploadAsset: (sceneId?: string, type?: 'image' | 'video' | 'audio') => void;
  onDownloadAsset: (url: string | undefined, filename: string) => void;
  onNextStep: () => void;
}

const STYLE_TAGS = ['Cinematic', 'Concept Art', '8K', 'Vibrant', 'Golden Hour'];

export function StepVisuals({
  scenes,
  setScenes,
  generatingImages,
  isGeneratingAllImages,
  copyStatus,
  onGenerateImage,
  onGenerateAllImages,
  onCopyPrompt,
  onUploadAsset,
  onDownloadAsset,
  onNextStep,
}: StepVisualsProps) {
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

  return (
    <>
      {/* ── Fullscreen Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {fullscreenUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setFullscreenUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-7xl w-full max-h-[95vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={fullscreenUrl}
                alt="Scene fullscreen"
                className="max-w-full max-h-[95vh] object-contain rounded-2xl shadow-2xl"
              />
              <button
                onClick={() => setFullscreenUrl(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Step ────────────────────────────────────────────── */}
      <motion.div
        key="step-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto"
      >
        <header className="mb-12 relative flex items-end justify-between">
          <div>
            <span className="text-[10px] tracking-[0.2em] font-bold text-flame uppercase mb-2 block">Step 3 of 6</span>
            <h2 className="text-7xl mb-4 italic font-serif">Visuals</h2>
            <p className="text-xl text-ink/60">Refine the art direction.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onGenerateAllImages}
              disabled={isGeneratingAllImages}
              className="flex items-center gap-3 bg-flame/10 text-flame px-8 py-4 rounded-full hover:bg-flame/20 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {isGeneratingAllImages ? (
                <><RefreshCw className="w-4 h-4 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Generate All AI</>
              )}
            </button>
            <button
              onClick={() => onUploadAsset(undefined, 'image')}
              className="flex items-center gap-3 bg-teal/10 text-teal px-8 py-4 rounded-full hover:bg-teal/20 transition-all font-bold text-xs uppercase tracking-widest"
            >
              <Upload className="w-4 h-4" />
              Batch Upload
            </button>
            <button
              onClick={onNextStep}
              className="flex items-center gap-3 bg-ink text-white px-8 py-4 rounded-full hover:scale-105 transition-all shadow-xl"
            >
              <span>Next: Animation</span>
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

                {/* ── Image Thumbnail Panel ─────────────────────── */}
                <div className="w-full xl:w-72 bg-surface-mid relative overflow-hidden shrink-0 border-b xl:border-b-0 xl:border-r border-ink/5 aspect-video xl:aspect-auto">
                  {scene.imageUrl ? (
                    <img
                      src={scene.imageUrl}
                      alt={`Scene ${scene.number}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/10">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}

                  {/* Generating spinner */}
                  {generatingImages[scene.id] && (
                    <div className="absolute inset-0 bg-ink/60 backdrop-blur-md flex flex-col items-center justify-center text-white z-20">
                      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Weaving visuals...</span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-ink/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] z-10">
                    <button
                      onClick={() => onGenerateImage(scene.id, scene.visual)}
                      disabled={generatingImages[scene.id]}
                      className="bg-white text-ink rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-xl disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-flame" />
                      {scene.imageUrl ? 'Re-generate' : 'Generate Visual'}
                    </button>

                    <button
                      onClick={() => onUploadAsset(scene.id, 'image')}
                      className="bg-white/10 text-white border border-white/20 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      Upload Image
                    </button>

                    {scene.imageUrl && (
                      <>
                        <button
                          onClick={() => onDownloadAsset(scene.imageUrl, `scene-${scene.number}-visual.png`)}
                          className="bg-ink/60 text-white rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-ink transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                        <button
                          onClick={() => setFullscreenUrl(scene.imageUrl!)}
                          className="bg-ink/60 text-white rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-ink transition-colors"
                        >
                          <Maximize2 className="w-3 h-3" />
                          Fullscreen
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Prompt Editor Panel ───────────────────────── */}
                <div className="flex-1 p-8">
                  <div className="grid md:grid-cols-2 gap-8 h-full">

                    {/* Left: Scene Reference + Style Tags */}
                    <div className="border-r border-ink/5 pr-8 hidden md:flex md:flex-col gap-6">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/20 mb-3 block">
                          Scene Reference
                        </label>
                        <p className="text-sm text-ink/60 leading-relaxed font-serif italic">{scene.narrative}</p>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/20 mb-3 block">
                          Style Presets
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {STYLE_TAGS.map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                const current = scene.visual || '';
                                const newVal = current ? `${current}, ${tag}` : tag;
                                setScenes(prev => prev.map(s => (s.id === scene.id ? { ...s, visual: newVal } : s)));
                              }}
                              className="text-[10px] font-bold uppercase tracking-tighter px-3 py-1.5 rounded-full border border-ink/10 text-ink/40 hover:border-flame hover:text-flame transition-all"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Visual Prompt Editor */}
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-flame" />
                          <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Visual Prompt</label>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onCopyPrompt(scene.id, scene.visual)}
                            className="text-[10px] font-bold text-ink/30 uppercase hover:text-ink/60 flex items-center gap-1 transition-colors"
                            title="Copy prompt"
                          >
                            {copyStatus[scene.id] ? <Check className="w-3 h-3 text-teal" /> : <Copy className="w-3 h-3" />}
                            {copyStatus[scene.id] ? 'Copied' : 'Copy'}
                          </button>
                          <button
                            onClick={() => onGenerateImage(scene.id, scene.visual)}
                            disabled={generatingImages[scene.id]}
                            className="text-[10px] font-bold text-flame uppercase hover:underline flex items-center gap-1 disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${generatingImages[scene.id] ? 'animate-spin' : ''}`} />
                            {generatingImages[scene.id] ? 'Generating...' : 'Roll AI'}
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={scene.visual}
                        onChange={e => {
                          const newVisual = e.target.value;
                          setScenes(scenes.map(s => (s.id === scene.id ? { ...s, visual: newVisual } : s)));
                        }}
                        className="w-full bg-transparent border-none outline-none text-lg font-serif text-ink leading-relaxed placeholder:text-ink/10 resize-none flex-1 min-h-[120px]"
                        placeholder="Describe the visual style, lighting, and composition..."
                      />
                    </div>

                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
