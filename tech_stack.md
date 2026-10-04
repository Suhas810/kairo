# Kairo — Tech Stack

> Final technology stack for the Kairo AI Software Engineering Agent.

---

## 1. Overview

Kairo is an AI-powered software engineering agent that can work with real GitHub repositories, research technical problems, plan changes, generate and modify code, execute code in an isolated environment, run tests, diagnose failures, and iterate toward a validated solution.

The system is designed for the Nebius Global AI Hackathon and uses Nebius infrastructure and NVIDIA open-source AI models as core components.

---

# 2. Core Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Web application UI |
| Frontend Language | TypeScript | Type-safe frontend development |
| Build Tool | Vite | Frontend development and production builds |
| Styling | Tailwind CSS | UI styling and responsive design |
| Backend | Python | Backend and agent development |
| API Framework | FastAPI | REST API and backend services |
| AI Infrastructure | Nebius | AI/cloud infrastructure |
| AI Inference | Nebius Token Factory | LLM inference |
| AI Model | NVIDIA Nemotron | Agent reasoning and code-related tasks |
| Database | Supabase | Database, authentication and optional storage |
| Web Search | Tavily | Web and technical research |
| Repository | GitHub | Source-code and repository integration |
| Code Execution | Docker | Isolated code execution and testing |
| Observability | LangSmith | LLM tracing, debugging and evaluation |
| Frontend Hosting | Vercel | Production frontend deployment |
| Backend Hosting | Nebius AI Cloud | Production FastAPI backend |
| Version Control | Git | Source-code version control |

---

# 3. Frontend

## React

React is used to build Kairo's web interface.

Responsibilities:

- Dashboard
- Project management
- Repository management
- Agent interaction
- Task monitoring
- Execution status
- Terminal/output display
- Test results
- Agent activity timeline

## TypeScript

TypeScript provides type safety across the frontend.

Used for:

- API types
- Component props
- Application state
- Agent events
- Repository information
- Execution results

## Vite

Vite is used as the frontend build tool.

Benefits:

- Fast development server
- Fast builds
- Simple configuration
- Good React + TypeScript integration

## Tailwind CSS

Tailwind CSS is used for:

- Layout
- Responsive design
- Components
- Dashboard styling
- Agent interface
- Status indicators

---

# 4. Backend

## Python

Python is the primary backend language.

It is used for:

- Agent orchestration
- AI integration
- GitHub integration
- Tavily integration
- Docker execution
- Database operations
- API services

## FastAPI

FastAPI is the backend API framework.

The FastAPI server is responsible for:

- Receiving requests from the frontend
- Creating and managing agent tasks
- Communicating with AI models
- Managing repositories
- Starting execution environments
- Returning agent progress
- Storing results
- Exposing health and monitoring endpoints

Example architecture:

```text
React Frontend
      ↓
FastAPI
      ↓
Kairo Agent
      ↓
External Services
```

---

# 5. AI Infrastructure

## Nebius

Nebius is the primary AI/cloud infrastructure for Kairo.

Kairo's backend will be deployed on Nebius AI Cloud.

Nebius is also used for AI inference through Token Factory.

The project should have a genuine runtime dependency on Nebius rather than using it only as a development tool.

---

# 6. AI Model

## NVIDIA Nemotron

Kairo will use an NVIDIA open-source model from the Nemotron family through Nebius.

The model will be responsible for tasks such as:

- Understanding user requirements
- Repository reasoning
- Task planning
- Code generation
- Code modification
- Error analysis
- Debugging
- Test-result interpretation
- Final response generation

Basic flow:

```text
User Request
     ↓
Kairo Agent
     ↓
Nebius Token Factory
     ↓
NVIDIA Nemotron
     ↓
Reasoning / Planning
     ↓
Tool Execution
```

The exact Nemotron model/version will be selected during implementation based on availability, performance and hackathon credits.

---

# 7. Agent Architecture

Kairo follows an agentic workflow instead of being a simple chatbot.

The core workflow is:

```text
User Request
      ↓
Understand
      ↓
Plan
      ↓
Research
      ↓
Inspect Repository
      ↓
Write / Modify Code
      ↓
Execute
      ↓
Run Tests
      ↓
Analyze Results
      ↓
      ├── FAIL → Debug → Modify → Test Again
      │
      └── PASS → Review
                    ↓
                  Result
```

Core agent modules:

```text
agent/
├── orchestrator.py
├── planner.py
├── researcher.py
├── coder.py
├── tester.py
├── debugger.py
├── reviewer.py
└── state.py
```

---

# 8. Web Research

## Tavily

Tavily is used as Kairo's web research tool.

The agent can use Tavily when it needs external technical information.

Potential use cases:

- Documentation lookup
- Framework information
- Library usage
- Error investigation
- Technical research
- Finding relevant GitHub issues
- Finding current implementation references

Example:

```text
Agent
  ↓
"I don't understand this API error."
  ↓
Tavily
  ↓
Technical documentation / references
  ↓
Nemotron
  ↓
Solution
```

Tavily is a runtime component of the agent rather than simply a listed dependency.

---

# 9. GitHub

GitHub is Kairo's repository integration layer.

Kairo will interact with repositories to:

- Access repositories
- Inspect files
- Read source code
- Create working copies
- Modify files
- Run tests
- Track changes
- Optionally create branches/commits

Basic flow:

```text
GitHub Repository
       ↓
Kairo
       ↓
Clone / Workspace
       ↓
Analyze
       ↓
Modify
       ↓
Test
```

---

# 10. Code Execution

## Docker

Docker provides isolated execution environments for generated or modified code.

Kairo should never execute arbitrary generated code directly inside the main FastAPI process.

Instead:

```text
Kairo Agent
     ↓
Docker Sandbox
     ↓
Generated Code
     ↓
Build
     ↓
Execute
     ↓
Run Tests
     ↓
Capture Output
```

The sandbox can provide:

- Isolated filesystem
- Runtime environment
- Resource restrictions
- Command execution
- Test execution
- Build execution
- Logs and error output

---

# 11. Database

## Supabase

Supabase is the only database platform used by Kairo.

We do not maintain a separate PostgreSQL server.

Supabase provides the database layer for:

- Users
- Projects
- Repositories
- Agent tasks
- Agent sessions
- Execution records
- Test results
- Project configuration
- Agent activity history

Optional Supabase features:

- Authentication
- Storage

Architecture:

```text
Frontend
    ↓
FastAPI
    ↓
Supabase
```

Supabase's underlying database technology is PostgreSQL, but PostgreSQL is not separately deployed or managed by Kairo.

---

# 12. Observability

## LangSmith

LangSmith is used to observe and debug the AI agent.

It can help track:

- Agent runs
- LLM calls
- Prompts
- Responses
- Tool calls
- Execution flow
- Failures
- Latency
- Token usage
- Agent iterations

Example:

```text
User Request
     ↓
Planner
     ↓
Nemotron
     ↓
Tavily
     ↓
Coder
     ↓
Docker
     ↓
Tester
```

LangSmith helps us trace this entire process.

---

# 13. Hosting

## Frontend — Vercel

The React frontend will be deployed on Vercel.

```text
GitHub
   ↓
Vercel
   ↓
Kairo Web Application
```

Vercel is responsible for hosting the frontend application.

---

## Backend — Nebius AI Cloud

The FastAPI backend will be deployed on Nebius AI Cloud.

```text
GitHub
   ↓
Docker
   ↓
Nebius AI Cloud
   ↓
FastAPI
   ↓
Kairo Agent
```

Nebius is therefore part of the actual production runtime.

---

# 14. Deployment Architecture

```text
                         USER
                           │
                           ▼
                  ┌─────────────────┐
                  │     VERCEL      │
                  │                 │
                  │ React           │
                  │ TypeScript      │
                  │ Vite            │
                  │ Tailwind        │
                  └────────┬────────┘
                           │
                           │ HTTPS
                           ▼
                  ┌─────────────────┐
                  │     NEBIUS      │
                  │    AI CLOUD     │
                  │                 │
                  │ FastAPI         │
                  │ Kairo Agent     │
                  └────────┬────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │   NEBIUS    │  │   TAVILY    │  │   GITHUB    │
   │ Token       │  │   Search    │  │    API      │
   │ Factory     │  │             │  │             │
   └──────┬──────┘  └─────────────┘  └─────────────┘
          │
          ▼
   ┌─────────────┐
   │   NVIDIA    │
   │  Nemotron   │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Kairo Agent │
   │ Orchestrator│
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │    Docker   │
   │   Sandbox   │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │   Supabase  │
   │             │
   │   Database  │
   └─────────────┘

   ┌─────────────┐
   │  LangSmith  │
   │ Observability│
   └─────────────┘
```

---

# 15. Environment Variables

Sensitive credentials must never be committed to GitHub.

Example:

```env
# Nebius
NEBIUS_API_KEY=
NEBIUS_MODEL=

# Tavily
TAVILY_API_KEY=

# GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_TOKEN=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LangSmith
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=
LANGSMITH_TRACING=true
```

Local secrets should be stored in `.env` files.

Production secrets should be configured through the respective cloud platform's environment-variable/secret management system.

---

# 16. Development Stack

Developers will use:

```text
VS Code
Git
GitHub
Python
Node.js
Docker
```

Recommended development environment:

```text
Windows / Linux
      │
      ├── Node.js
      ├── Python
      ├── Docker
      └── Git
```

---

# 17. Version Control

## Git + GitHub

Git is used for local version control.

GitHub is used for:

- Remote repository
- Collaboration
- Issue tracking
- Pull requests
- Source-code hosting
- Hackathon submission repository

Recommended branch structure:

```text
main
│
├── develop
│
├── feature/frontend
├── feature/backend
├── feature/agent
├── feature/github
├── feature/tavily
├── feature/docker
└── feature/deployment
```

---

# 18. Production Architecture Summary

### Frontend

```text
React
+
TypeScript
+
Vite
+
Tailwind CSS
        ↓
      Vercel
```

### Backend

```text
Python
+
FastAPI
        ↓
Nebius AI Cloud
```

### AI

```text
Nebius Token Factory
        ↓
NVIDIA Nemotron
```

### Agent

```text
Planner
Researcher
Coder
Tester
Debugger
Reviewer
        ↓
Orchestrator
```

### Execution

```text
Docker Sandbox
        ↓
Build
        ↓
Run
        ↓
Test
        ↓
Logs
```

### Data

```text
Supabase
        ↓
Database
        +
Authentication (optional)
        +
Storage (optional)
```

### External Tools

```text
GitHub → Repository operations
Tavily → Web research
LangSmith → Observability
```

---

# 19. Final Stack

```text
┌─────────────────────────────────────────┐
│                  KAIRO                  │
├─────────────────────────────────────────┤
│ Frontend        React + TypeScript      │
│ Build           Vite                    │
│ Styling         Tailwind CSS            │
│ Hosting         Vercel                  │
├─────────────────────────────────────────┤
│ Backend         Python + FastAPI        │
│ Hosting         Nebius AI Cloud         │
├─────────────────────────────────────────┤
│ AI              NVIDIA Nemotron         │
│ Inference       Nebius Token Factory    │
├─────────────────────────────────────────┤
│ Database        Supabase                │
│ Search          Tavily                  │
│ Repository      GitHub                  │
│ Execution       Docker                  │
│ Observability   LangSmith               │
├─────────────────────────────────────────┤
│ Version Control Git + GitHub             │
└─────────────────────────────────────────┘
```

---

## Hackathon Alignment

Kairo is designed around the **Coding & Agentic Engineering** use case.

The architecture specifically incorporates:

- Nebius AI Cloud
- Nebius Token Factory
- NVIDIA Nemotron
- Agentic planning
- Repository interaction
- Web research
- Code generation
- Isolated code execution
- Automated testing
- Debugging and iteration

The exact Nebius deployment mechanism and exact Nemotron model will be finalized during implementation based on the available Nebius infrastructure and hackathon credits.

---

## Deployment Target

**Internal deadline: October 29, 2026**

By this date Kairo should have:

- Production frontend deployed
- Production backend deployed
- Nebius AI integration working
- NVIDIA Nemotron integration working
- Supabase connected
- GitHub integration working
- Tavily integration working
- Docker execution working
- LangSmith tracing working
- End-to-end agent workflow tested
- Final demo workflow verified

**Hackathon submission target: October 30, 2026**