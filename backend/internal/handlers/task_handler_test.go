package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/engineering-task-manager/backend/internal/database"
	"github.com/engineering-task-manager/backend/internal/models"
	"github.com/engineering-task-manager/backend/internal/repository"
	"github.com/go-chi/chi/v5"
)

func setupTestDB(t *testing.T) (*database.DB, *TaskHandler) {
	db, err := database.InitDB("sqlite://:memory:")
	if err != nil {
		t.Fatalf("Failed to initialize test database: %v", err)
	}

	repo := repository.NewTaskRepository(db)
	handler := NewTaskHandler(repo)
	return db, handler
}

func setupRouter(handler *TaskHandler) *chi.Mux {
	r := chi.NewRouter()
	r.Get("/health", handler.HealthCheck)
	r.Route("/api/tasks", func(r chi.Router) {
		r.Get("/", handler.GetAllTasks)
		r.Get("/stats", handler.GetTaskStats)
		r.Get("/{id}", handler.GetTaskByID)
		r.Post("/", handler.CreateTask)
		r.Put("/{id}", handler.UpdateTask)
		r.Patch("/{id}/status", handler.UpdateTaskStatus)
		r.Delete("/{id}", handler.DeleteTask)
	})
	return r
}

func TestHealthCheck(t *testing.T) {
	db, handler := setupTestDB(t)
	defer db.Close()

	router := setupRouter(handler)
	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200 OK, got %d", rec.Code)
	}

	var resp map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if resp["status"] != "healthy" {
		t.Errorf("Expected status healthy, got %s", resp["status"])
	}
}

func TestCreateAndGetTask(t *testing.T) {
	db, handler := setupTestDB(t)
	defer db.Close()

	router := setupRouter(handler)

	createInput := models.CreateTaskInput{
		Title:       "Test Go Handler Task",
		Description: "Testing REST API task creation in Go",
		DueDate:     time.Now().Add(48 * time.Hour),
		Priority:    models.PriorityHigh,
		Status:      models.StatusTodo,
		Category:    models.CategoryBackend,
	}

	body, _ := json.Marshal(createInput)
	req := httptest.NewRequest("POST", "/api/tasks", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("Expected status 201 Created, got %d: %s", rec.Code, rec.Body.String())
	}

	var createdTask models.Task
	if err := json.NewDecoder(rec.Body).Decode(&createdTask); err != nil {
		t.Fatalf("Failed to decode created task: %v", err)
	}

	if createdTask.Title != createInput.Title {
		t.Errorf("Expected title %s, got %s", createInput.Title, createdTask.Title)
	}
	if createdTask.ID == "" {
		t.Errorf("Expected non-empty ID")
	}

	// Fetch Created Task By ID
	getReq := httptest.NewRequest("GET", "/api/tasks/"+createdTask.ID, nil)
	getRec := httptest.NewRecorder()
	router.ServeHTTP(getRec, getReq)

	if getRec.Code != http.StatusOK {
		t.Errorf("Expected status 200 OK for GET task by ID, got %d", getRec.Code)
	}
}

func TestUpdateTaskStatus(t *testing.T) {
	db, handler := setupTestDB(t)
	defer db.Close()

	router := setupRouter(handler)

	// Create Initial Task
	createInput := models.CreateTaskInput{
		Title:       "Status Toggle Task",
		Description: "Task to test status change endpoint",
		DueDate:     time.Now().Add(24 * time.Hour),
		Priority:    models.PriorityMedium,
		Status:      models.StatusTodo,
		Category:    models.CategoryFrontend,
	}
	body, _ := json.Marshal(createInput)
	req := httptest.NewRequest("POST", "/api/tasks", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	var createdTask models.Task
	_ = json.NewDecoder(rec.Body).Decode(&createdTask)

	// Patch Status to COMPLETED
	patchBody, _ := json.Marshal(models.UpdateStatusInput{Status: models.StatusCompleted})
	patchReq := httptest.NewRequest("PATCH", "/api/tasks/"+createdTask.ID+"/status", bytes.NewBuffer(patchBody))
	patchReq.Header.Set("Content-Type", "application/json")
	patchRec := httptest.NewRecorder()
	router.ServeHTTP(patchRec, patchReq)

	if patchRec.Code != http.StatusOK {
		t.Fatalf("Expected status 200 OK on PATCH status, got %d", patchRec.Code)
	}

	var updatedTask models.Task
	_ = json.NewDecoder(patchRec.Body).Decode(&updatedTask)

	if updatedTask.Status != models.StatusCompleted {
		t.Errorf("Expected status COMPLETED, got %s", updatedTask.Status)
	}
}

func TestDeleteTask(t *testing.T) {
	db, handler := setupTestDB(t)
	defer db.Close()

	router := setupRouter(handler)

	createInput := models.CreateTaskInput{
		Title:       "Task to Delete",
		Description: "Will be deleted",
		DueDate:     time.Now().Add(24 * time.Hour),
		Priority:    models.PriorityLow,
		Status:      models.StatusTodo,
		Category:    models.CategoryGeneral,
	}
	body, _ := json.Marshal(createInput)
	req := httptest.NewRequest("POST", "/api/tasks", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	var createdTask models.Task
	_ = json.NewDecoder(rec.Body).Decode(&createdTask)

	// Delete Task
	delReq := httptest.NewRequest("DELETE", "/api/tasks/"+createdTask.ID, nil)
	delRec := httptest.NewRecorder()
	router.ServeHTTP(delRec, delReq)

	if delRec.Code != http.StatusOK {
		t.Fatalf("Expected status 200 OK on DELETE, got %d", delRec.Code)
	}

	// Verify 404 on subsequent GET
	getReq := httptest.NewRequest("GET", "/api/tasks/"+createdTask.ID, nil)
	getRec := httptest.NewRecorder()
	router.ServeHTTP(getRec, getReq)

	if getRec.Code != http.StatusNotFound {
		t.Errorf("Expected status 404 Not Found after deletion, got %d", getRec.Code)
	}
}
