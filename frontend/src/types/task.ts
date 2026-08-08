export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskCategory = 'FRONTEND' | 'BACKEND' | 'DEVOPS' | 'BUG' | 'FEATURE' | 'GENERAL';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: TaskCategory;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
  lowPriority: number;
  mediumPriority: number;
  highPriority: number;
  urgentPriority: number;
}

export interface TaskFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
  sortBy: string; // due_date, priority, created_at, title
  order: 'asc' | 'desc';
}
