# Kairo — Complete Application File Structure

> Master file and directory structure for the complete Kairo application.

---

# 1. Project Root

```text
kairo/
│
├── README.md
├── LICENSE
├── .gitignore
├── .dockerignore
├── .env.example
├── docker-compose.yml
├── Makefile
│
├── frontend/
├── backend/
├── sandbox/
├── database/
├── infrastructure/
├── scripts/
├── docs/
│
└── .github/
```

---

# 2. Complete Structure

```text
kairo/
│
├── README.md
├── LICENSE
├── .gitignore
├── .dockerignore
├── .env.example
├── docker-compose.yml
├── Makefile
│
│
├── frontend/                              # Vercel
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── images/
│   │
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   │
│   │   ├── components/
│   │   │   │
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── PageLayout.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── RecentTasks.tsx
│   │   │   │   └── ActivityFeed.tsx
│   │   │   │
│   │   │   ├── project/
│   │   │   │   ├── ProjectHeader.tsx
│   │   │   │   ├── ProjectOverview.tsx
│   │   │   │   ├── RepositoryCard.tsx
│   │   │   │   └── ProjectSettings.tsx
│   │   │   │
│   │   │   ├── agent/
│   │   │   │   ├── AgentChat.tsx
│   │   │   │   ├── AgentMessage.tsx
│   │   │   │   ├── AgentStatus.tsx
│   │   │   │   ├── AgentTimeline.tsx
│   │   │   │   ├── AgentStep.tsx
│   │   │   │   └── ToolCall.tsx
│   │   │   │
│   │   │   ├── repository/
│   │   │   │   ├── RepositoryBrowser.tsx
│   │   │   │   ├── FileTree.tsx
│   │   │   │   ├── FileViewer.tsx
│   │   │   │   ├── CodeViewer.tsx
│   │   │   │   └── GitChanges.tsx
│   │   │   │
│   │   │   ├── execution/
│   │   │   │   ├── ExecutionPanel.tsx
│   │   │   │   ├── ExecutionStatus.tsx
│   │   │   │   ├── TestResults.tsx
│   │   │   │   ├── BuildOutput.tsx
│   │   │   │   └── ExecutionLogs.tsx
│   │   │   │
│   │   │   └── terminal/
│   │   │       ├── Terminal.tsx
│   │   │       ├── TerminalLine.tsx
│   │   │       └── TerminalHeader.tsx
│   │   │
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Project.tsx
│   │   │   ├── Repository.tsx
│   │   │   ├── Agent.tsx
│   │   │   ├── Execution.tsx
│   │   │   └── Settings.tsx
│   │   │
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useAgent.ts
│   │   │   ├── useProject.ts
│   │   │   ├── useRepository.ts
│   │   │   ├── useExecution.ts
│   │   │   └── useWebSocket.ts
│   │   │
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── agent.ts
│   │   │   ├── projects.ts
│   │   │   ├── repositories.ts
│   │   │   └── executions.ts
│   │   │
│   │   │
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── projectStore.ts
│   │   │   ├── agentStore.ts
│   │   │   └── executionStore.ts
│   │   │
│   │   │
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── project.ts
│   │   │   ├── repository.ts
│   │   │   ├── agent.ts
│   │   │   └── execution.ts
│   │   │
│   │   │
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── constants.ts
│   │   │
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── index.html
│
│
│
├── backend/                               # Nebius AI Cloud
│   │
│   ├── app/
│   │   │
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── dependencies.py
│   │   │   │
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── projects.py
│   │   │       ├── repositories.py
│   │   │       ├── agent.py
│   │   │       ├── executions.py
│   │   │       ├── webhooks.py
│   │   │       └── health.py
│   │   │
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── logging.py
│   │   │   ├── exceptions.py
│   │   │   └── constants.py
│   │   │
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── repository.py
│   │   │   ├── task.py
│   │   │   ├── agent_session.py
│   │   │   └── execution.py
│   │   │
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── repository.py
│   │   │   ├── agent.py
│   │   │   ├── task.py
│   │   │   └── execution.py
│   │   │
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── nebius_service.py
│   │   │   ├── github_service.py
│   │   │   ├── tavily_service.py
│   │   │   ├── supabase_service.py
│   │   │   ├── docker_service.py
│   │   │   └── langsmith_service.py
│   │   │
│   │   │
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   │
│   │   │   ├── orchestrator.py
│   │   │   ├── planner.py
│   │   │   ├── researcher.py
│   │   │   ├── repository_analyzer.py
│   │   │   ├── coder.py
│   │   │   ├── tester.py
│   │   │   ├── debugger.py
│   │   │   ├── reviewer.py
│   │   │   ├── state.py
│   │   │   └── memory.py
│   │   │
│   │   │
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── github_tools.py
│   │   │   ├── search_tools.py
│   │   │   ├── file_tools.py
│   │   │   ├── shell_tools.py
│   │   │   ├── test_tools.py
│   │   │   └── git_tools.py
│   │   │
│   │   │
│   │   ├── prompts/
│   │   │   ├── system/
│   │   │   │   ├── agent.txt
│   │   │   │   ├── planner.txt
│   │   │   │   ├── coder.txt
│   │   │   │   ├── debugger.txt
│   │   │   │   └── reviewer.txt
│   │   │   │
│   │   │   └── templates/
│   │   │       ├── task.txt
│   │   │       ├── research.txt
│   │   │       └── error_analysis.txt
│   │   │
│   │   │
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── connection.py
│   │   │   ├── repositories.py
│   │   │   └── queries.py
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── file_utils.py
│   │       ├── git_utils.py
│   │       └── validation.py
│   │
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   │
│   │   ├── unit/
│   │   │   ├── test_agent.py
│   │   │   ├── test_planner.py
│   │   │   ├── test_coder.py
│   │   │   ├── test_debugger.py
│   │   │   └── test_services.py
│   │   │
│   │   ├── integration/
│   │   │   ├── test_github.py
│   │   │   ├── test_tavily.py
│   │   │   ├── test_nebius.py
│   │   │   ├── test_supabase.py
│   │   │   └── test_docker.py
│   │   │
│   │   └── agent/
│   │       ├── test_agent_loop.py
│   │       ├── test_code_generation.py
│   │       └── test_debug_loop.py
│   │
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── .dockerignore
│
│
│
├── sandbox/                               # Docker execution environment
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   │
│   ├── runner/
│   │   ├── execute.py
│   │   ├── test_runner.py
│   │   ├── process.py
│   │   ├── environment.py
│   │   └── output.py
│   │
│   ├── templates/
│   │   ├── python/
│   │   │   ├── Dockerfile
│   │   │   └── requirements.txt
│   │   │
│   │   ├── javascript/
│   │   │   ├── Dockerfile
│   │   │   └── package.json
│   │   │
│   │   └── typescript/
│   │       ├── Dockerfile
│   │       └── package.json
│   │
│   └── policies/
│       ├── resource_limits.json
│       └── security.json
│
│
│
├── database/                              # Supabase
│   │
│   ├── migrations/
│   │   ├── 001_users.sql
│   │   ├── 002_projects.sql
│   │   ├── 003_repositories.sql
│   │   ├── 004_tasks.sql
│   │   ├── 005_agent_sessions.sql
│   │   ├── 006_executions.sql
│   │   └── 007_activity_logs.sql
│   │
│   ├── functions/
│   │   └── ...
│   │
│   ├── seed.sql
│   └── schema.sql
│
│
│
├── infrastructure/
│   │
│   ├── nebius/
│   │   ├── README.md
│   │   ├── deployment.yaml
│   │   ├── environment.yaml
│   │   └── secrets.example.yaml
│   │
│   ├── vercel/
│   │   ├── vercel.json
│   │   └── README.md
│   │
│   └── docker/
│       ├── Dockerfile.backend
│       ├── Dockerfile.sandbox
│       └── docker-compose.prod.yml
│
│
│
├── scripts/
│   ├── setup.sh
│   ├── setup.ps1
│   ├── dev.sh
│   ├── dev.ps1
│   ├── test.sh
│   ├── build.sh
│   ├── deploy.sh
│   └── cleanup.sh
│
│
│
├── docs/
│   │
│   ├── architecture/
│   │   ├── system-design.md
│   │   ├── application-flow.md
│   │   ├── agent-architecture.md
│   │   ├── frontend-architecture.md
│   │   ├── backend-architecture.md
│   │   └── deployment-architecture.md
│   │
│   ├── agent/
│   │   ├── agent-workflow.md
│   │   ├── planning.md
│   │   ├── research.md
│   │   ├── coding.md
│   │   ├── testing.md
│   │   └── debugging.md
│   │
│   ├── api/
│   │   ├── api-reference.md
│   │   └── authentication.md
│   │
│   ├── database/
│   │   └── database-schema.md
│   │
│   ├── deployment/
│   │   ├── local-development.md
│   │   ├── nebius.md
│   │   ├── vercel.md
│   │   └── production.md
│   │
│   ├── security/
│   │   ├── sandbox-security.md
│   │   ├── secrets.md
│   │   └── authentication.md
│   │
│   └── hackathon/
│       ├── requirements.md
│       ├── judging.md
│       ├── demo-plan.md
│       └── submission.md
│
│
│
└── .github/
    │
    ├── workflows/
    │   ├── frontend.yml
    │   ├── backend.yml
    │   ├── tests.yml
    │   └── security.yml
    │
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    │
    └── pull_request_template.md
```

---

# 3. Frontend Structure

The frontend is the user-facing Kairo application.

```text
frontend/
└── src/
    ├── components/
    ├── pages/
    ├── hooks/
    ├── services/
    ├── stores/
    ├── types/
    └── utils/
```

### Main user flow

```text
Landing
   ↓
Login
   ↓
Dashboard
   ↓
Create Project
   ↓
Connect GitHub Repository
   ↓
Create Agent Task
   ↓
Agent Workspace
   ↓
Execution
   ↓
Results
```

---

# 4. Backend Structure

The backend contains Kairo's main application logic.

```text
backend/app/
│
├── api/
├── core/
├── models/
├── schemas/
├── services/
├── agent/
├── tools/
├── prompts/
├── database/
└── utils/
```

### Backend responsibility

```text
Frontend Request
      ↓
FastAPI Route
      ↓
Service Layer
      ↓
Agent Orchestrator
      ↓
Tools / AI / Execution
      ↓
Result
      ↓
Supabase
      ↓
Frontend
```

---

# 5. Agent Structure

The agent is the core intelligence layer.

```text
backend/app/agent/

orchestrator.py
      │
      ├── planner.py
      ├── researcher.py
      ├── repository_analyzer.py
      ├── coder.py
      ├── tester.py
      ├── debugger.py
      └── reviewer.py
```

## Agent loop

```text
                    USER TASK
                       │
                       ▼
                    PLANNER
                       │
                       ▼
                  RESEARCHER
                       │
                       ▼
             REPOSITORY ANALYZER
                       │
                       ▼
                     CODER
                       │
                       ▼
                 DOCKER RUN
                       │
                       ▼
                    TESTER
                       │
                 ┌─────┴─────┐
                 │           │
                FAIL        PASS
                 │           │
                 ▼           ▼
              DEBUGGER    REVIEWER
                 │           │
                 └──► CODER  │
                             ▼
                           RESULT
```

---

# 6. Tool Structure

The agent does not directly perform every operation.

It uses tools.

```text
tools/
│
├── github_tools.py
├── search_tools.py
├── file_tools.py
├── shell_tools.py
├── test_tools.py
└── git_tools.py
```

Example:

```text
Nemotron
   ↓
Agent decides:
"Search documentation"
   ↓
search_tools.py
   ↓
Tavily
```

Another example:

```text
Nemotron
   ↓
Agent decides:
"Run tests"
   ↓
test_tools.py
   ↓
Docker Sandbox
```

---

# 7. Service Structure

External integrations stay inside the service layer.

```text
services/
│
├── nebius_service.py
├── github_service.py
├── tavily_service.py
├── supabase_service.py
├── docker_service.py
└── langsmith_service.py
```

This prevents third-party APIs from being scattered throughout the application.

---

# 8. Database Structure

Supabase is Kairo's database platform.

```text
database/
│
├── migrations/
├── functions/
├── seed.sql
└── schema.sql
```

Expected logical entities:

```text
Users
  │
  └── Projects
        │
        ├── Repositories
        │
        ├── Tasks
        │
        └── Agent Sessions
                │
                └── Executions
                        │
                        └── Activity Logs
```

---

# 9. Docker Sandbox

The sandbox is separated from the main backend.

```text
sandbox/
│
├── runner/
├── templates/
└── policies/
```

Its job is to safely execute:

- Generated code
- Modified code
- Build commands
- Tests
- Linters
- Package commands

The sandbox returns:

```text
Exit Code
stdout
stderr
Test Results
Execution Time
Status
```

---

# 10. Deployment Structure

## Frontend

```text
frontend/
     ↓
GitHub
     ↓
Vercel
```

## Backend

```text
backend/
     ↓
Docker
     ↓
Nebius AI Cloud
```

## AI

```text
FastAPI
     ↓
Nebius Token Factory
     ↓
NVIDIA Nemotron
```

## Database

```text
FastAPI
     ↓
Supabase
```

---

# 11. CI/CD

GitHub Actions will eventually handle automated checks.

```text
.github/workflows/

frontend.yml
backend.yml
tests.yml
security.yml
```

Typical flow:

```text
Developer
    ↓
git push
    ↓
GitHub
    ↓
GitHub Actions
    ↓
Tests
    ↓
Build
    ↓
Deployment
```

---

# 12. Environment Configuration

Only `.env.example` is committed.

```text
.env.example
```

Actual environment files remain private.

Important variables include:

```text
NEBIUS_API_KEY
NEBIUS_MODEL

TAVILY_API_KEY

GITHUB_TOKEN

SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

LANGSMITH_API_KEY
LANGSMITH_PROJECT
LANGSMITH_TRACING
```

---

# 13. Documentation Structure

The `docs/` directory documents the system.

```text
docs/
│
├── architecture/
├── agent/
├── api/
├── database/
├── deployment/
├── security/
└── hackathon/
```

This is especially important for the hackathon because someone should be able to understand:

```text
What is Kairo?
        ↓
How does it work?
        ↓
How is the agent designed?
        ↓
How is Nebius used?
        ↓
How is Nemotron used?
        ↓
How is code executed?
        ↓
How can someone run Kairo?
```

---

# 14. Development vs Production

## Local Development

```text
Windows/Linux
    │
    ├── Vite
    ├── FastAPI
    ├── Docker
    └── Supabase
```

## Production

```text
                  PRODUCTION
                      │
          ┌───────────┴───────────┐
          │                       │
       Vercel                  Nebius
          │                       │
      Frontend                FastAPI
                                  │
                         ┌────────┼────────┐
                         │        │        │
                      Nemotron  Tavily   GitHub
                         │
                      Docker
                         │
                      Supabase
```

---

# 15. Application Request Flow

A complete Kairo request should look like this:

```text
1. User opens Kairo
        ↓
2. Vercel serves frontend
        ↓
3. User connects GitHub repository
        ↓
4. User submits task
        ↓
5. Frontend sends request to FastAPI
        ↓
6. FastAPI creates agent session
        ↓
7. Agent analyzes task
        ↓
8. Nemotron generates plan
        ↓
9. Agent inspects repository
        ↓
10. Agent decides whether research is required
        ↓
11. Tavily performs research if necessary
        ↓
12. Agent generates code changes
        ↓
13. Docker sandbox executes changes
        ↓
14. Tests run
        ↓
15. Agent analyzes test output
        ↓
16. If failed → debugger
        ↓
17. Agent modifies code
        ↓
18. Tests run again
        ↓
19. Tests pass
        ↓
20. Reviewer validates result
        ↓
21. Results stored in Supabase
        ↓
22. Frontend displays result
```

---

# 16. Complete Technology Relationship

```text
                    ┌──────────────┐
                    │    USER      │
                    └──────┬───────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │     VERCEL      │
                  │ React / Vite    │
                  │ TypeScript      │
                  │ Tailwind        │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │     NEBIUS      │
                  │    AI CLOUD     │
                  │                 │
                  │    FastAPI      │
                  └────────┬────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
        ┌─────────┐   ┌─────────┐   ┌─────────┐
        │ Nebius  │   │ Tavily  │   │ GitHub  │
        │ Token   │   │ Search  │   │   API   │
        │ Factory │   │         │   │         │
        └────┬────┘   └─────────┘   └─────────┘
             │
             ▼
        ┌───────────┐
        │ NVIDIA    │
        │ Nemotron  │
        └─────┬─────┘
              │
              ▼
       ┌──────────────┐
       │ Kairo Agent  │
       │ Orchestrator │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ Docker       │
       │ Sandbox      │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │   Supabase   │
       │              │
       │   Database   │
       └──────────────┘

       ┌──────────────┐
       │  LangSmith   │
       │ Observability│
       └──────────────┘
```

---

# 17. Build Priority

The complete structure above is the **target architecture**.

We will NOT implement everything at once.

Recommended implementation order:

```text
PHASE 1
│
├── frontend/
├── backend/
├── Docker
└── GitHub
        ↓
PHASE 2
│
├── FastAPI
├── Nebius
└── Nemotron
        ↓
PHASE 3
│
├── Agent
├── Planner
├── Coder
└── Basic tool calling
        ↓
PHASE 4
│
├── GitHub integration
├── Repository analysis
└── File modification
        ↓
PHASE 5
│
├── Tavily
└── Research workflow
        ↓
PHASE 6
│
├── Docker sandbox
├── Testing
└── Debug loop
        ↓
PHASE 7
│
├── Supabase
├── Authentication
└── Persistent sessions
        ↓
PHASE 8
│
├── Complete frontend
├── Agent timeline
├── Terminal
└── Execution UI
        ↓
PHASE 9
│
├── LangSmith
├── Error handling
└── Observability
        ↓
PHASE 10
│
├── Vercel deployment
├── Nebius deployment
└── Production testing
        ↓
PHASE 11
│
├── End-to-end testing
├── Demo preparation
└── Hackathon submission
```

---

# 18. Final Deployment

```text
FRONTEND
React + TypeScript + Vite + Tailwind
                ↓
              Vercel


BACKEND
Python + FastAPI
                ↓
          Docker Image
                ↓
        Nebius AI Cloud


AI
FastAPI
   ↓
Nebius Token Factory
   ↓
NVIDIA Nemotron


DATABASE
FastAPI
   ↓
Supabase


EXECUTION
Agent
   ↓
Docker Sandbox


SEARCH
Agent
   ↓
Tavily


REPOSITORY
Agent
   ↓
GitHub


OBSERVABILITY
Agent
   ↓
LangSmith
```

---

# 19. Kairo Final Architecture

The final application consists of:

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- Vercel

**Backend**
- Python
- FastAPI
- Nebius AI Cloud

**AI**
- Nebius Token Factory
- NVIDIA Nemotron

**Agent**
- Planner
- Researcher
- Repository Analyzer
- Coder
- Tester
- Debugger
- Reviewer
- Orchestrator

**Tools**
- GitHub
- Tavily
- File operations
- Git
- Shell
- Testing

**Execution**
- Docker sandbox

**Database**
- Supabase

**Observability**
- LangSmith

**Infrastructure**
- Docker
- Nebius AI Cloud
- Vercel
- GitHub Actions

---

## Important Rule

This document describes the **complete target structure**.

Not every file should be created immediately.

We will create the application **phase-by-phase**, keeping this structure as the master reference so the architecture remains clean as Kairo grows.