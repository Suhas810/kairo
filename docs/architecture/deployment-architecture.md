# Kairo — Deployment Architecture

## 1. Deployment Overview

Kairo uses a two-primary-service deployment model:

```text
                  Internet
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
       Vercel                Nebius
      Frontend               Backend
          │                     │
          │ HTTPS               │
          └──────────┬──────────┘
                     ▼
                  Supabase
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Projects     Runs      Events
                     │
                     ▼
                  Tools
            ┌────────┼────────┐
            ▼        ▼        ▼
         Nebius    GitHub    Tavily
         Models
                     │
                     ▼
                  Docker
                Execution
```

## 2. Frontend Hosting

### Platform

Vercel

### Application

React + TypeScript + Vite

### Responsibilities

- Serve the web application
- Provide HTTPS
- Build the frontend
- Inject public frontend configuration
- Connect users to the backend API

The frontend does not contain private API credentials.

## 3. Backend Hosting

### Platform

Nebius AI Cloud

### Application

FastAPI

### Responsibilities

- API server
- Agent orchestration
- Nebius model access
- Tool integration
- Docker execution
- Supabase access

The backend is the main trusted runtime.

## 4. AI Infrastructure

Nebius provides the AI runtime for Kairo.

Conceptually:

```text
FastAPI
   ↓
Nebius AI
   ↓
NVIDIA Nemotron
   ↓
Agent reasoning
```

Model configuration should remain environment-driven.

## 5. Database

Supabase is used as the single database platform.

It provides the persistence layer for:

- Users
- Projects
- Tasks
- Agent runs
- Agent events
- Test results
- Artifact metadata

No separately deployed PostgreSQL database is part of the Kairo architecture.

## 6. External Services

### GitHub

Repository and source-code integration.

### Tavily

Web research.

### Docker

Isolated execution environment.

These services are accessed by the backend, not directly by the browser.

## 7. Environment Separation

Recommended environments:

```text
Local Development
      ↓
GitHub
      ↓
Deployment
      ↓
Vercel + Nebius
```

### Local development

```text
Frontend → localhost
Backend  → localhost
Supabase → hosted project
```

### Production

```text
Frontend → Vercel
Backend  → Nebius AI Cloud
Database → Supabase
```

## 8. Environment Variables

### Frontend

Only public values:

```text
VITE_API_BASE_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Backend

Private values:

```text
NEBIUS_API_KEY
NEBIUS_MODEL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GITHUB_TOKEN
TAVILY_API_KEY
```

## 9. Deployment Flow

```text
Developer
   ↓
Git Commit
   ↓
GitHub
   │
   ├──────────────→ Vercel
   │                  ↓
   │              Frontend Deploy
   │
   └──────────────→ Nebius
                      ↓
                  Backend Deploy
```

## 10. Production Request Flow

```text
User Browser
     │
     ▼
Vercel Frontend
     │
     │ HTTPS
     ▼
Nebius FastAPI
     │
     ├── Nebius AI / Nemotron
     ├── Supabase
     ├── GitHub
     ├── Tavily
     └── Docker
     │
     ▼
Agent Result
     │
     ▼
Frontend
```

## 11. Security Boundaries

```text
PUBLIC
  │
  └── Vercel Frontend
          │
          │ HTTPS
          ▼
TRUSTED
  │
  └── Nebius Backend
          │
          ├── Secrets
          ├── AI access
          ├── GitHub access
          ├── Research access
          └── Execution control
                 │
                 ▼
          ISOLATED EXECUTION
                 │
                 └── Docker
```

## 12. Hackathon Deployment Target

The target production setup is:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Nebius AI Cloud |
| AI Model | Nebius AI / NVIDIA Nemotron |
| Database | Supabase |
| Code Execution | Docker |
| Repository Integration | GitHub |
| Web Research | Tavily |

This keeps the architecture straightforward while making Nebius a meaningful part of Kairo's core runtime rather than only an external API dependency.

## 13. Submission Readiness

Before the final hackathon submission, verify:

- Frontend production URL works
- Backend health endpoint works
- Frontend can reach backend
- Nebius model calls work
- Supabase persistence works
- GitHub integration works
- Research tool works
- Docker execution works
- Agent can complete at least one end-to-end task
- Logs contain no secrets
- Environment variables are configured in production
