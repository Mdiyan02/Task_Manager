# Presentation & Demonstration Guide (30-Minute Script)

This guide is structured specifically for the **30-minute final evaluation presentation** of the **Engineering Task Manager**. It covers all architectural decisions, technical trade-offs, code walkthrough points, testing strategy, Docker orchestration, and future roadmap.

---

## Presentation Agenda (30 Minutes)

| Time | Topic | Key Talking Points |
|---|---|---|
| **00:00 - 03:00** | **Requirement Understanding & Problem Statement** | Daily engineering task tracking, functional & non-functional goals |
| **03:00 - 07:00** | **Overall Architecture & System Topology** | Monorepo layout, Go REST API, PostgreSQL database, React SPA |
| **07:00 - 10:00** | **Database Schema & ORM / SQL Layer** | PostgreSQL tables, indexes, DDL migrations, automated seed data |
| **10:00 - 13:00** | **Backend API Design & Go Implementation** | RESTful principles, chi router, parameterized queries, middleware |
| **13:00 - 18:00** | **Frontend Design & Interactive UI Demo** | React 18, List vs Kanban view, Recharts stats, modals, micro-animations |
| **18:00 - 22:00** | **Testing Strategy & Quality Assurance** | Go `httptest` suite (0.78s), Vitest React component suite |
| **22:00 - 25:00** | **Docker Setup & Deployment Strategy** | Multi-stage Alpine builds, single command `docker compose up`, cloud options |
| **25:00 - 28:00** | **Challenges Faced & AI Tool Utilization** | Database driver cross-compilation, state synchronization, AI prompting |
| **28:00 - 30:00** | **Future Improvements & Q&A** | WebSockets, JWT Auth, Team Workspaces, CI/CD pipeline |

---

## Detailed Topic Guides for Presenter

### 1. Requirement Understanding
- **Goal**: Help engineering teams track daily tasks across categories (Frontend, Backend, DevOps, Bug Fixes, Features).
- **Core Features Demonstrated**:
  - Full CRUD operations (Create, View, Update, Delete, Toggle Complete).
  - Search by keyword in title/description.
  - Multi-tier filtering by Status, Priority, and Category.
  - Dynamic sorting by Due Date, Priority, Creation Date, and Title.
  - Visual Metrics Dashboard (Completion rate, overdue warnings, priority breakdown).

### 2. Overall Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     User Browser                        │
│            React 18 + TypeScript + Vite (Port 3000)     │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP REST / JSON
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Go (Golang) REST API                 │
│              net/http + Chi Router (Port 8080)          │
└────────────────────────────┬────────────────────────────┘
                             │ SQL Queries (pgx / lib/pq)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 PostgreSQL 16 Database                  │
│                Containerized (Port 5432)                │
└─────────────────────────────────────────────────────────┘
```

### 3. Technology Choices Justification
- **Go (Golang) for Backend**: Extremely high performance, low RAM footprint (~15MB Docker image), fast startup time (<10ms), native concurrency capabilities.
- **PostgreSQL for Database**: Robust relational model, strict schema enforcement, JSON support, indexed query execution.
- **React 18 + TypeScript + Vite for Frontend**: Instant HMR dev experience, type safety across API contracts, modular component model.
- **Tailwind CSS & Lucide**: Sleek glassmorphism aesthetic, accessible contrast, responsive breakpoints.

### 4. Database Design & SQL Security
- Indexes placed on `status`, `priority`, and `due_date` columns for high query performance.
- All SQL queries use parameterized arguments (`$1`, `$2` in Postgres; `?` in SQLite fallback) to prevent SQL injection vulnerabilities.
- Automated migrations and seed data on app startup.

### 5. Frontend Design Decisions
- **Dual View Modes**: Switch seamlessly between a clean **List View** and a visual **Kanban Board** (To Do, In Progress, Completed columns).
- **Glassmorphism & Micro-animations**: Subtle backdrop blurs, glow borders on hover, loading skeleton shimmers, and toast notifications.
- **Optimistic UI Updates**: Status toggle immediately updates UI state while syncing asynchronously with backend API.

### 6. Testing Strategy
- **Backend API Integration Tests**: Uses Go standard `httptest` with an in-memory SQLite database to run full HTTP requests against handlers. Execution time: **0.78 seconds**.
- **Frontend Component Tests**: Uses Vitest + React Testing Library + JSDOM to test task card rendering, empty state fallbacks, and user interaction callbacks.

### 7. Docker Orchestration
- **Single Command Startup**: `docker compose up --build` launches PostgreSQL, Go API server, and React Nginx web server.
- **Multi-Stage Builds**:
  - Backend: `golang:1.24-alpine` builder -> `alpine:3.19` runner (~15MB final image).
  - Frontend: `node:22-alpine` Vite build -> `nginx:alpine` production runner (~25MB final image).
- Container health check ensures Go backend waits for PostgreSQL `pg_isready` signal before starting.

### 8. How AI Tools Were Used
- Used AI agentic coding (Antigravity) for rapid architecture bootstrapping, initial schema planning, refactoring Go handlers, and generating clean UI components.
- Verified AI outputs by running automated test suites (`go test` and `vitest run`) and validating build output.

### 9. Future Roadmap & Improvements
- **Authentication**: JWT / OAuth2 user registration & login.
- **Real-Time Collaboration**: WebSockets for live Kanban board updates across team members.
- **Subtasks & Attachments**: Ability to break down tasks into sub-checklist items and attach file logs.
