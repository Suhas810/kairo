# Kairo Security Architecture

## Threat Model and Controls

Kairo operates on untrusted user instructions and generates arbitrary code modifications. Therefore, security isolation is enforced at every layer.

### 1. Code Execution Sandbox Isolation
- Disposable Docker containers are used for code execution.
- Containers drop all Linux capabilities (`--cap-drop=ALL`).
- Root filesystem is mounted read-only (`--read-only`).
- Runs as an unprivileged user (`--user 10001:10001`).
- Temporary filesystem (`tmpfs`) is restricted with `noexec,nosuid,nodev`.
- Outbound network mode is set to `none` by default.
- Process IDs, CPU shares, memory caps, and disk limits are strictly bounded.
- Strict timeout enforcement guarantees processes are terminated after deadlines.
- Host filesystems and Docker socket (`docker.sock`) are never exposed to containers.

### 2. Path Traversal & File Access
- All user-supplied and agent-generated paths are validated with `validate_safe_relative_path()`.
- Rejects absolute paths, backslashes, null bytes, and traversal components (`..`, `.`).
- File sizes are capped at 1 MB per file and 4 MB combined per execution.

### 3. Credential Protection
- Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `NVIDIA_API_KEY`, `GITHUB_WEBHOOK_SECRET`) exist only on the backend.
- Structured loggers sanitize tokens, authorization headers, and API keys automatically.
- No secrets are exposed in OpenAPI schemas or responses.

### 4. Row Level Security & Ownership Validation
- Every database read/write enforces ownership through Supabase RLS and application-layer foreign-key constraints.
- Users cannot access or modify projects, repositories, tasks, or executions belonging to other users.

