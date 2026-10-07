# API Reference

## Overview

The Kairo API provides the communication layer between the frontend, agent system, database, AI infrastructure, and external services.

The backend is built using **Python + FastAPI**.

```text
Frontend
   ↓
Kairo API
   ↓
FastAPI
   ↓
Agent System
   ├── Planner
   ├── Research
   ├── Coding
   ├── Testing
   └── Debugging
   ↓
External Services
   ├── Nebius
   ├── Tavily
   └── Supabase
```

---

## Base URLs

### Local Development

```text
http://localhost:8000
```

### Production

```text
https://<backend-production-domain>
```

The production URL should be configured through the frontend environment:

```env
VITE_API_URL=https://<backend-production-domain>
```

---

# API Versioning

Kairo APIs should be versioned to prevent breaking existing clients.

Recommended prefix:

```text
/api/v1
```

Example:

```text
/api/v1/health
/api/v1/auth
/api/v1/projects
/api/v1/agents
```

---

# Health API

## Check API Health

```http
GET /api/v1/health
```

### Response

```json
{
  "status": "ok"
}
```

### Purpose

Used to verify that the backend is running and responding correctly.

---

# Authentication API

Authentication endpoints handle user authentication and session validation.

```text
/api/v1/auth
```

Detailed authentication behavior is documented in:

```text
authentication.md
```

---

# Project API

Kairo projects represent workspaces where users can organize agent tasks.

## Create Project

```http
POST /api/v1/projects
```

### Request

```json
{
  "name": "My Project",
  "description": "Project description"
}
```

### Response

```json
{
  "id": "project-id",
  "name": "My Project",
  "description": "Project description",
  "created_at": "2026-10-07T12:00:00Z"
}
```

---

## Get Projects

```http
GET /api/v1/projects
```

### Response

```json
{
  "projects": [
    {
      "id": "project-id",
      "name": "My Project",
      "description": "Project description"
    }
  ]
}
```

---

## Get Project

```http
GET /api/v1/projects/{project_id}
```

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `project_id` | string | Unique project identifier |

---

## Delete Project

```http
DELETE /api/v1/projects/{project_id}
```

### Response

```json
{
  "success": true
}
```

---

# Agent API

The Agent API is the primary interface for executing Kairo's autonomous workflow.

```text
/api/v1/agents
```

---

## Create Agent Task

```http
POST /api/v1/agents/tasks
```

### Request

```json
{
  "project_id": "project-id",
  "task": "Build a REST API for user management",
  "mode": "autonomous"
}
```

### Response

```json
{
  "task_id": "task-id",
  "status": "queued"
}
```

---

## Get Agent Task

```http
GET /api/v1/agents/tasks/{task_id}
```

### Response

```json
{
  "task_id": "task-id",
  "status": "running",
  "current_stage": "coding"
}
```

Possible stages:

```text
planning
research
coding
testing
debugging
completed
failed
```

---

## Stop Agent Task

```http
POST /api/v1/agents/tasks/{task_id}/stop
```

### Response

```json
{
  "task_id": "task-id",
  "status": "stopped"
}
```

---

## Get Agent Result

```http
GET /api/v1/agents/tasks/{task_id}/result
```

### Response

```json
{
  "task_id": "task-id",
  "status": "completed",
  "result": {
    "summary": "Task completed successfully",
    "files_changed": [],
    "tests_passed": true
  }
}
```

---

# Agent Workflow

A typical agent request follows:

```text
POST /agents/tasks
        ↓
Create Task
        ↓
Planning
        ↓
Research
        ↓
Coding
        ↓
Testing
        ↓
Debugging
        ↓
Completion
```

The agent may repeat testing and debugging when problems are detected.

---

# Research API

Research operations allow the agent to retrieve external information.

```http
POST /api/v1/research
```

### Request

```json
{
  "query": "FastAPI authentication best practices"
}
```

### Response

```json
{
  "query": "FastAPI authentication best practices",
  "results": []
}
```

The research system may use Tavily as the search provider.

---

# Code Execution API

Code execution should be handled internally by the agent system rather than directly exposed to untrusted clients.

Internal workflow:

```text
Agent
 ↓
Code Generation
 ↓
Execution Environment
 ↓
Test
 ↓
Result
```

The execution environment must be isolated from the main application.

---

# Testing API

## Run Tests

```http
POST /api/v1/agents/tasks/{task_id}/test
```

### Response

```json
{
  "status": "completed",
  "passed": true,
  "tests_run": 12,
  "tests_passed": 12,
  "tests_failed": 0
}
```

---

# Debugging API

## Start Debugging

```http
POST /api/v1/agents/tasks/{task_id}/debug
```

### Response

```json
{
  "status": "debugging",
  "issue_count": 2
}
```

The agent can then analyze failures and attempt fixes.

---

# Error Responses

The API uses standard HTTP status codes.

| Status | Meaning |
|---|---|
| `200` | Successful request |
| `201` | Resource created |
| `400` | Invalid request |
| `401` | Authentication required |
| `403` | Permission denied |
| `404` | Resource not found |
| `409` | Resource conflict |
| `422` | Validation error |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
| `503` | External service unavailable |

---

# Standard Error Format

Errors should use a consistent response structure.

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {}
  }
}
```

Do not expose:

- API keys
- Internal stack traces
- Database credentials
- Infrastructure secrets
- Internal service credentials

---

# Request Validation

FastAPI request models should validate incoming data.

Example:

```json
{
  "task": "Build an authentication API",
  "project_id": "project-123"
}
```

Invalid requests should return:

```http
422 Unprocessable Entity
```

---

# Rate Limiting

Rate limits should be applied to expensive operations, especially:

- Agent execution
- AI requests
- Research requests
- Code execution

Example:

```text
User
 ↓
API Request
 ↓
Rate Limiter
 ↓
Allowed?
 ├── Yes → Process
 └── No  → 429
```

---

# API Documentation

FastAPI automatically provides interactive API documentation.

Swagger UI:

```text
/api/docs
```

ReDoc:

```text
/api/redoc
```

The exact paths may be configured in the FastAPI application.

---

# API Design Principles

Kairo APIs should follow these principles:

1. REST-style resource naming
2. API versioning
3. Consistent JSON responses
4. Input validation
5. Authentication
6. Authorization
7. Clear error handling
8. Rate limiting
9. Request logging
10. Secure secret management

---

# Example Complete Flow

```text
POST /api/v1/agents/tasks
        ↓
Authenticate User
        ↓
Validate Request
        ↓
Create Agent Task
        ↓
Store Task in Supabase
        ↓
Start Agent
        ↓
Nebius AI
        ↓
Research / Coding / Testing
        ↓
Update Task Status
        ↓
GET /api/v1/agents/tasks/{id}
        ↓
Return Result
```