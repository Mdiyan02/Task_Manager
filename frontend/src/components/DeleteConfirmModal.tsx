import React from 'react';
import { Task } from '../types/task';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  task,
  onClose,
  onConfirm,
  deleting,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden bg-slate-900">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-100">Delete Engineering Task</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Are you sure you want to delete <span className="text-slate-200 font-semibold">"{task.title}"</span>? This action cannot be undone.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
