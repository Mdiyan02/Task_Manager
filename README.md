# Engineering Task Manager

A modern, high-performance full-stack web application designed for engineering teams to organize, track, filter, and execute daily engineering tasks with ease.

Built with a **Go (Golang)** REST API backend, **PostgreSQL 16** relational database, **React 18 + TypeScript + Vite** frontend, **Docker Compose** containerization, and comprehensive automated test suites.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture & System Topology](#architecture--system-topology)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Getting Started / Installation](#getting-started--installation)
- [Running Locally](#running-locally)
- [Docker Setup (`docker compose up`)](#docker-setup-docker-compose-up)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Testing Instructions](#testing-instructions)
- [Deployment Guide](#deployment-guide)
- [Assumptions](#assumptions)
- [Future Improvements](#future-improvements)

---

## Project Overview

Engineering teams manage high-velocity daily tasks ranging from backend REST API development and database migrations to frontend UI polish, DevOps containerization, and urgent bug fixes. 

The **Engineering Task Manager** provides a clean, responsive, and intuitive interface with a real-time metrics dashboard, status/priority filtering, full-text title search, dynamic sorting, and dual view modes (List View and Kanban Board).

---

## Features

- **Task Creation & Management**: Create, view, update, delete, and toggle completion status for daily engineering tasks.
- **Detailed Metadata**: Each task includes Title, Description, Due Date, Priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), Status (`TODO`, `IN_PROGRESS`, `COMPLETED`), Category (`FRONTEND`, `BACKEND`, `DEVOPS`, `BUG`, `FEATURE`, `GENERAL`), Created Date, and Updated Date.
- **Real-Time Search**: Search tasks instantly by title or description keyword.
- **Multi-Criteria Filtering**: Filter by Status, Priority, and Engineering Category.
- **Dynamic Sorting**: Sort by Due Date, Priority level, Creation Date, or Title in ascending/descending order.
- **Dual View Modes**:
  - **List View**: Clean, compact task cards with action buttons and badge indicators.
  - **Kanban Board**: 3-column workflow columns (To Do, In Progress, Completed) with task counts.
- **Metrics Dashboard**: Visual statistics cards showing total tasks, in-progress count, completed tasks, overdue warnings, and completion percentage progress bar.
- **Dark & Light Mode**: Theme switcher with persistent `localStorage` state.
- **Responsive & Accessible**: Optimized for mobile, tablet, and desktop screens with keyboard accessibility and glassmorphism UI styling.

---

## Architecture & System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    React 18 Frontend SPA                    │
│        Vite + TypeScript + Tailwind CSS (Port 3000)         │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST API / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Go (Golang) REST API Server                 │
│               net/http + Chi Router (Port 8080)             │
└──────────────────────────────┬──────────────────────────────┘
                               │ Parameterized SQL Queries
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL 16 Database                    │
│             Relational Storage (Port 5432)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **Icons**: Lucide React
- **Analytics/Charts**: Recharts
- **Testing**: Vitest + React Testing Library + JSDOM

### Backend
- **Language**: Go (Golang 1.24)
- **Router**: Go Chi (`github.com/go-chi/chi/v5`)
- **Database Driver**: `github.com/lib/pq` (PostgreSQL) / `modernc.org/sqlite` (Pure-Go fallback)
- **Middleware**: CORS, Logger, Recoverer, RequestID
- **Testing**: Native Go `testing` package with `httptest`

### Database & Infrastructure
- **Database**: PostgreSQL 16 Alpine
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx Alpine (Serving compiled React static SPA)

---

## Folder Structure

```
Task_Manager/
├── backend/                  # Go REST API Backend
│   ├── cmd/
│   │   └── server/
│   │       └── main.go       # HTTP server entry point & middleware
│   ├── internal/
│   │   ├── database/         # Postgres/SQLite connection, DDL migrations, seed data
│   │   ├── handlers/         # REST API HTTP handlers & route logic
│   │   │   └── task_handler_test.go # Go httptest API integration tests
│   │   ├── models/           # Go struct definitions & validation logic
│   │   └── repository/       # Database SQL query layer & stats aggregation
│   ├── Dockerfile            # Multi-stage Go Alpine Dockerfile
│   └── go.mod                # Go module dependencies
├── frontend/                 # React + TypeScript Frontend Application
│   ├── src/
│   │   ├── components/       # Header, DashboardStats, TaskControls, TaskList, KanbanBoard, Modals
│   │   ├── services/         # API fetch client
│   │   ├── tests/            # Vitest component UI tests
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Main application state container
│   │   └── index.css         # Tailwind & glassmorphism custom styles
│   ├── Dockerfile            # Multi-stage Nginx production Dockerfile
│   ├── nginx.conf            # Nginx SPA router & API proxy config
│   ├── package.json          # npm dependencies
│   └── vite.config.ts        # Vite & Vitest configuration
├── docker-compose.yml        # Unified multi-container orchestration
├── API_DOCUMENTATION.md      # Detailed REST API schema documentation
├── PRESENTATION_GUIDE.md     # 30-minute demonstration script & talking points
└── README.md                 # Complete technical documentation
```

---

## Getting Started / Installation

### Prerequisites
- **Git**
- **Docker & Docker Compose** (Recommended)
- *Optional for local dev without Docker*: Go (1.20+) and Node.js (v18+)

```bash
# Clone the repository
git clone https://github.com/your-username/engineering-task-manager.git
cd engineering-task-manager
```

---

## Running Locally

### Option 1: Docker Compose (Single Command - Recommended)
```bash
docker compose up --build
```
Access the application:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Go REST API Health Check**: [http://localhost:8081/health](http://localhost:8081/health)
- **Go REST API Tasks Endpoint**: [http://localhost:8081/api/tasks](http://localhost:8081/api/tasks)

---

### Option 2: Running Backend & Frontend Manually

#### Step 1: Start Backend (Go API)
```bash
cd backend
go run cmd/server/main.go
```
*Note: If no `DATABASE_URL` is set, the backend automatically uses embedded SQLite `taskmanager.db` for instant local execution.*

#### Step 2: Start Frontend (React Vite)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Docker Setup (`docker compose up`)

The `docker-compose.yml` file configures three services:
1. **`db`**: PostgreSQL 16 Alpine container with data volume persistence (`postgres_data`) and health check (`pg_isready`).
2. **`backend`**: Multi-stage Go container built on Alpine, depending on PostgreSQL healthcheck.
3. **`frontend`**: Multi-stage Nginx container serving compiled Vite bundle and proxying `/api` requests to backend.

To stop and remove containers:
```bash
docker compose down -v
```

---

## Environment Variables

### Backend (`/backend`)
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8080` | HTTP Server port |
| `DATABASE_URL` | `postgres://postgres:postgrespassword@db:5432/taskmanager?sslmode=disable` | Connection string |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Allowed CORS origins |

### Frontend (`/frontend`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `/api/tasks` | API endpoint base URL |

---

## API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for full endpoint specifications, request/response JSON examples, query parameter filters, and error codes.

---

## Testing Instructions

### Running Backend Unit & REST API Integration Tests
```bash
cd backend
go test -v ./...
```
*Executes native Go tests using `httptest` against SQLite in-memory database.*

### Running Frontend Component Tests
```bash
cd frontend
npm test
```
*Executes Vitest + React Testing Library tests for UI components.*

---

## Deployment Guide

### Deploying to Production Platforms (e.g. Render / Railway / Vercel)

1. **Deploy Database**: Provision a managed PostgreSQL instance on Render or Railway and copy the `DATABASE_URL`.
2. **Deploy Backend (Go API)**:
   - Connect GitHub repository to Render/Railway.
   - Root directory: `backend`
   - Build Command: `go build -o server ./cmd/server`
   - Start Command: `./server`
   - Environment Variables: Set `DATABASE_URL` and `CORS_ALLOWED_ORIGINS`.
3. **Deploy Frontend (React)**:
   - Connect GitHub repository to Vercel/Netlify.
   - Root directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: Set `VITE_API_URL` to your deployed backend URL.

---

## Assumptions

1. **Monorepo Structure**: Placing `/frontend` and `/backend` in a single repository simplifies code sharing, Docker orchestration, and presentation walkthroughs.
2. **PostgreSQL & Fallback**: Docker Compose runs PostgreSQL 16; running backend without Docker defaults to embedded SQLite so developer setup requires zero setup overhead.
3. **Seed Data**: Populating initial engineering tasks on first run helps evaluators instantly test search, filter, and metrics features.

---

## Future Improvements

- [ ] **Authentication & Authorization**: Add JWT / OAuth2 user registration, login, and task ownership.
- [ ] **Real-Time WebSockets**: Multi-user live synchronization on Kanban board drag-and-drop.
- [ ] **Task Sub-Items**: Checklist breakdown within tasks.
- [ ] **Export & Import**: Export tasks to CSV or JSON format.
- [ ] **CI/CD Pipeline**: GitHub Actions workflow for automated testing and linting on push.
