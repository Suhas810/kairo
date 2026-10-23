# Kairo — Frontend Architecture

## 1. Technology

```text
React
TypeScript
Vite
Tailwind CSS
```

Deployment:

```text
Vercel
```

The frontend communicates with the FastAPI backend over HTTPS.

## 2. Frontend Structure

Recommended structure:

```text
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── agent/
│   │   ├── project/
│   │   └── run/
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Project.tsx
│   │   └── Run.tsx
│   │
│   ├── hooks/
│   ├── services/
│   │   ├── api.ts
│   │   └── runs.ts
│   │
│   ├── types/
│   ├── lib/
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 3. Main Screens

### Dashboard

Shows:

- Projects
- Recent runs
- Run status
- Quick task submission

### Project View

Shows:

- Project information
- Repository information
- Recent agent runs
- Project configuration

### Agent Run View

The main Kairo interface.

Displays:

- User task
- Current stage
- Agent timeline
- Generated changes
- Execution logs
- Test results
- Debugging attempts
- Final result

## 4. Component Model

```text
App
 ├── Layout
 │   ├── Sidebar
 │   └── Main Content
 │
 ├── Dashboard
 │   ├── ProjectList
 │   └── RecentRuns
 │
 └── Run
     ├── TaskHeader
     ├── AgentTimeline
     ├── CodeChanges
     ├── ExecutionLogs
     ├── TestResults
     └── FinalSummary
```

## 5. API Communication

Centralize API calls.

Example:

```text
services/
├── api.ts
├── projects.ts
└── runs.ts
```

The frontend should not directly call third-party AI services.

All privileged operations go through the backend.

## 6. Run State

The frontend maps backend run states to visual states:

```text
queued       → Waiting
planning     → Planning
researching  → Researching
implementing → Coding
executing    → Executing
testing      → Testing
debugging    → Fixing
reviewing    → Reviewing
completed    → Completed
failed       → Failed
```

## 7. Live Progress

The UI should provide near-real-time updates.

The initial implementation can use polling:

```text
GET /api/runs/{run_id}
GET /api/runs/{run_id}/events
```

A streaming transport can be introduced later if required.

## 8. Error Handling

Frontend errors should distinguish between:

- Network errors
- Authentication errors
- Invalid task errors
- Agent failures
- Execution failures
- Server errors

Users should see actionable messages instead of raw stack traces.

## 9. Security

Never expose:

- Nebius API credentials
- GitHub tokens
- Tavily keys
- Supabase service-role keys

Secrets remain on the backend.

Only public/client-safe configuration is exposed to the browser.

## 10. UX Principle

Kairo should make the agent's work visible.

Instead of:

```text
Generating...
```

show:

```text
✓ Planning
✓ Research
→ Implementing
○ Testing
○ Review
```

This makes autonomous execution understandable and demonstrates the system clearly during the hackathon demo.
