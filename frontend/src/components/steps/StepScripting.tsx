/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ArrowRight, Image as ImageIcon, Sparkles, Infinity } from 'lucide-react';
import type { Scene } from '../../types';

interface StepScriptingProps {
  scenes: Scene[];
  isAddingScenes: boolean;
  scenesCountInput: string;
  setScenesCountInput: (v: string) => void;
  onAddScenesAI: () => void;
  onNextStep: () => void;
}

export function StepScripting({
  scenes,
  isAddingScenes,
  scenesCountInput,
  setScenesCountInput,
  onAddScenesAI,
  onNextStep,
}: StepScriptingProps) {
  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-5xl mx-auto"
    >
      <header className="mb-12 relative flex items-end justify-between">
        <div>
          <span className="text-[10px] tracking-[0.2em] font-bold text-flame uppercase mb-2 block">Step 2 of 6</span>
          <h2 className="text-7xl mb-4">Scripting</h2>
          <p className="text-xl text-ink/60">AI has structured your story into production-ready scenes.</p>
        </div>
        <button
          onClick={onNextStep}
          className="flex items-center gap-3 bg-ink text-white px-8 py-4 rounded-full hover:scale-105 transition-all"
        >
          <span>Next: Visuals</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </header>

      <div className="grid gap-12">
        {scenes.map((scene, idx) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group"
          >
            <div className="flex gap-8">
              <div className="shrink-0 pt-4">
                <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-serif text-xl border-4 border-white shadow-xl">
                  {scene.number}
                </div>
              </div>

              <div className="flex-1 node-card p-0 overflow-hidden flex flex-col md:flex-row">
                <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-ink/5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/20 mb-3 block">
                    Narrative / Dialogue
                  </label>
                  <textarea
                    defaultValue={scene.narrative}
                    className="w-full bg-transparent outline-none text-lg font-serif text-ink leading-relaxed resize-none min-h-[120px]"
                  />
                </div>

                <div className="w-full md:w-2/5 p-8 bg-surface-low/30">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-teal mb-0 block flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" />
                      Visual Scene Prompt
                    </label>
                    <div className="px-2 py-0.5 rounded-full bg-teal/5 text-teal text-[8px] font-bold uppercase tracking-tighter">
                      AI Generated
                    </div>
                  </div>
                  <textarea
                    defaultValue={scene.visual}
                    className="w-full bg-transparent outline-none text-xs font-sans text-ink/60 leading-relaxed resize-none min-h-[120px] italic"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Magic scene extension */}
        <div className="flex gap-8">
          {/* Infinity badge — same style as scene number badges */}
          <div className="shrink-0 pt-6">
            <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center border-4 border-white shadow-xl">
              <Infinity className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 py-12 border-2 border-dashed border-ink/10 rounded-3xl flex flex-col items-center gap-6 bg-white/50 backdrop-blur-sm group hover:border-flame/30 transition-all">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-flame/10 text-flame flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-bold uppercase tracking-[0.2em] text-[10px] text-ink/40">Magic Story Extension</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <input
                type="number"
                min="1"
                max="10"
                value={scenesCountInput}
                onChange={e => setScenesCountInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                    onAddScenesAI();
                  }
                }}
                className="w-16 bg-surface-low border border-ink/5 rounded-xl px-3 py-3 text-center font-bold text-ink focus:outline-none focus:border-flame/30 transition-colors"
              />
              <span className="text-[8px] font-bold uppercase text-ink/20">Count</span>
            </div>

            <button
              onClick={onAddScenesAI}
              disabled={isAddingScenes}
              className="bg-flame hover:bg-flame-light text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-flame/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAddingScenes ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Weaving...</span>
                </>
              ) : (
                <>
                  Generate <span className="opacity-60">{scenesCountInput}</span> New Scene
                  {scenesCountInput !== '1' ? 's' : ''}
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-ink/20 font-medium italic">
            AI will continue the story logic from scene {scenes.length}.
          </p>
        </div>
        </div>
      </div>
    </motion.div>
  );
}
