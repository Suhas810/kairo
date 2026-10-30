# Kairo Backend Architecture

## Overview

Kairo is an autonomous AI-powered software engineering platform built for developer task execution. It orchestrates a complete lifecycle: understanding requirements, formulating execution plans, inspecting repository contexts, generating tested code modifications, running test verification in an isolated sandbox, and generating diffs for review.

## Architecture Diagram

```
React Frontend (Vite + Tailwind)
          │  REST / SSE (Bearer Token)
          ▼
    FastAPI Gateway (/api/v1)
    ┌────────────────────────┐
    │ Auth & RLS Guard       │ (Supabase JWT Verification)
    │ Request Validation     │ (Pydantic V2)
    │ Structured Logging     │ (Credential Redaction)
    └───────────┬────────────┘
                │
    ┌───────────┴────────────────────────┐
    │                                    │
    ▼                                    ▼
Agent Orchestrator               Isolated Execution Service
┌────────────────────────┐       ┌────────────────────────┐
│ Planner Agent          │       │ Docker Container       │
│ Coding Agent           │       │ (Read-Only Root,       │
│ Test Agent             │──────▶│  Non-root User,        │
│ Reviewer Agent         │       │  CPU & Memory Caps,    │
└───────────┬────────────┘       │  Subprocess Fallback)  │
            │                    └────────────────────────┘
            ▼
External Integrations
├── Supabase PostgreSQL (Row Level Security & Migrations)
├── NVIDIA AI / Nebius (Nemotron / Llama-3.1 via OpenAI-compatible API)
└── GitHub API (Repository Trees, Content, Webhooks)
```

## Core Modules

### 1. `app.core`
- `config.py`: Environment-backed configuration using `pydantic-settings`/dataclass. Loads local `.env` and enforces type safety.
- `security.py`: Path traversal guards (`validate_safe_relative_path`), constant-time signature verification (`verify_hmac_sha256`).
- `logging.py`: Structured logger with automatic credential redaction for bearer tokens, passwords, and API keys.
- `exceptions.py`: Consistent API error formatter emitting `{ "error": { "code": "...", "message": "...", "details": {...} } }`.

### 2. `app.integrations`
- `supabase.py`: Asynchronous wrapper for database operations on `users`, `projects`, `repositories`, `tasks`, `agent_sessions`, `executions`, and `activity_logs`.
- `nvidia_ai.py`: Client for NVIDIA Nemotron / Nebius Token Factory inference. Supports structured plan generation, code patches, review summaries, and token tracking.
- `github.py`: Client for GitHub repository tree queries, safe file content retrieval, and webhook verification.

### 3. `app.agents`
- `orchestrator.py`: State machine coordinating the autonomous loop (`queued` -> `planning` -> `coding` -> `testing` -> `reviewing` -> `completed`/`failed`). Includes bounded repair iterations when tests fail.
- `planner.py`: Decomposes tasks into ordered steps and identifies target files.
- `coding_agent.py`: Generates source code modifications.
- `test_agent.py`: Executes tests in the sandbox and calculates passed/failed metrics.
- `reviewer.py`: Generates unified diffs and evaluates pull request readiness.

### 4. `app.services.sandbox_service`
- Interfaces with the `sandbox/runner` container framework.
- Spawns disposable containers with non-root privileges, memory limits, and timeouts.
- Provides an isolated local process fallback for development environments where the Docker daemon is absent.

