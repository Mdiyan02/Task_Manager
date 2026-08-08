package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/engineering-task-manager/backend/internal/database"
	"github.com/engineering-task-manager/backend/internal/handlers"
	"github.com/engineering-task-manager/backend/internal/repository"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	databaseURL := os.Getenv("DATABASE_URL")

	db, err := database.InitDB(databaseURL)
	if err != nil {
		log.Fatalf("Fatal: Could not initialize database: %v", err)
	}
	defer db.Close()

	taskRepo := repository.NewTaskRepository(db)
	taskHandler := handlers.NewTaskHandler(taskRepo)

	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// CORS Setup
	allowedOriginsEnv := os.Getenv("CORS_ALLOWED_ORIGINS")
	allowedOrigins := []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080"}
	if allowedOriginsEnv != "" {
		allowedOrigins = strings.Split(allowedOriginsEnv, ",")
	}

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Routes
	r.Get("/", taskHandler.RootWelcome)
	r.Get("/health", taskHandler.HealthCheck)

	r.Route("/api/tasks", func(r chi.Router) {
		r.Get("/", taskHandler.GetAllTasks)
		r.Get("/stats", taskHandler.GetTaskStats)
		r.Get("/{id}", taskHandler.GetTaskByID)
		r.Post("/", taskHandler.CreateTask)
		r.Put("/{id}", taskHandler.UpdateTask)
		r.Patch("/{id}/status", taskHandler.UpdateTaskStatus)
		r.Delete("/{id}", taskHandler.DeleteTask)
	})

	log.Printf("🚀 Go Engineering Task Manager REST API running on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
