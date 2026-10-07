# Kairo — Secrets Management

## 1. Purpose

Kairo integrates with services that require credentials.

Examples:

```text
Nebius
Supabase
GitHub
Tavily
```

Secrets must remain on trusted backend infrastructure and must never be committed to the repository or exposed to the browser.

## 2. Secret Boundary

```text
                    Browser
                       │
                 Public Config
                       │
                       ▼
                FastAPI Backend
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
           Nebius   GitHub    Tavily
             │
             ▼
          Supabase
```

Private credentials exist only on the server side.

## 3. Backend Secrets

Typical backend environment variables:

```text
NEBIUS_API_KEY
NEBIUS_MODEL

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

GITHUB_TOKEN

TAVILY_API_KEY
```

The exact variable names can be adjusted to the implementation.

## 4. Frontend Configuration

Only client-safe values may be exposed to the frontend.

Example:

```text
VITE_API_BASE_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The Supabase anonymous key is designed for client-side use when Row Level Security is correctly configured.

The Supabase service-role key is server-only.

## 5. Never Commit Secrets

The following files must not contain real credentials:

```text
GitHub repository
Source code
README files
Documentation
Docker images
Frontend bundles
Public logs
Screenshots
```

Use:

```text
.env
```

locally and keep it out of Git.

Example `.gitignore`:

```gitignore
.env
.env.*
!.env.example
```

## 6. Environment Template

Commit a safe example file:

```text
.env.example
```

Example:

```env
NEBIUS_API_KEY=
NEBIUS_MODEL=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

GITHUB_TOKEN=
TAVILY_API_KEY=
```

No real credentials should appear in the example file.

## 7. Local Development

Developers can use a local `.env` file:

```text
.env
```

Example:

```env
NEBIUS_API_KEY=your_key_here
SUPABASE_URL=your_url_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

The file must remain untracked.

## 8. Production

Production secrets should be configured through the deployment platform's environment-variable/secret-management system.

Conceptually:

```text
GitHub
   │
   └── Source Code
        │
        ├── No Secrets
        │
        ▼
Deployment Platform
        │
        └── Inject Secrets
                ↓
           FastAPI Runtime
```

## 9. Secret Access

Only the components that need a secret should receive it.

Example:

```text
FastAPI
   │
   ├── NEBIUS_API_KEY ✓
   ├── GITHUB_TOKEN ✓
   ├── TAVILY_API_KEY ✓
   └── SUPABASE_SERVICE_ROLE_KEY ✓
```

But:

```text
Docker Sandbox
   │
   ├── NEBIUS_API_KEY ✗
   ├── GITHUB_TOKEN ✗
   ├── TAVILY_API_KEY ✗
   └── SUPABASE_SERVICE_ROLE_KEY ✗
```

Generated code should not inherit backend secrets.

## 10. Logging

Never log:

```text
API keys
Access tokens
Refresh tokens
Passwords
Service-role keys
Authorization headers
```

Bad:

```text
NEBIUS_API_KEY=sk-...
```

Good:

```text
Nebius request completed successfully
```

## 11. Error Messages

Errors returned to users should not expose secret values.

Instead of:

```text
Authentication failed using key sk-xxxxx...
```

return:

```text
The AI service authentication failed.
```

Detailed internal errors can be recorded securely without exposing credentials.

## 12. Secret Rotation

If a credential is exposed:

```text
1. Revoke the exposed credential
2. Generate a new credential
3. Update production environment
4. Remove the secret from source/history where necessary
5. Verify the affected integration
```

Never continue using a credential after confirmed exposure.

## 13. GitHub Security

GitHub integration credentials should:

- Use the minimum required permissions
- Be stored only on the backend
- Never be exposed to generated code
- Never be printed in logs

Prefer narrowly scoped credentials where supported.

## 14. Supabase Security

Use the correct key for each environment.

```text
Frontend
   ↓
Supabase Anon/Publishable Key
   ↓
RLS Policies
```

Server-side privileged operations:

```text
Backend
   ↓
Service Role Key
   ↓
Supabase
```

The service-role credential must never be sent to the browser.

## 15. Secret Checklist

Before deployment:

```text
[ ] .env is in .gitignore
[ ] No API keys in source code
[ ] No keys in README
[ ] No keys in Docker images
[ ] No secrets in frontend bundle
[ ] Backend secrets configured
[ ] Service-role key remains server-only
[ ] Logs do not expose credentials
[ ] GitHub token has appropriate permissions
[ ] Production secrets are separate from development secrets
```

## 16. Core Principle

```text
If the browser does not need a secret,
the browser should never receive it.
```

Kairo follows a server-side secret boundary so AI, GitHub, research, and database credentials remain protected.
