import React from 'react';
import { Task } from '../types/task';
import { TaskCard } from './TaskCard';
import { Layers, Plus } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onOpenCreateModal: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  onToggleStatus,
  onEdit,
  onDelete,
  onOpenCreateModal,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-800/40 animate-pulse rounded-2xl border border-slate-700/40"></div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-slate-700/50 text-center my-8">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-blue-500/20">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">No tasks found</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-6">
          There are no engineering tasks matching your search or active filter criteria.
        </p>
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
