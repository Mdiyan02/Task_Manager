package models

import (
	"errors"
	"time"
)

type TaskStatus string

const (
	StatusTodo       TaskStatus = "TODO"
	StatusInProgress TaskStatus = "IN_PROGRESS"
	StatusCompleted  TaskStatus = "COMPLETED"
)

type TaskPriority string

const (
	PriorityLow    TaskPriority = "LOW"
	PriorityMedium TaskPriority = "MEDIUM"
	PriorityHigh   TaskPriority = "HIGH"
	PriorityUrgent TaskPriority = "URGENT"
)

type TaskCategory string

const (
	CategoryFrontend TaskCategory = "FRONTEND"
	CategoryBackend  TaskCategory = "BACKEND"
	CategoryDevOps   TaskCategory = "DEVOPS"
	CategoryBug      TaskCategory = "BUG"
	CategoryFeature  TaskCategory = "FEATURE"
	CategoryGeneral  TaskCategory = "GENERAL"
)

type Task struct {
	ID          string       `json:"id"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	DueDate     time.Time    `json:"dueDate"`
	Priority    TaskPriority `json:"priority"`
	Status      TaskStatus   `json:"status"`
	Category    TaskCategory `json:"category"`
	CreatedAt   time.Time    `json:"createdAt"`
	UpdatedAt   time.Time    `json:"updatedAt"`
}

type CreateTaskInput struct {
	Title       string       `json:"title"`
	Description string       `json:"description"`
	DueDate     time.Time    `json:"dueDate"`
	Priority    TaskPriority `json:"priority"`
	Status      TaskStatus   `json:"status"`
	Category    TaskCategory `json:"category"`
}

func (input *CreateTaskInput) Validate() error {
	if input.Title == "" {
		return errors.New("title is required")
	}
	if len(input.Title) > 150 {
		return errors.New("title cannot exceed 150 characters")
	}
	if input.Priority == "" {
		input.Priority = PriorityMedium
	}
	if input.Status == "" {
		input.Status = StatusTodo
	}
	if input.Category == "" {
		input.Category = CategoryGeneral
	}
	return nil
}

type UpdateTaskInput struct {
	Title       *string       `json:"title,omitempty"`
	Description *string       `json:"description,omitempty"`
	DueDate     *time.Time    `json:"dueDate,omitempty"`
	Priority    *TaskPriority `json:"priority,omitempty"`
	Status      *TaskStatus   `json:"status,omitempty"`
	Category    *TaskCategory `json:"category,omitempty"`
}

type UpdateStatusInput struct {
	Status TaskStatus `json:"status"`
}

type TaskStats struct {
	Total          int `json:"total"`
	Todo           int `json:"todo"`
	InProgress     int `json:"inProgress"`
	Completed      int `json:"completed"`
	Overdue        int `json:"overdue"`
	LowPriority    int `json:"lowPriority"`
	MediumPriority int `json:"mediumPriority"`
	HighPriority   int `json:"highPriority"`
	UrgentPriority int `json:"urgentPriority"`
}

type TaskQueryParams struct {
	Search   string
	Status   string
	Priority string
	Category string
	SortBy   string // due_date, priority, created_at, title
	Order    string // asc, desc
}
