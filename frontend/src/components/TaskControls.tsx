import React from 'react';
import { TaskFilters } from '../types/task';
import { Search, Filter, ArrowUpDown, LayoutList, Kanban, RefreshCw } from 'lucide-react';

interface TaskControlsProps {
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  viewMode: 'list' | 'kanban';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
  onRefresh: () => void;
  loading: boolean;
}

export const TaskControls: React.FC<TaskControlsProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  loading,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, priority: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value });
  };

  const toggleOrder = () => {
    onFilterChange({ ...filters, order: filters.order === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 mb-6 space-y-4 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search engineering tasks by title or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* View Mode Switcher & Refresh */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all disabled:opacity-50"
            title="Refresh Task List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</label>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
          <select
            value={filters.priority}
            onChange={handlePriorityChange}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="FRONTEND">Frontend</option>
            <option value="BACKEND">Backend</option>
            <option value="DEVOPS">DevOps</option>
            <option value="BUG">Bug</option>
            <option value="FEATURE">Feature</option>
            <option value="GENERAL">General</option>
          </select>
        </div>

        {/* Sort Selector & Direction */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Sort By</label>
          <div className="flex items-center gap-1">
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created_at">Created Date</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={toggleOrder}
              className="p-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white"
              title={`Order: ${filters.order.toUpperCase()}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
