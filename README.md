# Kairo

**An AI software-engineering agent designed to take development tasks from planning to tested changes.**

Kairo is a full developer automation platform built for the NVIDIA Hackathon: understand a task, plan the work, inspect a repository, generate changes, run tests in an isolated environment, and use test failures to guide bounded debugging and repair.

## What Kairo aims to do

Kairo is built around one end-to-end loop:

```text
Task
 ↓
Plan (Planner Agent)
 ↓
Research when needed
 ↓
Inspect repository
 ↓
Generate or modify code (Coding Agent)
 ↓
Run in an isolated environment (Sandbox Runner / Docker)
 ↓
Test (Test Agent)
 ↓
Debug and retry within limits (Bounded repair loop)
 ↓
Review and report the result (Reviewer Agent)
```

The goal is to help developers move beyond one-off code generation toward an automated workflow that verifies its changes and explains the outcome.

## Current capabilities

The repository includes a complete, production-minded implementation:

- **Frontend application:** React pages and reusable components for the landing page, login/signup, dashboard, projects, repository views, agent workspace, execution output, and settings.
- **Theme and routing:** Client-side routes, protected workspace routes, and dark/light/system appearance preferences.
- **Backend architecture:** A full FastAPI application with versioned API routes (`/api/v1`), CORS allowlisting, structured logging with secret redaction, request validation, Supabase access-token verification, and user-owned CRUD for projects, repositories, tasks, sessions, and executions.
- **AI Agent Orchestrator:** Complete multi-stage workflow coordinating the Planner Agent, Coding Agent, Test Agent, and Reviewer Agent with bounded repair iterations, NVIDIA Nemotron / Nebius Token Factory inference, and unified git diff generation.
- **Isolated Sandbox Service:** Docker container execution with non-root security profile, read-only root mounts, memory/cpu bounds, and isolated local process fallback for environments without a running Docker daemon.
- **Real-Time Streaming:** Server-Sent Events (SSE) live execution log and status updates at `/api/v1/executions/{id}/stream`.
- **Database foundation:** Supabase PostgreSQL schema with 8 ordered SQL migrations, Row Level Security policies enforcing ownership, and development seed data.
- **Tests and checks:** 100% passing test suites across Vitest frontend tests (8 tests), oxlint (0 errors on 107 files), Vite production builds, pytest backend tests (47 tests), and pytest sandbox runner tests (36 tests).

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Routing and state | React Router, Zustand |
| Icons | Lucide React |
| Backend | Python 3.12+, FastAPI, Pydantic |
| Persistence and auth foundation | Supabase, PostgreSQL, SQL migrations |
| Code execution | Docker-based runner and isolated process fallback |
| Testing | Vitest, pytest, oxlint |
| AI / Model inference | NVIDIA Nemotron / Nebius Token Factory |
| Repository integration | GitHub REST API, Webhooks with HMAC verification |

See [tech_stack.md](tech_stack.md) for the intended architecture and [phases.md](phases.md) for the development plan.

## Repository layout

```text
kairo/
├── frontend/        # React + TypeScript web application
├── backend/         # FastAPI application, agent orchestrator, API routes
├── database/        # Supabase schema, migrations, and seed data
├── sandbox/         # Docker-oriented code execution and test runner
├── docs/            # Architecture, API, security, deployment, and troubleshooting docs
├── scripts/         # Development/automation scripts
├── tech_stack.md    # Technology decisions and intended integrations
├── phases.md        # Development phases and milestones
└── file_sturcture.md # Detailed planned/current file structure
```

## Getting started

### Prerequisites

- Node.js (v20+)
- npm
- Python 3.11 or later
- Git
- Docker (optional for isolated sandbox containers; local process fallback supported)
- A Supabase project for authenticated backend and database features
- An NVIDIA API Key for live AI model inference

### 1. Clone the repository

```bash
git clone https://github.com/Suhas810/kairo.git
cd kairo
```

### 2. Configure Environment Variables

```bash
# In backend/
cp .env.example .env

# In root / frontend
cp .env.example .env
```

Configure your credentials in `backend/.env`:
```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-side-service-role-key
NVIDIA_API_KEY=your-nvidia-api-key
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

Frontend quality checks:

```bash
npm test
npm run lint
npm run build
```

### 4. Start the backend

Open a second terminal from the repository root:

```bash
cd backend
python -m venv .venv
```

Activate the environment.

**macOS/Linux**

```bash
source .venv/bin/activate
```

**Windows PowerShell**

```powershell
.venv\Scripts\Activate.ps1
```

Install backend dependencies and run FastAPI:

```bash
python -m pip install -r requirements-dev.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API runs at `http://127.0.0.1:8000`:

- API health check: `http://127.0.0.1:8000/api/v1/health`
- Dependency readiness: `http://127.0.0.1:8000/api/v1/ready`
- Interactive API docs: `http://127.0.0.1:8000/api/docs`
- OpenAPI schema: `http://127.0.0.1:8000/api/openapi.json`

Run backend tests:

```bash
python -m pytest
```

### 5. Initialize Database Migrations

Apply the numbered SQL migrations in `database/migrations/` sequentially:
- `001_users.sql`
- `002_projects.sql`
- `003_repositories.sql`
- `004_tasks.sql`
- `005_agent_sessions.sql`
- `006_executions.sql`
- `007_activity_logs.sql`
- `008_user_preferences_and_execution_policies.sql`

Or apply `database/schema.sql` once to a new project.

## Documentation

- [Backend architecture](docs/backend-architecture.md)
- [API reference](docs/api-reference.md)
- [Authentication and authorization](docs/authentication.md)
- [Local development guide](docs/local-development.md)
- [Deployment guide](docs/deployment.md)
- [Security architecture and threat model](docs/security.md)
- [Troubleshooting](docs/troubleshooting.md)
- [System design](docs/architecture/system-design.md)
- [Database schema guide](docs/database/database-schema.md)
- [Hackathon demo plan](docs/hackathon/demo-plan.md)

## Security notes

- Keep API keys, access tokens, service-role credentials, and other secrets out of source control.
- Validate authenticated users and resource ownership on the server.
- Treat generated code and command output as untrusted.
- Run generated code only in an isolated sandbox with appropriate time, resource, filesystem, and network restrictions.
- Keep a strict upper bound on retries and agent iterations so the workflow cannot run indefinitely.

## License

See [LICENSE](LICENSE).
