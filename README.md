# Kairo

**An AI software-engineering agent designed to take development tasks from planning to tested changes.**

Kairo is a hackathon project exploring an agentic software-development workflow: understand a task, plan the work, inspect a repository, research when necessary, generate changes, run tests in an isolated environment, and use failures to guide debugging.

> **Project status:** Active prototype. The web interface and parts of the backend, database schema, and sandbox runner are present. Several user-facing screens still use local demo data, and the AI, GitHub OAuth, and end-to-end execution integrations are not yet connected as a complete workflow.

## What Kairo aims to do

Kairo is being built around one end-to-end loop:

```text
Task
 ↓
Plan
 ↓
Research when needed
 ↓
Inspect repository
 ↓
Generate or modify code
 ↓
Run in an isolated environment
 ↓
Test
 ↓
Debug and retry within limits
 ↓
Review and report the result
```

The goal is to help developers move beyond one-off code generation toward a workflow that can verify its changes and explain the outcome.

## Current capabilities and limitations

The repository currently includes:

- **Frontend prototype:** React pages and reusable components for the landing page, login/signup, dashboard, projects, repository views, agent workspace, execution output, and settings.
- **Theme and routing:** Client-side routes, protected workspace routes, and dark/light/system appearance preferences.
- **Backend foundation:** A FastAPI application, versioned API routes, request validation/error handling, Supabase access-token validation, and user-owned project CRUD.
- **Database foundation:** Supabase SQL schema, ordered migrations, and development seed data.
- **Execution sandbox foundation:** Docker-oriented runner code and templates for Python, JavaScript, and TypeScript.
- **Tests and checks:** Frontend tests/lint/build scripts and backend/sandbox pytest suites.

**Important limitations in the current prototype:**

- Many frontend project and repository screens use local fixtures; created demo data may not persist after a reload.
- Development sign-in is a client-side mock. It is not production authentication.
- The agent UI does not yet use a live language model to perform repository changes.
- Repository OAuth and live GitHub access are not configured.
- Backend agent-task, repository, and execution endpoints return a controlled “not configured” response until their integrations are implemented.
- The sandbox runner is not yet wired into a complete backend-to-frontend agent workflow.
- Nebius/NVIDIA Nemotron inference, Tavily research, LangSmith tracing, and production deployment are intended parts of the architecture, but should not be considered active end-to-end features in this version.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Routing and state | React Router, Zustand |
| Icons | Lucide React |
| Backend | Python, FastAPI, Pydantic |
| Persistence and auth foundation | Supabase, PostgreSQL, SQL migrations |
| Code execution | Docker-based runner and language templates |
| Testing | Vitest, pytest |
| Planned AI/research integrations | Nebius Token Factory, NVIDIA Nemotron, Tavily |
| Planned observability/hosting | LangSmith, Vercel, Nebius AI Cloud |

See [tech_stack.md](tech_stack.md) for the intended architecture and [phases.md](phases.md) for the development plan.

## Repository layout

```text
kairo/
├── frontend/        # React + TypeScript web application
├── backend/         # FastAPI application and API routes
├── database/        # Supabase schema, migrations, and seed data
├── sandbox/         # Docker-oriented code execution and test runner
├── docs/            # Architecture, API, security, deployment, and demo docs
├── scripts/         # Development/automation scripts (being developed)
├── tech_stack.md    # Technology decisions and intended integrations
├── phases.md        # Development phases and milestones
└── file_sturcture.md # Detailed planned/current file structure
```

## Getting started

### Prerequisites

- Node.js compatible with Vite 8
- npm
- Python 3.11 or later
- Git
- Docker, if you are working on the sandbox runner
- A Supabase project for authenticated backend and database features

### 1. Clone the repository

```bash
git clone https://github.com/Suhas810/kairo.git
cd kairo
```

### 2. Start the frontend

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

The current UI demo can be explored without configuring the backend. Note that development sign-in and several screens use demo/local data, not a production user service.

### 3. Start the backend

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

Install backend and test dependencies, then launch FastAPI:

```bash
python -m pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

- API health check: `http://127.0.0.1:8000/api/v1/health`
- Interactive API docs: `http://127.0.0.1:8000/api/docs`
- OpenAPI schema: `http://127.0.0.1:8000/api/openapi.json`

Run backend tests from the `backend/` directory:

```bash
python -m pytest
```

### 4. Configure Supabase (for backend features)

The backend reads its service configuration from environment variables. Set these in your local shell or a local, untracked environment file before using authenticated/database endpoints:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SIDE_SERVICE_ROLE_KEY
GITHUB_WEBHOOK_SECRET=
```

The health endpoint does not require Supabase. Authentication and database-backed routes do. Never commit real credentials, and **never expose the Supabase service-role key in frontend code or any `VITE_*` variable**.

To initialize a development database, follow [database/README.md](database/README.md). Apply the numbered SQL migrations in order, **or** apply `database/schema.sql` once to a new project; do not apply the consolidated schema after running the migrations as if it were another migration. Use `database/seed.sql` only for development.

## Documentation

- [System design](docs/architecture/system-design.md)
- [Frontend architecture](docs/architecture/frontend-architecture.md)
- [Backend architecture](docs/architecture/backend-architecture.md)
- [API reference](docs/api/api-reference.md)
- [Authentication notes](docs/api/authentication.md)
- [Database schema and migrations](docs/database/database-schema.md)
- [Local development guide](docs/deployment/local-development.md)
- [Sandbox security](docs/security/sandbox-security.md)
- [Hackathon demo plan](docs/hackathon/demo-plan.md)
- [Development phases](phases.md)
- [Detailed file structure](file_sturcture.md)

## Security notes

- Keep API keys, access tokens, service-role credentials, and other secrets out of source control.
- Validate authenticated users and resource ownership on the server.
- Treat generated code and command output as untrusted.
- Run generated code only in an isolated sandbox with appropriate time, resource, filesystem, and network restrictions.
- Keep a strict upper bound on retries and agent iterations so the workflow cannot run indefinitely.

## Contributing

Contributions are welcome. Before opening a pull request:

1. Create a feature branch.
2. Keep changes focused and update relevant documentation.
3. Run the frontend checks and the applicable backend/sandbox tests.
4. Never include secrets, local environment files, build outputs, or dependency directories.
5. Describe what changed, how it was tested, and any integration work that remains.

## License

See [LICENSE](LICENSE).
