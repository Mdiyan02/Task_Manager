package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/engineering-task-manager/backend/internal/database"
	"github.com/engineering-task-manager/backend/internal/models"
	"github.com/google/uuid"
)

var (
	ErrTaskNotFound = errors.New("task not found")
)

type TaskRepository interface {
	GetAll(params models.TaskQueryParams) ([]models.Task, error)
	GetByID(id string) (*models.Task, error)
	Create(input models.CreateTaskInput) (*models.Task, error)
	Update(id string, input models.UpdateTaskInput) (*models.Task, error)
	UpdateStatus(id string, status models.TaskStatus) (*models.Task, error)
	Delete(id string) error
	GetStats() (*models.TaskStats, error)
}

type SQLTaskRepository struct {
	db *database.DB
}

func NewTaskRepository(db *database.DB) TaskRepository {
	return &SQLTaskRepository{db: db}
}

func (r *SQLTaskRepository) GetAll(params models.TaskQueryParams) ([]models.Task, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	addCond := func(clause string, val interface{}) {
		if r.db.Driver == "postgres" {
			conditions = append(conditions, fmt.Sprintf("%s $%d", clause, argIdx))
		} else {
			conditions = append(conditions, fmt.Sprintf("%s ?", clause))
		}
		args = append(args, val)
		argIdx++
	}

	if params.Search != "" {
		searchTerm := "%" + strings.ToLower(params.Search) + "%"
		if r.db.Driver == "postgres" {
			conditions = append(conditions, fmt.Sprintf("(LOWER(title) LIKE $%d OR LOWER(description) LIKE $%d)", argIdx, argIdx))
			args = append(args, searchTerm)
			argIdx++
		} else {
			conditions = append(conditions, "(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)")
			args = append(args, searchTerm, searchTerm)
			argIdx += 2
		}
	}

	if params.Status != "" {
		addCond("status =", params.Status)
	}

	if params.Priority != "" {
		addCond("priority =", params.Priority)
	}

	if params.Category != "" {
		addCond("category =", params.Category)
	}

	query := "SELECT id, title, description, due_date, priority, status, category, created_at, updated_at FROM tasks"
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	// Sorting
	sortField := "due_date"
	switch strings.ToLower(params.SortBy) {
	case "title":
		sortField = "title"
	case "priority":
		// Custom priority sorting order
		if r.db.Driver == "postgres" {
			sortField = "CASE priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 WHEN 'LOW' THEN 4 ELSE 5 END"
		} else {
			sortField = "CASE priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 WHEN 'LOW' THEN 4 ELSE 5 END"
		}
	case "created_at":
		sortField = "created_at"
	case "status":
		sortField = "status"
	default:
		sortField = "due_date"
	}

	order := "ASC"
	if strings.ToUpper(params.Order) == "DESC" {
		order = "DESC"
	}

	query += fmt.Sprintf(" ORDER BY %s %s", sortField, order)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query tasks: %w", err)
	}
	defer rows.Close()

	tasks := []models.Task{}
	for rows.Next() {
		var t models.Task
		err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.DueDate, &t.Priority, &t.Status, &t.Category, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan task row: %w", err)
		}
		tasks = append(tasks, t)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tasks, nil
}

func (r *SQLTaskRepository) GetByID(id string) (*models.Task, error) {
	var query string
	if r.db.Driver == "postgres" {
		query = "SELECT id, title, description, due_date, priority, status, category, created_at, updated_at FROM tasks WHERE id = $1"
	} else {
		query = "SELECT id, title, description, due_date, priority, status, category, created_at, updated_at FROM tasks WHERE id = ?"
	}

	var t models.Task
	err := r.db.QueryRow(query, id).Scan(&t.ID, &t.Title, &t.Description, &t.DueDate, &t.Priority, &t.Status, &t.Category, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}
	return &t, nil
}

func (r *SQLTaskRepository) Create(input models.CreateTaskInput) (*models.Task, error) {
	id := uuid.New().String()
	now := time.Now()

	task := models.Task{
		ID:          id,
		Title:       input.Title,
		Description: input.Description,
		DueDate:     input.DueDate,
		Priority:    input.Priority,
		Status:      input.Status,
		Category:    input.Category,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	var query string
	if r.db.Driver == "postgres" {
		query = `INSERT INTO tasks (id, title, description, due_date, priority, status, category, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	} else {
		query = `INSERT INTO tasks (id, title, description, due_date, priority, status, category, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	}

	_, err := r.db.Exec(query, task.ID, task.Title, task.Description, task.DueDate, task.Priority, task.Status, task.Category, task.CreatedAt, task.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert task: %w", err)
	}

	return &task, nil
}

func (r *SQLTaskRepository) Update(id string, input models.UpdateTaskInput) (*models.Task, error) {
	existing, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}

	if input.Title != nil {
		existing.Title = *input.Title
	}
	if input.Description != nil {
		existing.Description = *input.Description
	}
	if input.DueDate != nil {
		existing.DueDate = *input.DueDate
	}
	if input.Priority != nil {
		existing.Priority = *input.Priority
	}
	if input.Status != nil {
		existing.Status = *input.Status
	}
	if input.Category != nil {
		existing.Category = *input.Category
	}
	existing.UpdatedAt = time.Now()

	var query string
	if r.db.Driver == "postgres" {
		query = `UPDATE tasks SET title=$1, description=$2, due_date=$3, priority=$4, status=$5, category=$6, updated_at=$7 WHERE id=$8`
	} else {
		query = `UPDATE tasks SET title=?, description=?, due_date=?, priority=?, status=?, category=?, updated_at=? WHERE id=?`
	}

	_, err = r.db.Exec(query, existing.Title, existing.Description, existing.DueDate, existing.Priority, existing.Status, existing.Category, existing.UpdatedAt, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	return existing, nil
}

func (r *SQLTaskRepository) UpdateStatus(id string, status models.TaskStatus) (*models.Task, error) {
	input := models.UpdateTaskInput{
		Status: &status,
	}
	return r.Update(id, input)
}

func (r *SQLTaskRepository) Delete(id string) error {
	var query string
	if r.db.Driver == "postgres" {
		query = "DELETE FROM tasks WHERE id = $1"
	} else {
		query = "DELETE FROM tasks WHERE id = ?"
	}

	res, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrTaskNotFound
	}
	return nil
}

func (r *SQLTaskRepository) GetStats() (*models.TaskStats, error) {
	stats := &models.TaskStats{}

	now := time.Now()

	rows, err := r.db.Query("SELECT status, priority, due_date FROM tasks")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var status models.TaskStatus
		var priority models.TaskPriority
		var dueDate time.Time

		if err := rows.Scan(&status, &priority, &dueDate); err != nil {
			return nil, err
		}

		stats.Total++

		switch status {
		case models.StatusTodo:
			stats.Todo++
		case models.StatusInProgress:
			stats.InProgress++
		case models.StatusCompleted:
			stats.Completed++
		}

		switch priority {
		case models.PriorityLow:
			stats.LowPriority++
		case models.PriorityMedium:
			stats.MediumPriority++
		case models.PriorityHigh:
			stats.HighPriority++
		case models.PriorityUrgent:
			stats.UrgentPriority++
		}

		if status != models.StatusCompleted && dueDate.Before(now) {
			stats.Overdue++
		}
	}

	return stats, nil
}
