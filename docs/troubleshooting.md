# Kairo Troubleshooting Guide

### 1. `SUPABASE_NOT_CONFIGURED` (HTTP 503)
- **Cause**: Backend was launched without `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- **Resolution**: Provide both variables in `backend/.env` or system environment. Health checks will work without Supabase, but authenticated routes require it.

### 2. `AGENT_NOT_CONFIGURED` (HTTP 503)
- **Cause**: NVIDIA AI provider is not configured.
- **Resolution**: Obtain an API key from NVIDIA Build (`https://build.nvidia.com/`) or Nebius Token Factory, and set `NVIDIA_API_KEY` in `backend/.env`.

### 3. `EXECUTION_NOT_CONFIGURED` (HTTP 503)
- **Cause**: Neither Docker daemon nor `EXECUTION_ENABLED=true` is set.
- **Resolution**: Start Docker Desktop, or set `EXECUTION_ENABLED=true` and `SANDBOX_FALLBACK_LOCAL=true` in `backend/.env` for local process runner fallback.

### 4. `INVALID_ACCESS_TOKEN` (HTTP 401)
- **Cause**: Expired or forged Supabase JWT token.
- **Resolution**: Sign in again to refresh your session. In development demo mode without Supabase Auth, client mock tokens are allowed if `APP_ENV=development`.

### 5. `PATH_TRAVERSAL_DETECTED` (HTTP 400)
- **Cause**: Request contained `..` or absolute paths.
- **Resolution**: Only clean, relative POSIX paths (e.g. `src/utils/math.py`) are accepted.

