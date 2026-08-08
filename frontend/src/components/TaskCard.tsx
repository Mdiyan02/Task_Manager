import React from 'react';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../types/task';
import { Calendar, CheckCircle, Circle, Clock, Edit2, Trash2, Tag, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const isCompleted = task.status === 'COMPLETED';
  const dueDateObj = new Date(task.dueDate);
  const isOverdue = !isCompleted && dueDateObj < new Date();

  // Formatting date
  const formattedDueDate = dueDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Badge styling helpers
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'LOW':
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'IN_PROGRESS':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'TODO':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  const getCategoryBadge = (category: TaskCategory) => {
    switch (category) {
      case 'FRONTEND':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'BACKEND':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'DEVOPS':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'BUG':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'FEATURE':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div
      className={`glass-panel p-5 rounded-2xl border transition-all duration-200 hover:border-blue-500/40 hover:shadow-lg group ${
        isCompleted ? 'opacity-75 bg-slate-900/40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Quick Complete Button & Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggleStatus(task)}
            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none"
            title={isCompleted ? "Mark as To Do" : "Mark as Completed"}
          >
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            ) : (
              <Circle className="w-5 h-5 stroke-[2]" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h4
              className={`font-semibold text-base leading-snug truncate text-slate-100 ${
                isCompleted ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Priority Badge */}
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getPriorityBadge(
            task.priority
          )}`}
        >
          {task.priority}
        </span>
      </div>

      {/* Footer Info Row */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tag */}
          <span
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${getCategoryBadge(
              task.category
            )}`}
          >
            <Tag className="w-3 h-3" />
            {task.category}
          </span>

          {/* Status Badge */}
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getStatusBadge(
              task.status
            )}`}
          >
            {task.status.replace('_', ' ')}
          </span>

          {/* Due Date Indicator */}
          <span
            className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-md text-[11px] ${
              isOverdue
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 bg-slate-800/50'
            }`}
          >
            {isOverdue ? <AlertCircle className="w-3 h-3 text-rose-400" /> : <Calendar className="w-3 h-3" />}
            <span>Due {formattedDueDate}</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
            title="Edit Task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
