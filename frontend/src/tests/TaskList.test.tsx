import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from '../components/TaskList';
import { Task } from '../types/task';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement PostgreSQL Integration',
    description: 'Connect Go REST API to PostgreSQL 16 database',
    dueDate: new Date().toISOString(),
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    category: 'BACKEND',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Build React Task Dashboard',
    description: 'Design interactive dashboard metrics & filters',
    dueDate: new Date().toISOString(),
    priority: 'URGENT',
    status: 'TODO',
    category: 'FRONTEND',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('TaskList Component', () => {
  it('renders task list items with title and badges', () => {
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onOpenCreateModal={vi.fn()}
      />
    );

    expect(screen.getByText('Implement PostgreSQL Integration')).toBeInTheDocument();
    expect(screen.getByText('Build React Task Dashboard')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('URGENT')).toBeInTheDocument();
  });

  it('renders empty state when no tasks are present', () => {
    render(
      <TaskList
        tasks={[]}
        loading={false}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onOpenCreateModal={vi.fn()}
      />
    );

    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });

  it('triggers onToggleStatus when completion checkbox is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <TaskList
        tasks={mockTasks}
        loading={false}
        onToggleStatus={handleToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onOpenCreateModal={vi.fn()}
      />
    );

    const toggleButtons = screen.getAllByTitle(/Mark as/i);
    fireEvent.click(toggleButtons[0]);

    expect(handleToggle).toHaveBeenCalledWith(mockTasks[0]);
  });
});
