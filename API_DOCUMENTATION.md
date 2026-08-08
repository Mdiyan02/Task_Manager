# REST API Documentation - Engineering Task Manager

Base URL: `http://localhost:8080/api/tasks`

The Engineering Task Manager REST API is built in Go (Golang) adhering to standard REST principles, returning formatted JSON payloads and utilizing standard HTTP status codes.

---

## Data Models

### Task Object
```json
{
  "id": "c7a8b9f0-1234-4567-89ab-cdef01234567",
  "title": "Set up PostgreSQL Database & Migrations",
  "description": "Configure PostgreSQL container with Docker Compose and implement automatic table schema migrations.",
  "dueDate": "2026-08-06T16:00:00Z",
  "priority": "HIGH",
  "status": "COMPLETED",
  "category": "BACKEND",
  "createdAt": "2026-08-05T10:00:00Z",
  "updatedAt": "2026-08-08T12:00:00Z"
}
```

#### Fields Breakdown
| Field | Type | Description | Values / Constraints |
|---|---|---|---|
| `id` | `string` | Unique identifier (UUID v4) | Generated automatically |
| `title` | `string` | Short title of the task | Required, max 150 characters |
| `description` | `string` | Detailed technical context | Optional |
| `dueDate` | `string` | Target completion timestamp | Required, ISO-8601 string |
| `priority` | `string` | Task severity / urgency level | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `status` | `string` | Execution status | `TODO`, `IN_PROGRESS`, `COMPLETED` |
| `category` | `string` | Engineering domain category | `FRONTEND`, `BACKEND`, `DEVOPS`, `BUG`, `FEATURE`, `GENERAL` |
| `createdAt` | `string` | Creation timestamp | Auto-generated ISO timestamp |
| `updatedAt` | `string` | Last modification timestamp | Auto-updated ISO timestamp |

---

## Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check endpoint |
| `GET` | `/api/tasks` | List all tasks with search, filter, and sorting |
| `GET` | `/api/tasks/stats` | Retrieve aggregate metrics and counts |
| `GET` | `/api/tasks/{id}` | Get single task details by ID |
| `POST` | `/api/tasks` | Create a new engineering task |
| `PUT` | `/api/tasks/{id}` | Update existing task details |
| `PATCH` | `/api/tasks/{id}/status` | Quick toggle/update task status |
| `DELETE` | `/api/tasks/{id}` | Permanently delete a task |

---

## Endpoint Details

### 1. Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "service": "engineering-task-manager-api",
  "status": "healthy"
}
```

---

### 2. Retrieve All Tasks (With Filtering, Search & Sorting)
- **URL**: `/api/tasks`
- **Method**: `GET`
- **Query Parameters**:
  - `search` (optional): Case-insensitive string search against `title` and `description`.
  - `status` (optional): Filter by status (`TODO`, `IN_PROGRESS`, `COMPLETED`).
  - `priority` (optional): Filter by priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - `category` (optional): Filter by category (`FRONTEND`, `BACKEND`, `DEVOPS`, `BUG`, `FEATURE`, `GENERAL`).
  - `sort_by` (optional): Field to sort by (`due_date`, `priority`, `created_at`, `title`). Default: `due_date`.
  - `order` (optional): Sort direction (`asc`, `desc`). Default: `asc`.

- **Example Request**:
  `GET /api/tasks?status=IN_PROGRESS&priority=HIGH&sort_by=due_date&order=asc`

- **Response**: `200 OK`
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Build Interactive React Dashboard & Charts",
    "description": "Develop responsive task metrics view featuring total task count and priority breakdown.",
    "dueDate": "2026-08-09T18:00:00Z",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "category": "FRONTEND",
    "createdAt": "2026-08-05T10:00:00Z",
    "updatedAt": "2026-08-08T14:30:00Z"
  }
]
```

---

### 3. Retrieve Task Statistics
- **URL**: `/api/tasks/stats`
- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "total": 7,
  "todo": 3,
  "inProgress": 2,
  "completed": 2,
  "overdue": 1,
  "lowPriority": 1,
  "mediumPriority": 2,
  "highPriority": 2,
  "urgentPriority": 2
}
```

---

### 4. Get Task by ID
- **URL**: `/api/tasks/{id}`
- **Method**: `GET`
- **Response**: `200 OK` on success, `404 Not Found` if task ID does not exist.

---

### 5. Create Task
- **URL**: `/api/tasks`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "Implement OAuth2 Token Refresh",
  "description": "Add refresh token rotation middleware in Go server.",
  "dueDate": "2026-08-12T23:59:59Z",
  "priority": "HIGH",
  "status": "TODO",
  "category": "BACKEND"
}
```
- **Response**: `201 Created`

---

### 6. Update Task
- **URL**: `/api/tasks/{id}`
- **Method**: `PUT`
- **Headers**: `Content-Type: application/json`
- **Request Body**: Partial or full fields to update.
- **Response**: `200 OK`

---

### 7. Update Task Status
- **URL**: `/api/tasks/{id}/status`
- **Method**: `PATCH`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "status": "COMPLETED"
}
```
- **Response**: `200 OK`

---

### 8. Delete Task
- **URL**: `/api/tasks/{id}`
- **Method**: `DELETE`
- **Response**: `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

---

## Error Handling & HTTP Status Codes

- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or malformed JSON payload.
- `404 Not Found`: Task ID requested does not exist in database.
- `500 Internal Server Error`: Unexpected server or database exception.

Error format:
```json
{
  "error": "title is required"
}
```
