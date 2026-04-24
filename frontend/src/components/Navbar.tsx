/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sun, Bell, FolderOpen } from 'lucide-react';
import type { ProjectData } from '../types';

interface NavbarProps {
  activeProject: ProjectData | undefined;
  onSwitchProject: () => void;
}

export function Navbar({ activeProject, onSwitchProject }: NavbarProps) {
  return (
    <header className="h-20 px-12 flex items-center justify-between border-b border-ink/5 bg-canvas/50 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <button
          onClick={onSwitchProject}
          className="group flex items-center gap-4 hover:opacity-80 transition-all bg-surface-low/50 px-4 py-2 rounded-2xl border border-ink/5"
        >
          <div className="w-10 h-10 rounded-xl bg-flame/10 flex items-center justify-center text-flame group-hover:bg-flame group-hover:text-white transition-all shadow-sm">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-lg font-serif italic text-flame tracking-tight leading-none group-hover:text-ink transition-colors">
              Switch Project
            </h1>
            <span className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em] leading-none mt-1.5 truncate max-w-[120px]">
              {activeProject?.name || 'StoryStitch'}
            </span>
          </div>
        </button>

        <div className="h-8 w-[1px] bg-ink/10" />

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-ink/20 uppercase tracking-[0.2em] italic">Active Production:</span>
          <span className="text-sm font-medium text-ink/80">{activeProject?.name || 'New Film'}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="p-2 text-ink/40 hover:text-ink transition-colors">
            <Sun className="w-5 h-5" />
          </button>
          <button className="p-2 text-ink/40 hover:text-ink transition-colors px-3 py-2 bg-surface-low rounded-xl flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60">Notice</span>
          </button>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-ink/10">
          <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-flame/20 ring-offset-2">
            SS
          </div>
        </div>
      </div>
    </header>
  );
}
