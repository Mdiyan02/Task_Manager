import React from 'react';
import { TaskStats } from '../types/task';
import { CheckCircle2, Clock, AlertTriangle, Layers, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface DashboardStatsProps {
  stats: TaskStats | null;
  loading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-800/40 animate-pulse rounded-2xl border border-slate-700/40"></div>
        ))}
      </div>
    );
  }

  const chartData = [
    { name: 'Todo', value: stats.todo, color: '#3b82f6' },
    { name: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
    { name: 'Completed', value: stats.completed, color: '#10b981' },
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 shadow-md relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-100 mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 shadow-md relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">In Progress</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-amber-300 mt-1">{stats.inProgress}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 shadow-md relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Completed</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-300 mt-1">{stats.completed}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 shadow-md relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Overdue</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-rose-400 mt-1">{stats.overdue}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Bar/Pie summary */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Status & Priority Insights</h4>
            <p className="text-xs text-slate-400">
              Urgent Tasks: <span className="text-rose-400 font-bold">{stats.urgentPriority}</span> • High Priority: <span className="text-amber-400 font-bold">{stats.highPriority}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar Visual */}
        <div className="w-full md:w-1/2 space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>Overall Completion Rate</span>
            <span className="text-emerald-400 font-bold">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
            ></div>
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
            ></div>
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.todo / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
