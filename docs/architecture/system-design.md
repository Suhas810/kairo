# Kairo — System Design

## 1. Overview

Kairo is an AI-powered software engineering agent designed to take a software task from a natural-language request through planning, research, implementation, execution, testing, debugging, and final review.

The system is designed for the Nebius Global AI Hackathon and uses Nebius AI infrastructure as the primary AI/runtime platform.

### Core objective

Kairo should behave less like a code-generation chatbot and more like an execution-oriented engineering system:

```text
User Task
   ↓
Understand
   ↓
Plan
   ↓
Research
   ↓
Implement
   ↓
Run
   ↓
Test
   ↓
Debug / Fix
   ↓
Review
   ↓
Result
```

## 2. High-Level Architecture

```text
┌───────────────────────────────┐
│           Frontend            │
│       React + TypeScript      │
│            Vite               │
└───────────────┬───────────────┘
                │ HTTPS / REST
                ▼
┌───────────────────────────────┐
│        FastAPI Backend        │
│       API + Agent Runtime     │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Kairo Agent System      │
│                               │
│ Planner → Researcher          │
│ → Coder → Executor            │
│ → Tester → Debugger → Review  │
└───────┬───────────┬───────────┘
        │           │
        ▼           ▼
   Nebius AI     External Tools
   / Nemotron    GitHub / Tavily
        │           │
        └─────┬─────┘
              ▼
       Isolated Execution
            Docker
              │
              ▼
          Supabase
       Projects / Runs /
       Tasks / Results
```

## 3. Major Components

### Frontend

Responsible for:

- Task submission
- Project selection
- Agent run status
- Live execution timeline
- Generated code/result display
- Test output
- Error and fix history
- Final result presentation

Technology:

- React
- TypeScript
- Vite
- Tailwind CSS

Deployment:

- Vercel

### Backend

Responsible for:

- REST API
- Authentication/session handling
- Agent orchestration
- Tool access
- GitHub operations
- Research requests
- Code execution
- Test execution
- Run state management

Technology:

- Python
- FastAPI

Deployment:

- Nebius AI Cloud

### Agent Runtime

The agent runtime coordinates specialized stages:

1. Planner
2. Researcher
3. Coder
4. Executor
5. Tester
6. Debugger
7. Reviewer

The runtime uses Nebius-hosted AI models through the Nebius AI stack.

### Database

Supabase is the single project database layer.

It stores:

- Users
- Projects
- Tasks
- Agent runs
- Agent events
- Generated artifacts metadata
- Test results
- Run status
- Configuration metadata

No separately managed PostgreSQL service is required.

### External Integrations

Kairo can interact with:

- GitHub — repository and code workflow
- Tavily — web research
- Docker — isolated code execution

## 4. Data Flow

```text
Browser
  │
  │ task
  ▼
FastAPI
  │
  ▼
Agent Orchestrator
  │
  ├── Nebius / Nemotron → reasoning
  ├── Tavily → research
  ├── GitHub → repository operations
  └── Docker → execution/testing
  │
  ▼
Supabase
  │
  ▼
Frontend
```

## 5. Design Principles

### Execution over generation

Kairo does not stop after producing code. It attempts to execute and validate the generated solution.

### Tool-driven agent

The model is connected to controlled tools instead of receiving unrestricted access to the host system.

### Iterative engineering loop

Failures become feedback:

```text
Generate → Execute → Observe → Diagnose → Fix → Re-test
```

### Isolation

User-generated code is executed inside an isolated Docker environment rather than directly inside the API process.

### Observable runs

Every meaningful agent stage should produce an event that can be displayed in the frontend.

## 6. Failure Handling

A run can fail because of:

- Invalid task interpretation
- Research failure
- Code generation failure
- Dependency installation failure
- Compilation/runtime errors
- Test failures
- Tool/API failures
- Agent timeout

The system should preserve the run state and expose the failure reason.

## 7. Scalability Direction

The initial hackathon version is intentionally simple.

Future scaling can separate:

- API service
- Agent workers
- Execution workers
- Research workers
- Background job queue

The architecture therefore keeps orchestration boundaries explicit without prematurely introducing unnecessary infrastructure.
