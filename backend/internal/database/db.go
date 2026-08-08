package database

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	_ "modernc.org/sqlite"
)

type DB struct {
	*sql.DB
	Driver string
}

func InitDB(databaseURL string) (*DB, error) {
	var driverName string
	var connStr string

	if databaseURL != "" && strings.HasPrefix(databaseURL, "postgres") {
		driverName = "postgres"
		connStr = databaseURL
	} else if databaseURL != "" && strings.HasPrefix(databaseURL, "sqlite") {
		driverName = "sqlite"
		connStr = strings.TrimPrefix(databaseURL, "sqlite://")
	} else {
		driverName = "sqlite"
		connStr = "taskmanager.db"
	}

	log.Printf("Connecting to database using driver: %s", driverName)

	db, err := sql.Open(driverName, connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	if driverName == "postgres" {
		db.SetMaxOpenConns(25)
		db.SetMaxIdleConns(5)
		db.SetConnMaxLifetime(5 * time.Minute)
	}

	// Retry connection logic for containerized environments
	maxRetries := 10
	for i := 1; i <= maxRetries; i++ {
		err = db.Ping()
		if err == nil {
			log.Printf("Successfully connected to database on attempt %d", i)
			break
		}
		log.Printf("Database connection attempt %d/%d failed: %v. Retrying in 2s...", i, maxRetries, err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to ping database after %d attempts: %w", maxRetries, err)
	}

	customDB := &DB{DB: db, Driver: driverName}

	if err := customDB.Migrate(); err != nil {
		return nil, fmt.Errorf("failed to run database migrations: %w", err)
	}

	if err := customDB.SeedIfEmpty(); err != nil {
		log.Printf("Warning: Seed database error: %v", err)
	}

	return customDB, nil
}

func (db *DB) Migrate() error {
	var schema string

	if db.Driver == "postgres" {
		schema = `
		CREATE TABLE IF NOT EXISTS tasks (
			id VARCHAR(36) PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			description TEXT NOT NULL,
			due_date TIMESTAMPTZ NOT NULL,
			priority VARCHAR(20) NOT NULL,
			status VARCHAR(20) NOT NULL,
			category VARCHAR(50) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL,
			updated_at TIMESTAMPTZ NOT NULL
		);

		CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
		CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
		CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
		`
	} else {
		schema = `
		CREATE TABLE IF NOT EXISTS tasks (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT NOT NULL,
			due_date DATETIME NOT NULL,
			priority TEXT NOT NULL,
			status TEXT NOT NULL,
			category TEXT NOT NULL,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL
		);

		CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
		CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
		CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
		`
	}

	_, err := db.Exec(schema)
	if err != nil {
		return fmt.Errorf("migration execution failed: %w", err)
	}

	log.Println("Database migration completed successfully.")
	return nil
}

func (db *DB) SeedIfEmpty() error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM tasks").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		return nil
	}

	log.Println("Seeding sample engineering tasks...")

	now := time.Now()
	sampleTasks := []struct {
		title       string
		description string
		dueDays     int
		priority    string
		status      string
		category    string
	}{
		{
			title:       "Set up PostgreSQL Database & Migrations",
			description: "Configure PostgreSQL container with Docker Compose and implement automatic table schema migrations.",
			dueDays:     -2, // Overdue
			priority:    "HIGH",
			status:      "COMPLETED",
			category:    "BACKEND",
		},
		{
			title:       "Design RESTful API for Task Management",
			description: "Implement Go HTTP handlers with CRUD endpoints, search, filtering, and aggregate stats calculation.",
			dueDays:     -1,
			priority:    "URGENT",
			status:      "COMPLETED",
			category:    "BACKEND",
		},
		{
			title:       "Build Interactive React Dashboard & Charts",
			description: "Develop responsive task metrics view featuring total task count, overdue warnings, and priority breakdown using Recharts.",
			dueDays:     1,
			priority:    "HIGH",
			status:      "IN_PROGRESS",
			category:    "FRONTEND",
		},
		{
			title:       "Implement Drag-and-Drop Kanban Board View",
			description: "Create visual Kanban workflow columns for TODO, IN_PROGRESS, and COMPLETED statuses with quick status updates.",
			dueDays:     3,
			priority:    "MEDIUM",
			status:      "IN_PROGRESS",
			category:    "FRONTEND",
		},
		{
			title:       "Configure Docker Multi-stage Builds",
			description: "Optimize Dockerfiles for Go backend binary compilation and React Vite Nginx static asset hosting.",
			dueDays:     5,
			priority:    "URGENT",
			status:      "TODO",
			category:    "DEVOPS",
		},
		{
			title:       "Write Automated API & Component Unit Tests",
			description: "Add Go httptest integration test suite for backend endpoints and Vitest tests for React UI components.",
			dueDays:     7,
			priority:    "HIGH",
			status:      "TODO",
			category:    "BUG",
		},
		{
			title:       "Add Dark Mode Theme Switcher",
			description: "Implement modern dark/light mode toggle with CSS variables and persistent localStorage state.",
			dueDays:     10,
			priority:    "LOW",
			status:      "TODO",
			category:    "FEATURE",
		},
	}

	for _, t := range sampleTasks {
		id := uuid.New().String()
		dueDate := now.AddDate(0, 0, t.dueDays)
		createdAt := now.AddDate(0, 0, -3)
		updatedAt := now

		var query string
		if db.Driver == "postgres" {
			query = `INSERT INTO tasks (id, title, description, due_date, priority, status, category, created_at, updated_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
		} else {
			query = `INSERT INTO tasks (id, title, description, due_date, priority, status, category, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
		}

		_, err := db.Exec(query, id, t.title, t.description, dueDate, t.priority, t.status, t.category, createdAt, updatedAt)
		if err != nil {
			log.Printf("Error seeding task %s: %v", t.title, err)
		}
	}

	log.Println("Sample engineering tasks seeded successfully.")
	return nil
}
