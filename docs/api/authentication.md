# Authentication

## Overview

Kairo uses authentication to identify users and protect application resources.

Authentication is handled through **Supabase Auth**, while the Kairo FastAPI backend validates authenticated requests.

```text
User
 ↓
Kairo Frontend
 ↓
Supabase Auth
 ↓
Authenticated Session
 ↓
FastAPI Backend
 ↓
Authorization
 ↓
Protected Resource
```

---

# Authentication Architecture

```text
┌────────────────────┐
│      Browser       │
│   React Frontend   │
└─────────┬──────────┘
          │
          ↓
┌────────────────────┐
│   Supabase Auth    │
│                    │
│ Login / Signup     │
│ Session Management │
└─────────┬──────────┘
          │
          ↓
┌────────────────────┐
│   Access Token     │
└─────────┬──────────┘
          │
          ↓
┌────────────────────┐
│   FastAPI Backend  │
│ Token Validation   │
└─────────┬──────────┘
          │
          ↓
┌────────────────────┐
│ Protected Kairo    │
│ Resources          │
└────────────────────┘
```

---

# Authentication Provider

Kairo uses:

**Supabase Authentication**

Supabase can provide:

- Email/password authentication
- OAuth authentication
- Session management
- JWT-based access tokens
- User identity management

---

# User Registration

The frontend sends registration information to Supabase Auth.

Example:

```text
User
 ↓
Sign Up
 ↓
Supabase Auth
 ↓
Create User
 ↓
Create Session
 ↓
Frontend
```

Example client operation:

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password
});
```

The exact implementation may change depending on the authentication flow selected for Kairo.

---

# User Login

Example:

```typescript
const { data, error } =
  await supabase.auth.signInWithPassword({
    email,
    password
  });
```

Successful authentication creates a user session.

---

# Session

The frontend maintains the authenticated session through Supabase Auth.

The session contains authentication information such as:

```text
User ID
Access Token
Refresh Token
Expiration
```

Sensitive session information must not be logged.

---

# Access Token

Authenticated requests to the Kairo backend should include the access token.

Example:

```http
Authorization: Bearer <access-token>
```

Request flow:

```text
Frontend
   ↓
Get Supabase Session
   ↓
Access Token
   ↓
Authorization Header
   ↓
FastAPI
```

---

# Backend Token Validation

The FastAPI backend validates the token before accessing protected resources.

```text
Request
  ↓
Authorization Header
  ↓
Extract Token
  ↓
Validate Token
  ↓
Identify User
  ↓
Authorization Check
  ↓
Process Request
```

Invalid or missing tokens should result in:

```http
401 Unauthorized
```

---

# Authentication Middleware

Protected routes should use authentication dependencies.

Conceptually:

```python
@router.get("/projects")
async def get_projects(current_user=Depends(get_current_user)):
    ...
```

The authentication dependency should:

1. Read the Authorization header
2. Extract the bearer token
3. Validate the token
4. Identify the user
5. Reject invalid sessions
6. Return the authenticated user

---

# Authorization

Authentication answers:

> Who is the user?

Authorization answers:

> What is the user allowed to access?

Kairo must perform both checks.

Example:

```text
Authenticated User
        ↓
User ID = user-123
        ↓
Project belongs to user-123?
        ↓
Yes → Allow
No  → Reject
```

A user must never be able to access another user's project simply by changing a project ID.

---

# Protected Endpoints

The following endpoints should require authentication:

```text
/api/v1/projects
/api/v1/projects/{project_id}

/api/v1/agents/tasks
/api/v1/agents/tasks/{task_id}

/api/v1/research

/api/v1/user/*
```

Public endpoints may include:

```text
/api/v1/health
```

---

# Supabase Database Security

Supabase Row Level Security should be used to protect user-owned data.

Conceptually:

```text
User A
 ↓
Can access
 ↓
User A's Projects

User B
 ↓
Can access
 ↓
User B's Projects
```

User A must not be able to access User B's private data.

---

# User ID

Every user should have a unique Supabase user ID.

Example:

```text
user_id = "8f23..."
```

Application records should associate resources with the authenticated user.

Example:

```text
projects
├── id
├── user_id
├── name
├── description
└── created_at
```

---

# Logout

Users can terminate their session through Supabase Auth.

Example:

```typescript
await supabase.auth.signOut();
```

After logout:

```text
Session
 ↓
Invalidated
 ↓
Protected API Requests
 ↓
401 Unauthorized
```

---

# OAuth Authentication

If Kairo enables OAuth providers such as Google, the flow becomes:

```text
User
 ↓
Login with Google
 ↓
OAuth Provider
 ↓
Supabase Auth
 ↓
Authenticated Session
 ↓
Kairo
```

OAuth providers should be configured through Supabase rather than exposing provider secrets in frontend code.

---

# Frontend Route Protection

Protected pages should verify authentication before rendering.

Example:

```text
User
 ↓
Open Dashboard
 ↓
Authenticated?
 ├── Yes → Dashboard
 └── No  → Login
```

Potential protected pages:

```text
/dashboard
/projects
/projects/:id
/agents
/settings
```

---

# Backend Authorization

Backend authorization should verify ownership.

Example:

```text
GET /projects/project-123

Authentication:
    user = user-456

Database:
    project.user_id = user-123

Comparison:
    user-456 != user-123

Result:
    403 Forbidden
```

---

# Authentication Errors

## Missing Token

```http
401 Unauthorized
```

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication is required"
  }
}
```

## Invalid Token

```http
401 Unauthorized
```

```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "The authentication token is invalid"
  }
}
```

## Insufficient Permissions

```http
403 Forbidden
```

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

---

# Security Rules

Never:

- Store passwords in the Kairo database
- Log access tokens
- Expose service-role keys
- Put private API keys in frontend code
- Trust user-provided user IDs for authorization
- Allow unrestricted database access
- Return authentication secrets through API responses

---

# Environment Variables

Frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Backend:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

The Supabase service-role key must remain **server-side only**.

---

# Authentication Flow

Complete Kairo authentication flow:

```text
                    ┌───────────────┐
                    │     User      │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ React/Vite    │
                    │   Frontend    │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ Supabase Auth │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ Access Token  │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ FastAPI       │
                    │ Backend       │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ Authorization │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │   Supabase    │
                    │   Database    │
                    └───────────────┘
```

---

# Authentication Checklist

### Frontend

- [ ] Supabase client configured
- [ ] Login implemented
- [ ] Registration implemented
- [ ] Logout implemented
- [ ] Session persistence implemented
- [ ] Protected routes implemented

### Backend

- [ ] Authorization header validation
- [ ] Token validation
- [ ] Current-user dependency
- [ ] Resource ownership checks
- [ ] 401 handling
- [ ] 403 handling

### Database

- [ ] Row Level Security enabled
- [ ] User ownership implemented
- [ ] Policies tested
- [ ] Service-role key kept server-side

### Security

- [ ] No passwords stored by Kairo
- [ ] No tokens logged
- [ ] No secrets in GitHub
- [ ] No service-role key in frontend
- [ ] Production authentication tested