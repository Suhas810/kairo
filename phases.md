# Kairo — Development Phases

> Master implementation roadmap for building, testing, deploying, and submitting Kairo.

---

# 1. Project Goal

Kairo is an AI-powered software engineering agent that can:

```text
Understand a developer task
        ↓
Analyze a GitHub repository
        ↓
Plan the required changes
        ↓
Research when necessary
        ↓
Generate / modify code
        ↓
Execute code safely
        ↓
Run tests
        ↓
Analyze failures
        ↓
Fix the implementation
        ↓
Retest
        ↓
Return a validated result
```

The development process is divided into phases so that we always have a working system while gradually adding advanced capabilities.

---

# 2. Overall Roadmap

```text
PHASE 0  → Project Planning
PHASE 1  → Repository & Development Setup
PHASE 2  → Frontend Foundation
PHASE 3  → Backend Foundation
PHASE 4  → Nebius + Nemotron Integration
PHASE 5  → Kairo Agent Core
PHASE 6  → GitHub Integration
PHASE 7  → Tavily Research
PHASE 8  → Docker Execution
PHASE 9  → Autonomous Test / Debug Loop
PHASE 10 → Supabase Integration
PHASE 11 → Complete Frontend
PHASE 12 → Observability
PHASE 13 → Security & Reliability
PHASE 14 → Integration Testing
PHASE 15 → Nebius Deployment
PHASE 16 → Vercel Deployment
PHASE 17 → Final Demo & Hackathon Preparation
PHASE 18 → Deployment Freeze
PHASE 19 → Submission
```

---

# 3. Phase 0 — Project Planning

## Goal

Establish the architecture and development rules before writing application code.

## Tasks

- [ ] Finalize project name: Kairo
- [ ] Finalize architecture
- [ ] Finalize technology stack
- [ ] Create GitHub repository
- [ ] Create project documentation
- [ ] Create `TECH_STACK.md`
- [ ] Create `APPLICATION_FILE_STRUCTURE.md`
- [ ] Create `PHASES.md`
- [ ] Define MVP
- [ ] Define hackathon demo workflow
- [ ] Define development milestones

## Deliverable

A clean project repository with the architecture documented.

---

# 4. Phase 1 — Repository & Development Setup

## Goal

Create the development environment.

## Tasks

### Repository

- [ ] Initialize Git
- [ ] Create GitHub repository
- [ ] Add README
- [ ] Add LICENSE
- [ ] Add `.gitignore`
- [ ] Add `.env.example`

### Frontend

- [ ] Initialize React
- [ ] Configure TypeScript
- [ ] Configure Vite
- [ ] Configure Tailwind CSS

### Backend

- [ ] Create Python environment
- [ ] Install FastAPI
- [ ] Create basic FastAPI application
- [ ] Add health endpoint

### Docker

- [ ] Verify Docker installation
- [ ] Create initial Docker configuration

## First milestone

```text
Frontend → Running
Backend  → Running
Docker   → Working
GitHub   → Connected
```

---

# 5. Phase 2 — Frontend Foundation

## Goal

Build the basic Kairo interface.

## Initial screens

```text
Landing
   ↓
Login
   ↓
Dashboard
   ↓
Project
   ↓
Agent Workspace
```

## Tasks

- [ ] Create application layout
- [ ] Create navbar
- [ ] Create sidebar
- [ ] Create dashboard
- [ ] Create project page
- [ ] Create agent workspace
- [ ] Create task input
- [ ] Create agent status component
- [ ] Create activity timeline
- [ ] Create terminal/output panel
- [ ] Create basic responsive layout

## Deliverable

A functional frontend prototype.

---

# 6. Phase 3 — Backend Foundation

## Goal

Create the FastAPI architecture.

## Tasks

- [ ] Create FastAPI application
- [ ] Configure settings
- [ ] Configure environment variables
- [ ] Create API routes
- [ ] Create schemas
- [ ] Create services
- [ ] Create error handling
- [ ] Create logging
- [ ] Create CORS configuration
- [ ] Create health endpoint

Initial API:

```text
GET  /health

POST /projects
GET  /projects

POST /agent/tasks
GET  /agent/tasks/{task_id}

GET  /executions/{execution_id}
```

## Deliverable

Frontend can communicate with backend.

---

# 7. Phase 4 — Nebius + Nemotron Integration

## Goal

Connect Kairo to its primary AI infrastructure.

## Tasks

- [ ] Configure Nebius credentials
- [ ] Connect Token Factory
- [ ] Select NVIDIA Nemotron model
- [ ] Create `nebius_service.py`
- [ ] Implement model request
- [ ] Handle model errors
- [ ] Add basic prompt structure
- [ ] Test inference

## First AI milestone

User:

```text
Explain this Python function.
```

Kairo:

```text
FastAPI
   ↓
Nebius
   ↓
Nemotron
   ↓
Response
```

## Deliverable

Kairo can successfully communicate with Nemotron.

---

# 8. Phase 5 — Kairo Agent Core

## Goal

Transform Kairo from an AI chatbot into an actual agent.

## Agent modules

```text
agent/
├── orchestrator.py
├── planner.py
├── researcher.py
├── repository_analyzer.py
├── coder.py
├── tester.py
├── debugger.py
├── reviewer.py
└── state.py
```

## First agent loop

```text
User Task
   ↓
Planner
   ↓
Coder
   ↓
Result
```

Then expand to:

```text
User Task
   ↓
Planner
   ↓
Coder
   ↓
Tester
   ↓
Reviewer
```

## Deliverable

Kairo can autonomously execute a basic multi-step task.

---

# 9. Phase 6 — GitHub Integration

## Goal

Allow Kairo to work with real repositories.

## Tasks

- [ ] Connect GitHub API
- [ ] Authenticate GitHub
- [ ] Select repository
- [ ] Retrieve repository information
- [ ] Clone repository
- [ ] Inspect files
- [ ] Read files
- [ ] Modify files
- [ ] Detect Git changes
- [ ] Create branch
- [ ] Generate diff
- [ ] Optionally create commit

## Workflow

```text
GitHub Repository
       ↓
Kairo
       ↓
Clone
       ↓
Analyze
       ↓
Modify
       ↓
Diff
```

## Deliverable

Kairo can work on a real GitHub repository.

---

# 10. Phase 7 — Tavily Research

## Goal

Give Kairo the ability to research technical problems.

## Tasks

- [ ] Connect Tavily
- [ ] Create search tool
- [ ] Create research service
- [ ] Add research decision logic
- [ ] Return structured research results
- [ ] Feed research into Nemotron
- [ ] Track searches

## Workflow

```text
Agent
  ↓
Needs external information?
  │
  ├── NO → Continue
  │
  └── YES
        ↓
      Tavily
        ↓
   Search Results
        ↓
     Nemotron
```

## Deliverable

Kairo can research unfamiliar technologies or errors when required.

---

# 11. Phase 8 — Docker Execution

## Goal

Allow Kairo to safely execute code.

## Tasks

- [ ] Create Docker sandbox
- [ ] Create execution runner
- [ ] Create process manager
- [ ] Capture stdout
- [ ] Capture stderr
- [ ] Capture exit code
- [ ] Configure timeouts
- [ ] Configure resource limits
- [ ] Create language templates
- [ ] Create security policies

## Supported environments initially

```text
Python
JavaScript
TypeScript
```

## Workflow

```text
Kairo
  ↓
Generated Code
  ↓
Docker Sandbox
  ↓
Execute
  ↓
Output
```

## Deliverable

Kairo can safely run generated code.

---

# 12. Phase 9 — Autonomous Test / Debug Loop

## Goal

Build the core differentiating capability.

This is where Kairo becomes a true software engineering agent rather than a code-generation chatbot.

## Workflow

```text
PLAN
  ↓
CODE
  ↓
RUN
  ↓
TEST
  ↓
PASS?
 │
 ├── YES → REVIEW → COMPLETE
 │
 └── NO
       ↓
    ANALYZE ERROR
       ↓
     DEBUG
       ↓
     MODIFY
       ↓
      TEST
       ↓
     Repeat
```

## Tasks

- [ ] Detect test failures
- [ ] Parse error output
- [ ] Send errors to Nemotron
- [ ] Generate fix
- [ ] Apply fix
- [ ] Rerun tests
- [ ] Set maximum iteration count
- [ ] Track each iteration
- [ ] Stop when tests pass
- [ ] Stop safely after iteration limit

## Deliverable

Kairo can:

> **Plan → Code → Test → Debug → Fix → Retest**

This should be the centerpiece of the hackathon demo.

---

# 13. Phase 10 — Supabase Integration

## Goal

Add persistent application data.

## Data to store

```text
Users
Projects
Repositories
Tasks
Agent Sessions
Executions
Test Results
Activity Logs
```

## Tasks

- [ ] Create Supabase project
- [ ] Configure credentials
- [ ] Create schema
- [ ] Create migrations
- [ ] Connect FastAPI
- [ ] Store projects
- [ ] Store tasks
- [ ] Store agent sessions
- [ ] Store executions
- [ ] Store results

## Optional

- [ ] Supabase Auth
- [ ] Supabase Storage

## Deliverable

Kairo retains project and agent history.

---

# 14. Phase 11 — Complete Frontend

## Goal

Connect the frontend to the complete backend.

## Dashboard

Display:

```text
Projects
Repositories
Active Tasks
Recent Executions
Agent Activity
```

## Agent Workspace

Display:

```text
User Task
   ↓
Planning
   ↓
Research
   ↓
Coding
   ↓
Execution
   ↓
Testing
   ↓
Debugging
   ↓
Review
```

## Repository View

Display:

- File tree
- Source files
- Changes
- Diff
- Repository status

## Execution View

Display:

- Current status
- Terminal output
- Test results
- Errors
- Iterations

## Deliverable

A complete end-to-end product interface.

---

# 15. Phase 12 — Observability

## Goal

Make the AI workflow observable and debuggable.

## LangSmith

Track:

```text
Agent Run
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
   ↓
Debugger
```

## Tasks

- [ ] Configure LangSmith
- [ ] Trace agent runs
- [ ] Trace model calls
- [ ] Trace tool calls
- [ ] Track errors
- [ ] Track latency
- [ ] Track token usage
- [ ] Create useful run metadata

## Deliverable

We can inspect exactly what Kairo did during an agent run.

---

# 16. Phase 13 — Security & Reliability

## Goal

Make Kairo safe enough for a public demo.

## Secrets

- [ ] Remove hardcoded API keys
- [ ] Verify `.gitignore`
- [ ] Configure production secrets

## Docker security

- [ ] Add execution timeout
- [ ] Add CPU limits
- [ ] Add memory limits
- [ ] Restrict filesystem access
- [ ] Restrict network access where appropriate
- [ ] Prevent privileged containers

## API security

- [ ] Validate inputs
- [ ] Handle authentication
- [ ] Add request limits
- [ ] Handle API failures
- [ ] Handle model failures
- [ ] Handle Docker failures
- [ ] Handle GitHub failures

## Agent safety

- [ ] Maximum agent iterations
- [ ] Maximum execution time
- [ ] Clear failure state
- [ ] Prevent infinite loops

## Deliverable

Kairo fails safely instead of hanging or exposing secrets.

---

# 17. Phase 14 — Integration Testing

## Goal

Test the entire system.

## Test levels

### Unit tests

```text
Planner
Coder
Debugger
Services
Utilities
```

### Integration tests

```text
Nebius
Tavily
GitHub
Supabase
Docker
```

### Agent tests

```text
Task
 ↓
Plan
 ↓
Code
 ↓
Test
 ↓
Debug
 ↓
Pass
```

### End-to-end test

```text
User
 ↓
Frontend
 ↓
FastAPI
 ↓
Nemotron
 ↓
GitHub
 ↓
Tavily
 ↓
Docker
 ↓
Tests
 ↓
Supabase
 ↓
Frontend
```

## Deliverable

A stable end-to-end Kairo workflow.

---

# 18. Phase 15 — Nebius Deployment

## Goal

Deploy the production backend.

## Tasks

- [ ] Create production Docker image
- [ ] Configure Nebius environment
- [ ] Configure environment variables
- [ ] Deploy FastAPI
- [ ] Verify health endpoint
- [ ] Verify Nebius Token Factory
- [ ] Verify Nemotron
- [ ] Verify Docker execution
- [ ] Verify GitHub integration
- [ ] Verify Tavily
- [ ] Verify Supabase
- [ ] Verify LangSmith

## Production architecture

```text
Internet
   ↓
Nebius AI Cloud
   ↓
FastAPI
   ↓
Kairo Agent
```

## Deliverable

Production backend running on Nebius.

---

# 19. Phase 16 — Vercel Deployment

## Goal

Deploy the production frontend.

## Tasks

- [ ] Connect GitHub repository
- [ ] Configure Vercel
- [ ] Configure production environment variables
- [ ] Configure backend API URL
- [ ] Build frontend
- [ ] Deploy
- [ ] Test frontend
- [ ] Test frontend → backend connection

## Production architecture

```text
User
 ↓
Vercel
 ↓
React Application
 ↓
Nebius Backend
```

## Deliverable

Public Kairo web application.

---

# 20. Phase 17 — Final Demo Preparation

## Goal

Create a reliable hackathon demonstration.

The demo should show a complete real workflow rather than individual features.

## Recommended demo

### Step 1

Open Kairo.

### Step 2

Connect a GitHub repository.

### Step 3

Give Kairo a real development task.

Example:

```text
"Find and fix the failing authentication test
in this repository."
```

### Step 4

Kairo creates a plan.

```text
Analyzing repository...
```

### Step 5

Kairo researches if required.

```text
Searching technical documentation...
```

### Step 6

Kairo modifies the code.

```text
Implementing fix...
```

### Step 7

Kairo runs Docker execution.

```text
Running tests...
```

### Step 8

Tests fail.

```text
2 tests failed.
Analyzing errors...
```

### Step 9

Kairo debugs automatically.

```text
Generating correction...
```

### Step 10

Kairo reruns tests.

```text
Tests passed.
```

### Step 11

Kairo shows:

```text
✓ Task completed
✓ Tests passed
✓ Changes generated
✓ Execution validated
```

This demonstrates the complete agent loop.

---

# 21. Phase 18 — Deployment Freeze

## Date

**October 29, 2026**

This is the internal Kairo deployment freeze.

By this date:

```text
Frontend       ✓
Backend        ✓
Nebius         ✓
Nemotron       ✓
GitHub         ✓
Tavily         ✓
Docker         ✓
Supabase       ✓
LangSmith      ✓
E2E Testing    ✓
Demo           ✓
```

After the freeze:

### Do not introduce major features.

Only fix:

- Critical bugs
- Deployment problems
- Security problems
- Demo-breaking UI issues
- Submission-related issues

---

# 22. Phase 19 — Hackathon Submission

## Goal

Prepare the final submission.

## GitHub

Verify:

- [ ] Public repository
- [ ] README complete
- [ ] LICENSE present
- [ ] Setup instructions
- [ ] Architecture documentation
- [ ] Screenshots
- [ ] Demo instructions
- [ ] Nebius usage explained
- [ ] NVIDIA Nemotron usage explained
- [ ] Tavily usage explained
- [ ] Deployment information

## Demo

- [ ] Production URL working
- [ ] Demo repository prepared
- [ ] Demo task tested
- [ ] Agent workflow tested
- [ ] Backup demo prepared

## Submission

- [ ] Project description
- [ ] Track selected
- [ ] Public repository URL
- [ ] Demo/deployment URL
- [ ] Demo video if required
- [ ] Technologies used
- [ ] Nebius usage
- [ ] NVIDIA model usage
- [ ] Additional prize requirements checked

---

# 23. Development Milestone System

Every phase should produce something working.

```text
M1
Frontend + Backend
       ↓
M2
Nebius + Nemotron
       ↓
M3
Basic Agent
       ↓
M4
GitHub Agent
       ↓
M5
Tavily Research
       ↓
M6
Docker Execution
       ↓
M7
Autonomous Debug Loop
       ↓
M8
Supabase Persistence
       ↓
M9
Complete UI
       ↓
M10
Observability
       ↓
M11
Production Deployment
       ↓
M12
Hackathon Demo
```

---

# 24. Definition of Done

A phase is not complete simply because the code exists.

A phase is complete when:

```text
Code
 ↓
Runs
 ↓
Tested
 ↓
Integrated
 ↓
Documented
```

For example:

### Bad

```text
Docker integration implemented.
```

### Done

```text
Docker integration
      ↓
Code executes
      ↓
Timeout works
      ↓
Errors captured
      ↓
Agent receives output
      ↓
Frontend displays result
      ↓
Integration test passes
```

---

# 25. Priority Levels

Not every feature has the same priority.

## 🔴 P0 — Essential

These must work for the hackathon:

```text
React frontend
FastAPI backend
Nebius
NVIDIA Nemotron
GitHub
Agent planning
Code modification
Docker execution
Testing
Debug loop
Supabase
Production deployment
```

## 🟡 P1 — Important

```text
Tavily research
LangSmith
Agent timeline
Repository browser
Diff viewer
Authentication
Execution history
```

## 🟢 P2 — Nice to Have

```text
Advanced analytics
Multiple programming languages
Advanced Git workflows
Complex project management
Advanced agent memory
Additional integrations
```

If time becomes limited:

> **P0 first. P1 second. P2 only if everything else is stable.**

---

# 26. Feature Freeze Strategy

Do not continuously add features until the deadline.

Use:

```text
BUILD
 ↓
INTEGRATE
 ↓
TEST
 ↓
STABILIZE
 ↓
FREEZE
 ↓
SUBMIT
```

Avoid:

```text
BUILD
 ↓
ADD FEATURE
 ↓
ADD FEATURE
 ↓
ADD FEATURE
 ↓
BREAK EVERYTHING
 ↓
DEADLINE
```

---

# 27. Final Kairo Development Flow

```text
                KAIRO DEVELOPMENT

                       START
                         │
                         ▼
                Project Setup
                         │
                         ▼
                Frontend + Backend
                         │
                         ▼
                 Nebius + Nemotron
                         │
                         ▼
                   Agent Core
                         │
                         ▼
                 GitHub Integration
                         │
                         ▼
                  Tavily Research
                         │
                         ▼
                  Docker Sandbox
                         │
                         ▼
              Autonomous Test Loop
                         │
                         ▼
                    Supabase
                         │
                         ▼
                  Complete UI
                         │
                         ▼
                   LangSmith
                         │
                         ▼
               Security + Reliability
                         │
                         ▼
                 Integration Tests
                         │
                         ▼
              Nebius Backend Deploy
                         │
                         ▼
                Vercel Frontend
                         │
                         ▼
                  Final E2E Test
                         │
                         ▼
             October 29 Freeze
                         │
                         ▼
                  Final Demo
                         │
                         ▼
                Hackathon Submit
```

---

# 28. October 29 Rule

**October 29, 2026 is the Kairo deployment freeze.**

The objective is not to finish development on October 29.

The objective is to arrive on October 29 with a stable production system and use the day for:

```text
Final testing
     ↓
Bug fixing
     ↓
Deployment verification
     ↓
Demo verification
     ↓
Submission verification
```

No major architectural changes after the freeze.

---

# 29. Final Success Criteria

Kairo is considered ready when a user can:

```text
1. Open Kairo
        ↓
2. Create / select a project
        ↓
3. Connect a GitHub repository
        ↓
4. Submit a coding task
        ↓
5. Kairo understands the task
        ↓
6. Kairo plans the solution
        ↓
7. Kairo researches when required
        ↓
8. Kairo modifies the repository
        ↓
9. Kairo executes the code in Docker
        ↓
10. Kairo runs tests
        ↓
11. Kairo diagnoses failures
        ↓
12. Kairo fixes the code
        ↓
13. Kairo retests
        ↓
14. Kairo validates the result
        ↓
15. User receives the final result
```

**That complete workflow is the definition of the Kairo MVP.**

---

# 30. Final Principle

Build Kairo in this order:

> **Working → Integrated → Tested → Stable → Deployed → Demo-ready**

Do not optimize for the number of features.

Optimize for one impressive, reliable end-to-end agent workflow:

```text
PLAN
  ↓
RESEARCH
  ↓
CODE
  ↓
EXECUTE
  ↓
TEST
  ↓
DEBUG
  ↓
RETEST
  ↓
VALIDATE
```

That workflow is the heart of Kairo.