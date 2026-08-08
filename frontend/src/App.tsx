import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskStats, TaskFilters, CreateTaskInput, TaskStatus } from './types/task';
import { api } from './services/api';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { TaskControls } from './components/TaskControls';
import { TaskList } from './components/TaskList';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters State
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: '',
    priority: '',
    category: '',
    sortBy: 'due_date',
    order: 'asc',
  });

  // View Mode: 'list' or 'kanban'
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Dark mode theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle Dark Mode
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Tasks and Stats
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedTasks, fetchedStats] = await Promise.all([
        api.getTasks(filters),
        api.getTaskStats(),
      ]);
      setTasks(fetchedTasks);
      setStats(fetchedStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load task data from backend');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Task Status Toggle Action
  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      // Optimistic UI update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );
      await api.updateTaskStatus(task.id, nextStatus);
      showToast(
        `Task marked as ${nextStatus === 'COMPLETED' ? 'Completed 🎉' : 'To Do'}`
      );
      fetchData(); // Refresh stats
    } catch (err: any) {
      showToast(err.message || 'Failed to update task status', 'error');
      fetchData(); // Rollback
    }
  };

  // Create or Update Task Save Handler
  const handleSaveTask = async (input: CreateTaskInput) => {
    if (taskToEdit) {
      await api.updateTask(taskToEdit.id, input);
      showToast('Task updated successfully ✨');
    } else {
      await api.createTask(input);
      showToast('New engineering task created 🚀');
    }
    fetchData();
  };

  // Delete Task Handler
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      setDeleting(true);
      await api.deleteTask(taskToDelete.id);
      showToast('Task deleted successfully');
      setTaskToDelete(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* App Header */}
      <Header
        onOpenCreateModal={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border animate-in slide-in-from-bottom duration-300 ${
              toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-rose-500/40 text-rose-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Global Backend Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold rounded-lg border border-rose-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Metrics */}
        <DashboardStats stats={stats} loading={loading} />

        {/* Controls: Search, Filter, Sort, View Toggle */}
        <TaskControls
          filters={filters}
          onFilterChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={fetchData}
          loading={loading}
        />

        {/* Views: List or Kanban */}
        {viewMode === 'list' ? (
          <TaskList
            tasks={tasks}
            loading={loading}
            onToggleStatus={handleToggleStatus}
            onEdit={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onDelete={(task) => setTaskToDelete(task)}
            onOpenCreateModal={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
          />
        ) : (
          <KanbanBoard
            tasks={tasks}
            loading={loading}
            onToggleStatus={handleToggleStatus}
            onEdit={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onDelete={(task) => setTaskToDelete(task)}
          />
        )}
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />
    </div>
  );
};

export default App;
