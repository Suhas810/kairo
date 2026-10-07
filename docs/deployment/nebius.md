# Nebius

## Overview

Nebius is used as the primary AI infrastructure provider for Kairo.

Kairo uses Nebius primarily for AI inference and AI-related workloads.

The application architecture separates the user-facing application from AI infrastructure.

```text
User
  ↓
Kairo Frontend
  ↓
Kairo Backend
  ↓
Agent System
  ↓
Nebius AI
  ↓
AI Response
```

---

## Nebius Responsibilities

Nebius is responsible for:

- AI model inference
- Agent reasoning workloads
- AI-powered code analysis
- AI-powered planning
- AI-powered research
- AI-powered coding assistance
- Other model-based Kairo operations

The application backend manages orchestration and tool execution.

---

## API Authentication

Nebius credentials must be stored as backend environment variables.

Example:

```env
NEBIUS_API_KEY=your_api_key
```

The key must never be exposed to the frontend.

The frontend should communicate with the Kairo backend:

```text
Frontend
   ↓
FastAPI Backend
   ↓
Nebius API
```

Not:

```text
Frontend
   ↓
Nebius API
```

---

## AI Request Flow

A typical request follows:

```text
User Request
     ↓
Frontend
     ↓
FastAPI API
     ↓
Agent Controller
     ↓
Planner
     ↓
Research / Coding / Testing Tools
     ↓
Nebius Model
     ↓
Agent Decision
     ↓
Tool Execution
     ↓
Final Response
     ↓
Frontend
```

---

## Environment Configuration

Backend configuration:

```env
NEBIUS_API_KEY=
NEBIUS_MODEL=
```

The exact model identifier should be configurable rather than hard-coded.

---

## Development

During local development:

```text
Local Frontend
      ↓
Local FastAPI Backend
      ↓
Nebius API
```

This allows developers to test the complete AI workflow before deployment.

---

## Production

In production:

```text
User
 ↓
Vercel
 ↓
Kairo Backend
 ↓
Nebius
```

The backend is responsible for securely communicating with Nebius.

---

## Security

Nebius credentials must:

- Never be committed to Git
- Never be stored in frontend code
- Never be returned through API responses
- Never be included in logs
- Be stored using deployment-provider secrets/environment variables

---

## Cost Control

AI requests should be controlled through:

- Model selection
- Request limits
- Context management
- Token limits
- Error handling
- Retry limits
- Agent iteration limits

The agent should not continue indefinitely.

Example:

```text
Maximum Agent Iterations
        ↓
      Limit
        ↓
Stop Agent
        ↓
Return Result
```

---

## Failure Handling

If Nebius becomes unavailable:

```text
Agent Request
     ↓
Nebius API
     ↓
Failure
     ↓
Retry Policy
     ↓
Retry
     ↓
Still Failed?
     ↓
Return Controlled Error
```

The backend should never expose raw infrastructure errors directly to users.

---

## Deployment Checklist

Before production:

- [ ] Nebius API key configured
- [ ] Model configured
- [ ] API connectivity tested
- [ ] Request limits configured
- [ ] Error handling tested
- [ ] Timeout handling tested
- [ ] Secrets stored securely
- [ ] Logs checked
- [ ] Agent iteration limits enabled