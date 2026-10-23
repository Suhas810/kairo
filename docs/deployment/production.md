# Production

## Overview

Production is the final environment where users interact with the deployed Kairo application.

Kairo uses separate services for the frontend, backend, database, AI infrastructure, and search.

```text
                         ┌──────────────┐
                         │     User     │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │    Vercel    │
                         │   Frontend   │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │    FastAPI   │
                         │    Backend   │
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              ↓                 ↓                 ↓
        ┌──────────┐      ┌──────────┐      ┌──────────┐
        │ Supabase │      │  Nebius  │      │  Tavily  │
        │ Database │      │    AI    │      │  Search  │
        └──────────┘      └──────────┘      └──────────┘
```

---

## Production Components

| Component | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Frontend Hosting | Vercel |
| Backend | Python + FastAPI |
| Database | Supabase |
| AI | Nebius |
| Search | Tavily |
| Containers | Docker |
| Repository | GitHub |

---

## Environment Separation

Kairo should maintain separate configurations for:

```text
Development
     ↓
Preview / Testing
     ↓
Production
```

Production credentials must never be reused in local development when avoidable.

---

## Production Environment Variables

Backend:

```env
ENVIRONMENT=production

NEBIUS_API_KEY=
NEBIUS_MODEL=

TAVILY_API_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

FRONTEND_URL=
```

Frontend:

```env
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Production Security

### Secrets

All secrets must be stored using secure environment-variable management.

Never commit secrets to GitHub.

### API Access

The backend should validate:

- Authentication
- Authorization
- Request parameters
- Input size
- Agent execution limits

### CORS

Allow only trusted frontend origins.

### Database

Use Supabase security policies and appropriate access controls.

Never expose the Supabase service-role key to the browser.

---

## Production Agent Execution

Agent execution should be controlled.

Example:

```text
User Request
     ↓
Authentication
     ↓
Request Validation
     ↓
Agent Controller
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
Final Result
```

The agent should have:

- Maximum iterations
- Request timeout
- Tool timeout
- Retry limits
- Error recovery
- Execution logging

---

## Monitoring

Production monitoring should track:

- API errors
- Response latency
- AI request failures
- Agent failures
- Database errors
- Authentication failures
- Deployment failures
- Resource usage

Logs must not contain sensitive credentials or user secrets.

---

## Deployment Workflow

```text
Developer
    ↓
Feature Branch
    ↓
Local Testing
    ↓
GitHub Pull Request
    ↓
Code Review
    ↓
Preview Deployment
    ↓
Integration Testing
    ↓
Production Approval
    ↓
Production Deployment
    ↓
Smoke Testing
```

---

## Production Smoke Tests

After deployment, verify:

### Frontend

- [ ] Website loads
- [ ] Navigation works
- [ ] Authentication works
- [ ] UI loads correctly

### Backend

- [ ] API is reachable
- [ ] Health endpoint works
- [ ] Authentication works
- [ ] CORS works

### Database

- [ ] Supabase connection works
- [ ] Reads work
- [ ] Writes work
- [ ] Security policies work

### AI

- [ ] Nebius request works
- [ ] Agent starts
- [ ] Agent tools work
- [ ] Agent terminates correctly
- [ ] Final response is returned

### Search

- [ ] Tavily search works
- [ ] Search failures are handled

---

## Health Check

The backend should expose a health endpoint:

```text
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

This can be used to verify that the production backend is running.

---

## Rollback Strategy

If a production deployment introduces a critical issue:

```text
Production Issue
      ↓
Identify Failed Deployment
      ↓
Rollback
      ↓
Restore Previous Version
      ↓
Verify Application
      ↓
Investigate Issue
```

Never leave a known critical production failure unresolved.

---

## Production Readiness Checklist

### Application

- [ ] Frontend production build succeeds
- [ ] Backend production build succeeds
- [ ] API endpoints tested
- [ ] Agent workflow tested
- [ ] Error handling tested

### Infrastructure

- [ ] Vercel configured
- [ ] Backend deployed
- [ ] Supabase configured
- [ ] Nebius configured
- [ ] Tavily configured
- [ ] Docker configuration verified

### Security

- [ ] Secrets protected
- [ ] CORS restricted
- [ ] Authentication enabled
- [ ] Authorization verified
- [ ] Database policies enabled
- [ ] Service-role credentials kept server-side

### Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] End-to-end workflow tested
- [ ] Production smoke tests pass

### Hackathon Submission

- [ ] Production URL works
- [ ] Demo workflow works
- [ ] GitHub repository is accessible
- [ ] README is complete
- [ ] Architecture documentation is complete
- [ ] Environment setup is documented
- [ ] Demo credentials/instructions are prepared if required