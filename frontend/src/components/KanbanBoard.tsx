import React from 'react';
import { Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  loading: boolean;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  loading,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 bg-slate-800/40 animate-pulse rounded-2xl border border-slate-700/40"></div>
        ))}
      </div>
    );
  }

  const columns: { status: TaskStatus; title: string; icon: React.ReactNode; color: string; badge: string }[] = [
    {
      status: 'TODO',
      title: 'To Do',
      icon: <Circle className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-500/30 bg-blue-500/5',
      badge: 'bg-blue-500/20 text-blue-300',
    },
    {
      status: 'IN_PROGRESS',
      title: 'In Progress',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-500/5',
      badge: 'bg-amber-500/20 text-amber-300',
    },
    {
      status: 'COMPLETED',
      title: 'Completed',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-500/5',
      badge: 'bg-emerald-500/20 text-emerald-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.status);

        return (
          <div
            key={column.status}
            className={`glass-panel p-4 rounded-2xl border ${column.color} flex flex-col min-h-[500px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                {column.icon}
                <h3 className="font-bold text-sm text-slate-200">{column.title}</h3>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.badge}`}>
                {columnTasks.length}
              </span>
            </div>

            {/* Column Tasks */}
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {columnTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-700/60 rounded-xl p-4">
                  No {column.title.toLowerCase()} tasks
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleStatus}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
