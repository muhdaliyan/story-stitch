/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface ProjectConfig {
  id: string;
  name: string;
  format: 'short' | 'long'; // short = vertical (Reel), long = landscape (YT)
  sceneFrequency: number;   // seconds per scene
  targetDuration: number;   // total video duration in seconds
}

export interface ProjectData extends ProjectConfig {
  concept: string;
  scenes: Scene[];
  currentStep: StepId;
  furthestStep: StepId;
  videoTitle: string;
  videoDescription: string;
}

export interface Scene {
  id: string;
  number: number;
  narrative: string;
  visual: string;
  imageUrl?: string;
  animationPrompt?: string;
  animationVideoUrl?: string;
  voiceoverScript?: string;
  voiceModel?: string;
  stability?: number;
  similarity?: number;
  styleExaggeration?: number;
  speed?: number;
  voiceoverAudioUrl?: string;
}

export interface Step {
  id: StepId;
  label: string;
  description: string;
  icon: ReactNode;
}
