import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskStats, TaskFilters } from '../types/task';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/tasks';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // JSON parse fallback
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  async getTasks(filters?: Partial<TaskFilters>): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (filters.sortBy) params.append('sort_by', filters.sortBy);
      if (filters.order) params.append('order', filters.order);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}${queryString}`);
    return handleResponse<Task[]>(res);
  },

  async getTaskStats(): Promise<TaskStats> {
    const res = await fetch(`${API_BASE_URL}/stats`);
    return handleResponse<TaskStats>(res);
  },

  async getTaskById(id: string): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    return handleResponse<Task>(res);
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Task>(res);
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Task>(res);
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputStatus(status)),
    });
    return handleResponse<Task>(res);
  },

  async deleteTask(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(res);
  },
};

function inputStatus(status: TaskStatus) {
  return { status };
}
