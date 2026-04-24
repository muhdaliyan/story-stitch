/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pencil, FileText, Image as ImageIcon, Film, Mic2, Video } from 'lucide-react';
import type { Step } from '../types';

export const STEPS: Step[] = [
  { id: 1, label: 'Concept',   description: 'Define your story idea',   icon: <Pencil   className="w-4 h-4" /> },
  { id: 2, label: 'Scripting', description: 'AI script generation',      icon: <FileText className="w-4 h-4" /> },
  { id: 3, label: 'Visuals',   description: 'Craft scene visuals',       icon: <ImageIcon className="w-4 h-4" /> },
  { id: 4, label: 'Animation', description: 'Animate your scenes',       icon: <Film     className="w-4 h-4" /> },
  { id: 5, label: 'Voiceover', description: 'Add narration',             icon: <Mic2     className="w-4 h-4" /> },
  { id: 6, label: 'Finalize',  description: 'Stitch your film',          icon: <Video    className="w-4 h-4" /> },
];
