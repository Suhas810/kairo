# Kairo — Backend Architecture

## 1. Technology

```text
Python
FastAPI
Nebius AI / Nemotron
Supabase
Docker
GitHub integration
Tavily
```

Deployment:

```text
Nebius AI Cloud
```

## 2. Backend Responsibilities

The backend is the trusted server-side layer.

It handles:

- API requests
- Authentication/session validation
- Agent orchestration
- Model calls
- Tool calls
- Repository operations
- Code execution
- Testing
- Run persistence
- Event generation

## 3. Backend Structure

Recommended structure:

```text
backend/
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── routes/
│   │   │   ├── projects.py
│   │   │   ├── runs.py
│   │   │   ├── tasks.py
│   │   │   └── health.py
│   │   │
│   │   └── dependencies.py
│   │
│   ├── agents/
│   │   ├── orchestrator.py
│   │   ├── planner.py
│   │   ├── researcher.py
│   │   ├── coder.py
│   │   ├── executor.py
│   │   ├── tester.py
│   │   ├── debugger.py
│   │   └── reviewer.py
│   │
│   ├── tools/
│   │   ├── github.py
│   │   ├── tavily.py
│   │   └── docker.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── db/
│   ├── config/
│   └── utils/
│
├── tests/
├── requirements.txt
└── Dockerfile
```

## 4. API Layer

Example endpoints:

```text
GET    /api/health

GET    /api/projects
POST   /api/projects

GET    /api/projects/{project_id}

POST   /api/runs
GET    /api/runs/{run_id}
GET    /api/runs/{run_id}/events
POST   /api/runs/{run_id}/cancel
```

## 5. Agent Service

The Agent Orchestrator controls the lifecycle:

```text
create_run()
    ↓
plan()
    ↓
research()
    ↓
implement()
    ↓
execute()
    ↓
test()
    ↓
if failed:
    debug()
    ↓
    execute()
    ↓
    test()
    ↓
review()
```

## 6. Model Service

Keep model calls behind a service abstraction.

Example conceptual interface:

```python
class ModelService:
    async def generate(self, messages, tools=None):
        ...
```

This prevents agent code from being tightly coupled to a specific model API.

The implementation connects to the Nebius AI stack and configured Nemotron model.

## 7. Supabase Layer

Supabase is the only application database layer.

Conceptual tables:

```text
users
projects
tasks
agent_runs
agent_events
artifacts
test_results
```

Possible relationship:

```text
User
 └── Projects
      └── Tasks
           └── Agent Runs
                ├── Agent Events
                ├── Artifacts
                └── Test Results
```

## 8. Tool Services

### GitHub

Used for:

- Repository access
- Reading files
- Creating/modifying files
- Branch operations
- Commit/pull-request workflows where implemented

### Tavily

Used for:

- Documentation research
- Technical lookup
- Current web information needed for implementation

### Docker

Used for:

- Building an isolated workspace
- Installing project dependencies
- Running commands
- Running tests
- Capturing output

## 9. Execution Safety

The backend must not execute generated code directly in the FastAPI process.

Use an isolated execution environment.

At minimum, apply:

- Execution timeouts
- Resource limits
- Restricted filesystem scope
- Controlled environment variables
- No unnecessary host access
- Cleanup after execution

## 10. Configuration

Environment variables should hold secrets:

```text
NEBIUS_API_KEY
NEBIUS_MODEL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GITHUB_TOKEN
TAVILY_API_KEY
```

Never commit these values to GitHub.

## 11. Observability

Backend logs should capture:

- Request ID
- Run ID
- Agent stage
- Tool call
- Execution duration
- Error type
- Final run status

Do not log secrets or sensitive user data.

## 12. Health Check

The backend exposes:

```http
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

This is used by deployment and monitoring systems.
