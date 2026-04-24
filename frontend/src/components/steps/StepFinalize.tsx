/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Film, Layout, Clapperboard, Video, Play, Download, Sparkles } from 'lucide-react';
import { filmRenderer, type RenderTransition, type RenderEffect } from '../../lib/FilmRenderer';
import type { Scene } from '../../types';

interface StepFinalizeProps {
  scenes: Scene[];
  videoTitle: string;
  setVideoTitle: (v: string) => void;
  videoDescription: string;
  setVideoDescription: (v: string) => void;
  isGenerating: boolean;
  activeProjectFormat?: 'short' | 'long';
  onGenerateMetadata: () => void;
  onDownloadAsset: (url: string | undefined, filename: string) => void;
}

export function StepFinalize({
  scenes,
  videoTitle,
  setVideoTitle,
  videoDescription,
  setVideoDescription,
  isGenerating,
  activeProjectFormat,
  onGenerateMetadata,
  onDownloadAsset,
}: StepFinalizeProps) {
  const [visualSource, setVisualSource] = useState<'image' | 'animation'>('image');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [renderStatus, setRenderStatus] = useState<'idle' | 'initializing' | 'rendering'>('idle');
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [transition, setTransition] = useState<RenderTransition>('crossfade');
  const [effect, setEffect] = useState<RenderEffect>('zoomIn');

  // Auto-generate metadata when step mounts and title is empty
  useEffect(() => {
    if (!videoTitle && !isGenerating) {
      onGenerateMetadata();
    }
  }, []);

  const handleFinalizeVideo = async () => {
    const missingAssets = scenes.filter(
      s =>
        !s.voiceoverAudioUrl ||
        (visualSource === 'image' && !s.imageUrl) ||
        (visualSource === 'animation' && !s.animationVideoUrl)
    );

    if (missingAssets.length > 0) {
      alert(
        `Missing ${visualSource === 'animation' ? 'animations' : 'images'} or voiceovers for ${missingAssets.length} scene(s). Please complete them first.`
      );
      return;
    }

    setIsFinalizing(true);
    setRenderProgress(0);
    setRenderStatus('initializing');

    try {
      const renderAssets = {
        scenes: scenes.map(s => ({
          visualUrl: (visualSource === 'animation' ? s.animationVideoUrl : s.imageUrl)!,
          audioUrl: s.voiceoverAudioUrl!,
          type: (visualSource === 'animation' ? 'video' : 'image') as 'image' | 'video',
        })),
        settings: {
          transition,
          effect,
          format: activeProjectFormat || 'long',
        }
      };

      const url = await filmRenderer.render(renderAssets, p => {
        setRenderStatus('rendering');
        setRenderProgress(p);
      });

      setFinalVideoUrl(url);
    } catch (error) {
      console.error('Film rendering failed', error);
      alert('Film rendering failed. Please ensure all assets are accessible and try again.');
    } finally {
      setIsFinalizing(false);
      setRenderStatus('idle');
    }
  };

  return (
    <motion.div
      key="step-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto pb-32"
    >
      <header className="mb-12 text-center">
        <span className="text-[10px] tracking-[0.2em] font-bold text-teal uppercase mb-2 block">Step 6 of 6</span>
        <h2 className="text-7xl mb-4 italic">Finalize Film</h2>
        <p className="text-xl text-ink/60 max-w-xl mx-auto">
          Stitch your scenes together into a cohesive cinematic experience.
        </p>
      </header>

      <div className="grid gap-12">
        {/* Visual Source Selector */}
        {/* Visual Production Source - REDESIGNED */}
        <div className="node-card overflow-hidden bg-white border border-ink/5 shadow-xl">
          <div className="grid lg:grid-cols-[1fr_auto_1fr] divide-x divide-ink/5">
            {/* Left: Source Selection */}
            <div className="p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-flame/10 flex items-center justify-center">
                  <Layout className="w-4 h-4 text-flame" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink">Primary Visual Engine</h3>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { id: 'image', label: 'Static Visuals', sub: 'High-res AI keyframes', icon: ImageIcon },
                  { id: 'animation', label: 'Animated Motion', sub: 'Dynamic AI movement', icon: Film }
                ].map(src => {
                  const Icon = src.icon;
                  const isActive = visualSource === src.id;
                  return (
                    <button
                      key={src.id}
                      onClick={() => setVisualSource(src.id as any)}
                      className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-4 text-left group ${isActive 
                        ? 'border-flame bg-flame/5' 
                        : 'border-transparent bg-surface-low hover:bg-ink/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-flame text-white' : 'bg-white text-ink/20 group-hover:text-ink/40'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isActive ? 'text-ink' : 'text-ink/60'}`}>{src.label}</p>
                        <p className="text-[10px] text-ink/30 font-medium tracking-tight">{src.sub}</p>
                      </div>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-flame animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider Line (Desktop) */}
            <div className="hidden lg:block w-px bg-ink/5 self-stretch" />

            {/* Right: Cinematic Tweaks */}
            <div className="p-10 space-y-10">
              {/* Transitions */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Video className="w-4 h-4 text-flame" />
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink">Scene Transitions</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Cut' },
                    { id: 'crossfade', label: 'Fade' },
                    { id: 'fadeBlack', label: 'Black' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setTransition(opt.id as any)}
                      className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${transition === opt.id
                          ? 'border-flame bg-flame/10 text-flame shadow-sm scale-[1.02]'
                          : 'border-ink/5 bg-white text-ink/40 hover:border-ink/10'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Effects */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-4 h-4 text-flame" />
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink">Cinematic Effects</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Static' },
                    { id: 'zoomIn', label: 'Zoom' },
                    { id: 'zoomInOut', label: 'Pulse' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setEffect(opt.id as any)}
                      className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${effect === opt.id
                          ? 'border-flame bg-flame/10 text-flame shadow-sm scale-[1.02]'
                          : 'border-ink/5 bg-white text-ink/40 hover:border-ink/10'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-flame/5 rounded-xl border border-flame/10">
                <p className="text-[9px] text-flame/60 leading-relaxed font-medium italic">
                  Engine will synchronize visual motion with the {visualSource === 'animation' ? 'video duration' : 'audio length'} automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Film Details */}
        <div className="node-card p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clapperboard className="w-5 h-5 text-flame" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink/80">Film Details</h3>
            </div>
            <button
              onClick={onGenerateMetadata}
              disabled={isGenerating}
              className="text-[10px] font-bold text-flame uppercase hover:underline flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              AI Meta-Gen
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink/20 mb-3 block">
                Production Title
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
                className="w-full bg-transparent border-b border-ink/10 text-3xl font-serif text-ink focus:border-flame outline-none py-2 transition-colors placeholder:text-ink/5"
                placeholder="Untitled Masterpiece..."
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink/20 mb-3 block">
                Synopsis & Meta
              </label>
              <textarea
                value={videoDescription}
                onChange={e => setVideoDescription(e.target.value)}
                className="w-full bg-surface-low/50 border border-ink/5 rounded-xl p-6 text-lg font-serif text-ink/60 focus:border-flame outline-none h-32 transition-colors resize-none placeholder:text-ink/5"
                placeholder="The silence of deep space is broken by a signal that shouldn't exist..."
              />
            </div>
          </div>
        </div>

        {/* Render / Output */}
        <div className="node-card p-10 bg-ink text-white relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,87,34,0.3),transparent)]" />
          </div>

          {!finalVideoUrl ? (
            <div className="text-center relative z-10 py-10">
              <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-8">
                <Video className={`w-10 h-10 ${isFinalizing ? 'animate-pulse' : ''}`} />
              </div>
              <h4 className="text-3xl italic mb-4">Ready to Stitch?</h4>
              <p className="text-white/40 text-lg mb-10 max-w-md mx-auto">
                We will synchronize your {visualSource === 'animation' ? 'animatics' : 'visuals'} with the uploaded voiceover tracks.
              </p>

              {isFinalizing ? (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                  {renderProgress < 1 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-6"
                    >
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-3 h-3 bg-flame rounded-full"
                          />
                        ))}
                      </div>
                      <h5 className="text-4xl font-serif italic tracking-wide">Stitching . . .</h5>
                      <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">Initializing Production Engine</p>
                    </motion.div>
                  ) : (
                    <div className="w-full max-w-md mx-auto">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/50">
                          Production Progress
                        </span>
                        <span className="text-2xl font-serif italic text-flame">{renderProgress}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div
                          className="h-full bg-gradient-to-r from-flame to-flame/60 relative"
                          initial={{ width: 0 }}
                          animate={{ width: `${renderProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                        </motion.div>
                      </div>
                      <p className="mt-6 text-center text-white/20 text-[10px] uppercase tracking-widest font-bold animate-pulse">
                        Synchronizing Cinematic Frames
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleFinalizeVideo}
                  className="bg-flame text-white px-16 py-6 rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4 mx-auto font-bold uppercase tracking-[0.2em] text-sm"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Finalize & Stitch Film
                </button>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10">
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                <div>
                  <h4 className="text-2xl italic">{videoTitle}</h4>
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Production Complete</p>
                </div>
                <button
                  onClick={() => onDownloadAsset(finalVideoUrl, `${videoTitle.toLowerCase().replace(/\s+/g, '-')}.mp4`)}
                  className="flex items-center gap-3 bg-white text-ink px-6 py-3 rounded-full hover:bg-white/90 transition-all font-bold text-xs uppercase tracking-widest"
                >
                  <Download className="w-4 h-4" />
                  Download Cinema
                </button>
              </div>

              <div className={`${activeProjectFormat === 'short' ? 'aspect-[9/16] max-w-[320px] mx-auto' : 'aspect-video'} bg-black rounded-2xl overflow-hidden shadow-3xl border border-white/10 relative group`}>
                <video src={finalVideoUrl} controls className="w-full h-full object-contain" />
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1 bg-flame text-[8px] font-bold uppercase tracking-widest rounded-lg">
                    Stitched Preview
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setFinalVideoUrl(null);
                    setRenderProgress(0);
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors"
                >
                  Reset Render State
                </button>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
