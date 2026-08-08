package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/engineering-task-manager/backend/internal/models"
	"github.com/engineering-task-manager/backend/internal/repository"
	"github.com/go-chi/chi/v5"
)

type TaskHandler struct {
	repo repository.TaskRepository
}

func NewTaskHandler(repo repository.TaskRepository) *TaskHandler {
	return &TaskHandler{repo: repo}
}

func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload != nil {
		_ = json.NewEncoder(w).Encode(payload)
	}
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

func (h *TaskHandler) GetAllTasks(w http.ResponseWriter, r *http.Request) {
	params := models.TaskQueryParams{
		Search:   r.URL.Query().Get("search"),
		Status:   r.URL.Query().Get("status"),
		Priority: r.URL.Query().Get("priority"),
		Category: r.URL.Query().Get("category"),
		SortBy:   r.URL.Query().Get("sort_by"),
		Order:    r.URL.Query().Get("order"),
	}

	tasks, err := h.repo.GetAll(params)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to retrieve tasks: "+err.Error())
		return
	}

	respondJSON(w, http.StatusOK, tasks)
}

func (h *TaskHandler) GetTaskByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "Task ID is required")
		return
	}

	task, err := h.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, repository.ErrTaskNotFound) {
			respondError(w, http.StatusNotFound, "Task not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to fetch task")
		return
	}

	respondJSON(w, http.StatusOK, task)
}

func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	var input models.CreateTaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if err := input.Validate(); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	task, err := h.repo.Create(input)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create task: "+err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, task)
}

func (h *TaskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "Task ID is required")
		return
	}

	var input models.UpdateTaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	task, err := h.repo.Update(id, input)
	if err != nil {
		if errors.Is(err, repository.ErrTaskNotFound) {
			respondError(w, http.StatusNotFound, "Task not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to update task")
		return
	}

	respondJSON(w, http.StatusOK, task)
}

func (h *TaskHandler) UpdateTaskStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "Task ID is required")
		return
	}

	var input models.UpdateStatusInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if input.Status != models.StatusTodo && input.Status != models.StatusInProgress && input.Status != models.StatusCompleted {
		respondError(w, http.StatusBadRequest, "Invalid status value")
		return
	}

	task, err := h.repo.UpdateStatus(id, input.Status)
	if err != nil {
		if errors.Is(err, repository.ErrTaskNotFound) {
			respondError(w, http.StatusNotFound, "Task not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to update task status")
		return
	}

	respondJSON(w, http.StatusOK, task)
}

func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "Task ID is required")
		return
	}

	err := h.repo.Delete(id)
	if err != nil {
		if errors.Is(err, repository.ErrTaskNotFound) {
			respondError(w, http.StatusNotFound, "Task not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to delete task")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Task deleted successfully"})
}

func (h *TaskHandler) GetTaskStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.repo.GetStats()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to retrieve statistics")
		return
	}

	respondJSON(w, http.StatusOK, stats)
}

func (h *TaskHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{
		"status":  "healthy",
		"service": "engineering-task-manager-api",
	})
}
