# Kairo — Authentication

## 1. Purpose

Authentication identifies the user accessing Kairo.

Authorization determines what that authenticated user is allowed to access.

Kairo uses **Supabase Authentication** together with backend authorization and Supabase Row Level Security.

## 2. Authentication Architecture

```text
┌──────────────┐
│    Browser   │
└──────┬───────┘
       │
       │ Login / Signup
       ▼
┌────────────────────┐
│ Supabase Auth      │
└─────────┬──────────┘
          │
          │ Authenticated Identity
          ▼
┌────────────────────┐
│ Kairo Frontend     │
└─────────┬──────────┘
          │
          │ Bearer Token
          ▼
┌────────────────────┐
│ FastAPI Backend    │
└─────────┬──────────┘
          │
          ▼
      Supabase DB
```

## 3. Authentication Provider

Supabase Auth can provide:

- Email/password authentication
- OAuth providers
- Session management
- Access tokens
- Refresh tokens

The initial Kairo implementation can start with email/password and add OAuth if required.

## 4. Signup Flow

```text
User
 ↓
Signup Form
 ↓
Supabase Auth
 ↓
User Account Created
 ↓
Session Created
 ↓
Frontend
 ↓
Kairo Dashboard
```

After authentication, the frontend can access the user's authenticated identity.

## 5. Login Flow

```text
User
 ↓
Login
 ↓
Supabase Auth
 ↓
Credentials Verified
 ↓
Session / Access Token
 ↓
Frontend
 ↓
Dashboard
```

## 6. Backend Authentication

Requests to protected backend endpoints should include an access token.

Example:

```http
Authorization: Bearer <access_token>
```

FastAPI validates the token before processing protected operations.

```text
Request
  ↓
Extract Token
  ↓
Validate Token
  ↓
Identify User
  ↓
Authorization Check
  ↓
Execute Request
```

## 7. Authorization

Authentication alone is not enough.

Kairo must ensure that a user can access only their own resources.

Example:

```text
User A
 ├── Project A ✓
 ├── Task A ✓
 └── Run A ✓

User B
 ├── Project B ✓
 ├── Task B ✓
 └── Run B ✓

User A → Project B ✗
User B → Project A ✗
```

## 8. Resource Ownership

The main ownership chain is:

```text
User
  ↓
Project
  ↓
Task
  ↓
Agent Run
  ↓
Events / Artifacts / Test Results
```

Backend authorization should verify ownership before returning or modifying resources.

## 9. Supabase Row Level Security

RLS should protect database access.

Conceptually:

```text
Authenticated User
       ↓
Supabase Request
       ↓
RLS Policy
       ↓
Own Data?
   ├── Yes → Allow
   └── No  → Deny
```

Example policy concept:

```text
projects.user_id = authenticated_user_id
```

The exact SQL policy should match the application's Supabase Auth configuration.

## 10. Protected API Endpoints

Examples:

```text
GET  /api/projects
POST /api/projects

GET  /api/projects/{project_id}

POST /api/runs
GET  /api/runs/{run_id}
GET  /api/runs/{run_id}/events

POST /api/runs/{run_id}/cancel
```

These endpoints should require authentication.

Public endpoints can include:

```text
GET /api/health
```

## 11. Session Handling

The frontend should rely on the Supabase Auth client for session management.

Conceptually:

```text
Supabase Auth
      ↓
Session
      ↓
Access Token
      ↓
API Request
```

The frontend should not implement its own password storage or authentication protocol.

## 12. Logout

Logout flow:

```text
User
 ↓
Logout
 ↓
Supabase Session Terminated
 ↓
Frontend Clears Auth State
 ↓
Redirect to Login
```

## 13. Token Security

Tokens should:

- Be transmitted over HTTPS
- Not be written to application logs
- Not be included in URLs
- Not be exposed to generated code
- Be handled through the authentication library

## 14. Backend Identity

After validating the token, FastAPI should derive the authenticated user identity from the token rather than trusting a user ID supplied by the request body.

Bad:

```json
{
  "user_id": "someone-else",
  "project_id": "project123"
}
```

Good:

```text
Authenticated Token
       ↓
Backend identifies User
       ↓
Backend checks project ownership
```

## 15. Project Access

Before accessing a project:

```text
Request
  ↓
Authenticate User
  ↓
Load Project
  ↓
Check project.user_id
  ↓
Matches authenticated user?
   ├── Yes → Continue
   └── No  → 403 Forbidden
```

## 16. Agent Run Access

The same ownership principle applies to agent runs.

```text
GET /api/runs/{run_id}
        ↓
Authenticate
        ↓
Find Run
        ↓
Find Associated Project/Task
        ↓
Verify Ownership
        ↓
Return Run
```

A user must not be able to retrieve another user's agent execution history by guessing a run ID.

## 17. Authentication Errors

Recommended responses:

```text
401 Unauthorized
```

When the request is missing or has an invalid authentication token.

```text
403 Forbidden
```

When the user is authenticated but does not have permission to access the resource.

```text
404 Not Found
```

Can be used where appropriate to avoid revealing whether unauthorized resources exist.

## 18. Development vs Production

### Development

```text
Frontend
    ↓
Supabase Auth
    ↓
Local FastAPI
    ↓
Supabase
```

### Production

```text
Frontend on Vercel
    ↓
Supabase Auth
    ↓
FastAPI on Nebius
    ↓
Supabase
```

All production authentication traffic should use HTTPS.

## 19. Authentication Checklist

```text
[ ] Supabase Auth configured
[ ] Protected backend routes require authentication
[ ] Access tokens validated
[ ] User identity derived from authenticated session
[ ] Project ownership checked
[ ] Agent run ownership checked
[ ] Supabase RLS enabled
[ ] Service-role key remains backend-only
[ ] Authentication errors handled safely
[ ] HTTPS enabled in production
[ ] Tokens excluded from logs
```

## 20. Core Principle

Kairo follows:

```text
Authenticate
    ↓
Identify
    ↓
Authorize
    ↓
Access Resource
```

Authentication establishes who the user is.

Authorization determines what that user can access.

Supabase Auth + FastAPI authorization + Row Level Security provide the security foundation for Kairo's user and project data.
