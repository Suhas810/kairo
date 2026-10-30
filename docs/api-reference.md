# Kairo API Reference

Base URL prefix: `/api/v1`

Interactive API Documentation:
- Swagger UI: `http://localhost:8000/api/docs`
- OpenAPI JSON: `http://localhost:8000/api/openapi.json`

## Authentication

All protected endpoints require a Supabase JWT in the `Authorization` header:
```http
Authorization: Bearer <supabase-access-token>
```

---

## 1. Health & Readiness

### `GET /health`
Returns system status.
```json
{
  "status": "ok",
  "service": "kairo-api"
}
```

### `GET /ready`
Probes configured external dependencies.
```json
{
  "status": "ready",
  "service": "kairo-api",
  "integrations": {
    "supabase": true,
    "nvidia_ai": true,
    "github": false
  }
}
```

---

## 2. Authentication & User Profile

### `GET /api/v1/auth/me`
Returns the verified Supabase identity.

### `GET /api/v1/auth/profile`
Returns the user profile with custom preferences.

### `PATCH /api/v1/auth/profile`
Updates display name, avatar URL, bio, or preferences JSON.

---

## 3. Projects API

### `GET /api/v1/projects/`
Lists all projects owned by the authenticated caller.

### `POST /api/v1/projects/`
Creates a new project.
```json
{
  "name": "My Service",
  "description": "Backend API",
  "language": "Python"
}
```

### `GET /api/v1/projects/{project_id}`
Retrieves project details if owned by caller.

### `PATCH /api/v1/projects/{project_id}`
Updates permitted project fields (`name`, `description`, `repository_url`, `default_branch`, `language`, `status`).

### `DELETE /api/v1/projects/{project_id}`
Deletes project and cascades to related tasks and executions.

---

## 4. Repositories API

### `GET /api/v1/repositories/?project_id={uuid}`
Lists repositories connected to the project.

### `POST /api/v1/repositories/`
Connects a repository to a project.
```json
{
  "project_id": "061f6320-e711-4074-9689-b762b63cf4f4",
  "owner": "kairo",
  "repository": "kairo-api"
}
```

### `GET /api/v1/repositories/{owner}/{repo}`
Retrieves repository metadata.

### `GET /api/v1/repositories/{owner}/{repo}/tree`
Retrieves repository directory and file tree.

### `GET /api/v1/repositories/{owner}/{repo}/content?path={rel_path}`
Retrieves content of a file within the repository.

---

## 5. Tasks API

### `GET /api/v1/tasks/?project_id={uuid}`
Lists tasks belonging to the user.

### `POST /api/v1/tasks/`
Creates a development task.
```json
{
  "project_id": "061f6320-e711-4074-9689-b762b63cf4f4",
  "title": "Add healthcheck endpoint",
  "description": "Expose /health returning 200 OK",
  "priority": "high",
  "task_type": "feature"
}
```

### `GET /api/v1/tasks/{task_id}`
Retrieves task details.

### `PATCH /api/v1/tasks/{task_id}`
Updates task status, title, description, or priority.

### `GET /api/v1/tasks/{task_id}/status`
Lightweight polling endpoint returning status and numeric progress (0-100).

### `POST /api/v1/tasks/{task_id}/cancel`
Signals cancellation for a task.

---

## 6. AI Agent Orchestration API

### `POST /api/v1/agents/tasks`
Submits an autonomous development task to the agent orchestrator.
```json
{
  "project_id": "061f6320-e711-4074-9689-b762b63cf4f4",
  "task": "Add AST extraction utility with unit tests"
}
```

### `GET /api/v1/agents/tasks/{task_id}`
Retrieves agent session details, plan, and progress.

### `GET /api/v1/agents/tasks/{task_id}/activity`
Retrieves timeline events (planning, coding, tool calls, test output, review).

### `POST /api/v1/agents/tasks/{task_id}/cancel`
Cancels the running agent task.

---

## 7. Isolated Execution & Monitoring API

### `POST /api/v1/executions/`
Starts an isolated execution inside a sandbox container.

### `GET /api/v1/executions/{execution_id}`
Retrieves full execution details, duration, exit code, and test summary.

### `GET /api/v1/executions/{execution_id}/logs`
Returns execution log entries.

### `GET /api/v1/executions/{execution_id}/diff`
Returns unified git diff produced during execution.

### `GET /api/v1/executions/{execution_id}/stream`
Server-Sent Events (SSE) live log and status streaming endpoint.

---

## 8. Webhooks API

### `POST /api/v1/webhooks/github`
Verifies HMAC-SHA256 signature using `GITHUB_WEBHOOK_SECRET` before processing GitHub push, ping, or pull request events.

