import React from 'react';
import { Terminal, Plus, Sun, Moon, Database } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateModal, isDarkMode, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-700/50 px-4 lg:px-8 py-4 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 text-white">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent tracking-tight">
              Engineering Task Manager
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Go + PostgreSQL
              </span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline">Daily Workflow Optimizer</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all shadow-sm"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 text-sm active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
