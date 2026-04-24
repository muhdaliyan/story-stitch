/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, Reorder, AnimatePresence } from 'motion/react';
import { X, ArrowUpDown, Check, GripVertical } from 'lucide-react';

interface PendingFile {
  file: File;
  id: string;
  url: string;
}

interface BatchUploadModalProps {
  files: PendingFile[];
  onReorder: (newOrder: PendingFile[]) => void;
  onReverse: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BatchUploadModal({
  files,
  onReorder,
  onReverse,
  onConfirm,
  onCancel
}: BatchUploadModalProps) {
  if (files.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="p-8 border-b border-ink/5 flex items-center justify-between bg-surface-low/30">
            <div>
              <h3 className="text-4xl font-serif italic mb-1">Organize Batch</h3>
              <p className="text-sm text-ink/40">Drag and drop to match your story scenes.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onReverse}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-ink/10 text-[10px] font-bold uppercase tracking-widest hover:bg-ink/5 transition-all text-ink/60"
              >
                <ArrowUpDown className="w-3 h-3" />
                Reverse
              </button>
              <button
                onClick={onCancel}
                className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-ink/40 hover:bg-ink/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            <Reorder.Group axis="y" values={files} onReorder={onReorder} className="space-y-3">
              {files.map((item, index) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className="bg-surface-low rounded-2xl p-4 flex items-center gap-6 border border-ink/5 hover:border-flame/20 transition-all group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-4 shrink-0">
                    <GripVertical className="w-4 h-4 text-ink/10 group-hover:text-ink/30" />
                    <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center font-serif text-sm">
                      {index + 1}
                    </div>
                  </div>

                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-ink/5 shrink-0 shadow-sm">
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{item.file.name}</p>
                    <p className="text-[9px] text-ink/30 uppercase tracking-widest font-bold">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Footer */}
          <div className="p-8 bg-surface-mid/50 border-t border-ink/5 flex items-center justify-between">
            <p className="text-xs text-ink/40 font-serif italic">
              Filling {files.length} scenes starting from Scene 1
            </p>
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ink/40 hover:text-ink transition-colors"
              >
                Discard
              </button>
              <button
                onClick={onConfirm}
                className="flex items-center gap-3 bg-flame text-white px-8 py-4 rounded-full hover:scale-105 transition-all shadow-xl font-bold text-[10px] uppercase tracking-widest"
              >
                <Check className="w-4 h-4" />
                Assign to Scenes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
