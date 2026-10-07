# Kairo — Sandbox Security

## 1. Purpose

Kairo executes AI-generated and user-requested code. Because generated code can contain bugs or unsafe operations, it must never execute directly inside the main FastAPI application process.

Kairo uses an isolated execution environment based on Docker.

```text
User Task
   ↓
Kairo Agent
   ↓
Generated Code
   ↓
Execution Manager
   ↓
Docker Sandbox
   ↓
Execution Result
```

## 2. Security Boundary

The primary security boundary is:

```text
┌─────────────────────────────────────┐
│          Kairo Backend              │
│                                     │
│ FastAPI + Agent Orchestrator        │
└──────────────────┬──────────────────┘
                   │
                   │ Controlled request
                   ▼
┌─────────────────────────────────────┐
│          Docker Sandbox             │
│                                     │
│ Generated Code                      │
│ Dependencies                         │
│ Tests                                │
│ Build Commands                       │
└──────────────────┬──────────────────┘
                   │
                   ▼
              Output Only
```

The sandbox should return execution results rather than allowing arbitrary access to the host system.

## 3. Container Isolation

Each execution should use a dedicated container or isolated workspace.

Recommended lifecycle:

```text
Create Container
      ↓
Prepare Workspace
      ↓
Copy Project Files
      ↓
Install Dependencies
      ↓
Run Command
      ↓
Capture Output
      ↓
Destroy Container
```

Containers should not be reused across unrelated user runs unless the isolation model explicitly supports secure workspace separation.

## 4. Resource Limits

Every execution should have limits.

Recommended controls:

- CPU limit
- Memory limit
- Process limit
- Execution timeout
- Disk/storage limit
- Output-size limit

Example:

```text
Execution
 ├── CPU limit
 ├── Memory limit
 ├── Process limit
 ├── Time limit
 └── Output limit
```

This reduces the risk of resource exhaustion.

## 5. Execution Timeout

Commands must have a maximum execution time.

Example:

```text
Command starts
     ↓
Timer starts
     ↓
Command completes
     OR
Timeout reached
     ↓
Container terminated
```

A timeout should result in a structured failure:

```json
{
  "status": "timeout",
  "message": "Execution exceeded the allowed time."
}
```

## 6. Filesystem Isolation

Generated code should only access its assigned workspace.

The sandbox should not provide unrestricted access to:

- Host filesystem
- Backend source code
- System configuration
- Other user workspaces
- Private application files

Workspace example:

```text
/container/workspace/
├── src/
├── tests/
├── package.json
└── ...
```

## 7. Network Access

Network access should be restricted.

Default principle:

```text
Sandbox
   │
   ├── No unnecessary network access
   │
   └── Allow only explicitly required services
```

If dependency installation requires network access, it should be controlled and limited.

The sandbox must never receive private service credentials simply because the code is running inside the container.

## 8. Environment Variables

Do not pass the backend's secret environment directly into generated code.

Never expose:

```text
NEBIUS_API_KEY
GITHUB_TOKEN
TAVILY_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

to untrusted code.

If a task requires an external API, use a controlled backend tool rather than exposing raw credentials.

## 9. Command Restrictions

The execution manager should validate commands before execution where practical.

Potentially dangerous operations should be restricted according to the sandbox environment.

Examples requiring strong controls:

```text
privileged commands
host filesystem access
container management
network scanning
credential access
system configuration changes
```

## 10. Process Isolation

The sandbox should prevent generated programs from controlling the host process environment.

The execution environment should avoid:

- Privileged containers
- Host PID namespace
- Host network namespace
- Host filesystem mounts
- Docker socket exposure

In particular:

```text
DO NOT mount:
 /var/run/docker.sock
```

into an untrusted execution container.

## 11. Dependency Installation

Dependencies should be installed inside the sandbox.

```text
Project
   ↓
Docker Workspace
   ↓
Dependency Installation
   ↓
Application/Test Execution
```

Dependency caches, if introduced later, must be isolated and carefully managed.

## 12. Output Handling

stdout and stderr should be captured and size-limited.

```text
Program
  ├── stdout → Result
  └── stderr → Result
```

Very large output should be truncated rather than allowed to consume unlimited backend memory.

## 13. Cleanup

After execution:

```text
Stop Process
   ↓
Destroy Container
   ↓
Remove Temporary Workspace
   ↓
Release Resources
```

Cleanup should also happen when execution fails or times out.

## 14. Security Events

The backend should record security-relevant events such as:

- Container creation
- Execution timeout
- Resource limit exceeded
- Blocked operation
- Container failure
- Forced termination

Do not store sensitive secrets in these logs.

## 15. Defense in Depth

Sandboxing should not be treated as the only security mechanism.

Kairo should use multiple layers:

```text
Authentication
      ↓
Authorization
      ↓
Backend Validation
      ↓
Agent Tool Restrictions
      ↓
Docker Isolation
      ↓
Resource Limits
      ↓
Timeouts
      ↓
Output Limits
```

## 16. Hackathon Implementation

For the initial Kairo version, prioritize:

1. Docker isolation
2. Non-privileged containers
3. Execution timeout
4. CPU/memory limits
5. Restricted filesystem
6. No backend secrets inside containers
7. Container cleanup
8. Output limits

The security architecture can later be strengthened with dedicated execution workers and stronger container/runtime isolation.
