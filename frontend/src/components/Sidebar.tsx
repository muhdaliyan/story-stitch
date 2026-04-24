/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { STEPS } from '../constants';
import type { StepId } from '../types';

interface SidebarProps {
  currentStep: StepId;
  furthestStep: StepId;
  onStepClick: (step: StepId) => void;
}

export function Sidebar({ currentStep, furthestStep, onStepClick }: SidebarProps) {
  return (
    <aside className="w-80 glass-panel border-r border-ink/5 flex flex-col z-10 relative h-full shrink-0">
      <div className="p-8 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl tracking-tight leading-none">
            StoryStitch<span className="text-flame">.</span>
          </h1>
        </div>
        <p className="text-[10px] tracking-[0.2em] font-medium text-ink/40 uppercase">AI Short Film Studio</p>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isPast = currentStep > step.id;
          const isLocked = step.id > furthestStep;

          return (
            <button
              key={step.id}
              onClick={() => !isLocked && onStepClick(step.id)}
              disabled={isLocked}
              className={`w-full group flex items-start gap-4 p-3.5 rounded-2xl text-left transition-all duration-300 relative ${
                isActive
                  ? 'bg-surface-low shadow-sm'
                  : isLocked
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-surface-low/50'
              }`}
            >
              <div className="relative flex flex-col items-center shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    isActive
                      ? 'border-flame bg-flame text-white'
                      : isPast
                      ? 'border-flame text-flame'
                      : 'border-ink/10 text-ink/40'
                  }`}
                >
                  {isPast ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-serif text-lg">{step.id}</span>}
                </div>
                {step.id < STEPS.length && (
                  <div
                    className={`w-0.5 h-8 mt-2 rounded-full transition-colors duration-500 bg-ink/5 ${
                      isPast ? 'bg-flame/30' : ''
                    }`}
                  />
                )}
              </div>

              <div className="pt-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-base ${isActive ? 'text-ink' : 'text-ink/60'}`}>
                    {step.label}
                  </span>
                  {isActive && <ArrowRight className="w-4 h-4 text-flame" />}
                  {isLocked && <Lock className="w-3 h-3 text-ink/30" />}
                </div>
                <p className="text-xs text-ink/40 mt-0.5 leading-tight">{step.description}</p>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
