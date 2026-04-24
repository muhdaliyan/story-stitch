/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { STEPS } from '../../constants';
import type { Scene, StepId } from '../../types';

interface StepConceptProps {
  concept: string;
  setConcept: (v: string) => void;
  scenes: Scene[];
  isGenerating: boolean;
  furthestStep: StepId;
  onGenerate: () => void;
  onResume: () => void;
  onStepClick: (step: StepId) => void;
}

export function StepConcept({
  concept,
  setConcept,
  scenes,
  isGenerating,
  furthestStep,
  onGenerate,
  onResume,
  onStepClick,
}: StepConceptProps) {
  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto"
    >
      <header className="mb-12 relative">
        <div className="absolute -top-12 -right-8 opacity-20 transform rotate-12">
          <Sparkles className="w-16 h-16 text-teal" />
        </div>
        <span className="text-[10px] tracking-[0.2em] font-bold text-flame uppercase mb-2 block">Step 1 of 6</span>
        <h2 className="text-7xl mb-6 flex items-center gap-4">Concept</h2>
        <p className="text-xl text-ink/60 max-w-xl">
          Start with your raw idea. Describe your story in a few sentences.
        </p>
      </header>

      <div className="node-card p-10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-flame/10 to-transparent" />

        <textarea
          value={concept}
          onChange={e => setConcept(e.target.value)}
          placeholder="Describe your story..."
          className="w-full h-64 bg-transparent outline-none text-2xl font-serif text-ink resize-none leading-relaxed placeholder:text-ink/10"
        />

        <div className="mt-8 flex items-end justify-between gap-4">
          <div className="text-xs font-medium text-ink/20">{concept.length} / 1000 characters</div>

          <div className="flex gap-4">
            {scenes.length > 0 && !isGenerating && (
              <button
                onClick={onResume}
                className="flex items-center gap-3 border border-ink/10 hover:bg-ink hover:text-white px-8 py-4 rounded-full transition-all text-ink font-medium"
              >
                Resume Production
              </button>
            )}
            <button
              onClick={onGenerate}
              disabled={isGenerating || concept.trim().length === 0}
              className="group relative flex items-center gap-3 bg-flame hover:bg-flame-light text-white px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-flame/20 disabled:grayscale disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Weaving story...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-lg">
                    {scenes.length > 0 ? 'Rewrite Story (AI)' : 'Generate Story'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* How it works stepper */}
      <div className="mt-20 glass-panel rounded-[24px] border border-ink/5 p-12">
        <h3 className="text-sm font-bold uppercase tracking-widest text-ink/40 mb-8">How it works</h3>

        <div className="flex items-center justify-between gap-4 relative">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex-1 flex flex-col items-center text-center group">
              <div
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-500 mb-4 cursor-pointer hover:scale-105 ${
                  furthestStep >= step.id
                    ? 'bg-surface-low border-flame text-flame shadow-sm'
                    : 'border-ink/5 text-ink/20 cursor-not-allowed opacity-40'
                }`}
                onClick={() => furthestStep >= step.id && onStepClick(step.id)}
              >
                <div className="transition-transform duration-500">{step.icon}</div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-tighter mb-1 transition-colors ${
                  furthestStep >= step.id ? 'text-ink' : 'text-ink/20'
                }`}
              >
                {idx + 1}. {step.label.split(' ')[0]}
              </span>
              <p
                className={`text-[9px] font-medium leading-tight px-4 transition-colors ${
                  furthestStep >= step.id ? 'text-ink/40' : 'text-ink/10'
                }`}
              >
                {step.description}
              </p>

              {idx < STEPS.length - 1 && (
                <div
                  className="absolute h-[1px] w-12 top-7 bg-ink/10 hidden lg:block"
                  style={{ left: `${idx * 16.66 + 11.5}%` }}
                >
                  <div
                    className={`h-full transition-all duration-1000 ${
                      furthestStep > step.id ? 'w-full bg-flame/30' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="text-xs text-ink/30 italic flex items-center gap-2 text-center">
            Your journey from idea to film.
            <div className="w-1.5 h-1.5 rounded-full bg-flame/20" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
