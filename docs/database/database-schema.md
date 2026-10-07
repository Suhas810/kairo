# Kairo — Database Schema

## 1. Overview

Kairo uses **Supabase** as its application database.

The database stores the persistent state required by the Kairo AI software-engineering agent:

- Users
- Projects
- Tasks
- Agent runs
- Agent events
- Artifacts
- Test results

```text
User
 │
 └── Projects
       │
       └── Tasks
             │
             └── Agent Runs
                    ├── Agent Events
                    ├── Artifacts
                    └── Test Results
```

Supabase provides the database layer; no separate database service is required for Kairo.

---

## 2. Database Architecture

```text
┌─────────────────────────────┐
│          Supabase           │
│                             │
│  ┌─────────┐   ┌─────────┐ │
│  │  users  │   │projects │ │
│  └────┬────┘   └────┬────┘ │
│       │              │      │
│       │              ▼      │
│       │           ┌───────┐ │
│       │           │ tasks │ │
│       │           └───┬───┘ │
│       │               │     │
│       │               ▼     │
│       │          ┌─────────┐│
│       │          │agent_   ││
│       │          │runs     ││
│       │          └────┬────┘│
│       │               │     │
│       │       ┌───────┼─────┤
│       │       ▼       ▼     │
│       │  ┌────────┐ ┌──────┐│
│       │  │events  │ │tests ││
│       │  └────────┘ └──────┘│
│       │               │     │
│       │               ▼     │
│       │          ┌─────────┐│
│       │          │artifacts││
│       │          └─────────┘│
└─────────────────────────────┘
```

---

## 3. Tables

Kairo initially uses the following tables:

```text
users
projects
tasks
agent_runs
agent_events
artifacts
test_results
```

---

# 4. Users

Stores application user information.

### Table

```text
users
```

### Columns

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| email | TEXT | User email |
| display_name | TEXT | User display name |
| avatar_url | TEXT | Optional avatar |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update |

### Relationship

```text
users
  │
  └── 1:N → projects
```

If Supabase Authentication is used, the application user should be associated with the Supabase Auth user ID.

---

# 5. Projects

Represents a software project managed by Kairo.

### Table

```text
projects
```

### Columns

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Project owner |
| name | TEXT | Project name |
| description | TEXT | Project description |
| repository_url | TEXT | GitHub repository |
| default_branch | TEXT | Default repository branch |
| language | TEXT | Primary project language |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

### Relationship

```text
users
  │
  └── 1:N → projects
```

---

# 6. Tasks

Represents an individual engineering request submitted to Kairo.

### Table

```text
tasks
```

### Columns

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| project_id | UUID | Related project |
| user_id | UUID | Task creator |
| title | TEXT | Task title |
| description | TEXT | Full task request |
| priority | TEXT | Task priority |
| status | TEXT | Task status |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

### Example Status Values

```text
pending
running
completed
failed
cancelled
```

### Relationship

```text
projects
  │
  └── 1:N → tasks
```

---

# 7. Agent Runs

Represents one complete Kairo execution attempt for a task.

### Table

```text
agent_runs
```

### Columns

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| task_id | UUID | Related task |
| project_id | UUID | Related project |
| status | TEXT | Current run status |
| current_stage | TEXT | Current agent stage |
| iteration_count | INTEGER | Debug iterations |
| plan | JSONB | Generated engineering plan |
| final_summary | TEXT | Final result summary |
| started_at | TIMESTAMP | Start time |
| completed_at | TIMESTAMP | Completion time |
| created_at | TIMESTAMP | Creation time |

### Status Values

```text
queued
planning
researching
implementing
executing
testing
debugging
reviewing
completed
failed
cancelled
```

### Relationship

```text
tasks
  │
  └── 1:N → agent_runs
```

---

# 8. Agent Events

Stores the timeline of agent activity.

### Table

```text
agent_events
```

### Columns

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| run_id | UUID | Related agent run |
| stage | TEXT | Agent stage |
| event_type | TEXT | Event type |
| status | TEXT | Event status |
| message | TEXT | Human-readable message |
| metadata | JSONB | Additional information |
| created_at | TIMESTAMP | Event time |

### Example

```json
{
  "stage": "testing",
  "event_type": "test_started",
  "status": "running",
  "message": "Running project tests"
}
```

### Example Timeline

```text
run_123
 │
 ├── planning started
 ├── planning completed
 ├── research started
 ├── research completed
 ├── coding started
 ├── coding completed
 ├── testing started
 ├── testing failed
 ├── debugging started
 ├── fix applied
 ├── testing started
 ├── testing passed
 └── review completed
```

---

# 9. Artifacts

Stores metadata about files or outputs generated during an agent run.

### Table

```text
artifacts
```

### Columns

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| run_id | UUID | Related agent run |
| file_path | TEXT | Project file path |
| artifact_type | TEXT | File/output type |
| action | TEXT | Created/modified/deleted |
| content_hash | TEXT | Optional file hash |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMP | Creation time |

### Artifact Actions

```text
created
modified
deleted
```

### Example

```text
run_123
 ├── app/routes/auth.py → created
 ├── app/models/user.py → modified
 └── tests/test_auth.py → created
```

---

# 10. Test Results

Stores test and validation results.

### Table

```text
test_results
```

### Columns

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| run_id | UUID | Related agent run |
| test_command | TEXT | Command executed |
| status | TEXT | Test status |
| tests_run | INTEGER | Number of tests |
| tests_passed | INTEGER | Passed tests |
| tests_failed | INTEGER | Failed tests |
| exit_code | INTEGER | Process exit code |
| stdout | TEXT | Standard output |
| stderr | TEXT | Error output |
| duration_ms | INTEGER | Execution duration |
| created_at | TIMESTAMP | Test time |

### Status Values

```text
passed
failed
error
timeout
```

---

# 11. Relationships

Complete relationship model:

```text
users
  │
  ├───────────────┐
  │               │
  ▼               ▼
projects        tasks
  │               │
  │               ▼
  │          agent_runs
  │               │
  │       ┌───────┼────────┐
  │       ▼       ▼        ▼
  │   events   artifacts  tests
  │
  └───────────────┘
```

More precisely:

```text
users
  │
  └── projects
        │
        └── tasks
              │
              └── agent_runs
                    │
                    ├── agent_events
                    ├── artifacts
                    └── test_results
```

---

# 12. Foreign Keys

Recommended relationships:

```text
projects.user_id
    → users.id

tasks.user_id
    → users.id

tasks.project_id
    → projects.id

agent_runs.task_id
    → tasks.id

agent_runs.project_id
    → projects.id

agent_events.run_id
    → agent_runs.id

artifacts.run_id
    → agent_runs.id

test_results.run_id
    → agent_runs.id
```

---

# 13. Recommended Indexes

Indexes should be added to frequently queried fields.

Recommended:

```text
projects.user_id
tasks.project_id
tasks.user_id
agent_runs.task_id
agent_runs.project_id
agent_runs.status
agent_events.run_id
agent_events.created_at
artifacts.run_id
test_results.run_id
```

For event timelines:

```text
(run_id, created_at)
```

is particularly useful.

---

# 14. Row Level Security

Supabase Row Level Security should be enabled for user-owned application data.

Conceptually:

```text
User A
  ↓
Can access
  ├── Own projects
  ├── Own tasks
  └── Own agent runs

Cannot access
  ├── User B projects
  ├── User B tasks
  └── User B runs
```

The exact policies should be implemented according to the authentication model used by the application.

---

# 15. Agent Run Persistence

During execution, the backend continuously updates the run.

Example:

```text
agent_runs
status = "testing"
current_stage = "testing"
iteration_count = 1
```

Events are then inserted:

```text
agent_events
 ├── testing started
 ├── test command executed
 └── testing failed
```

The frontend reads these records to display live progress.

---

# 16. Example Agent Run

A complete run might look like:

```text
Project
  │
  ▼
Task
  │
  ▼
Agent Run
  │
  ├── Plan
  │
  ├── Research Events
  │
  ├── Code Changes
  │
  ├── Test Result #1
  │      └── Failed
  │
  ├── Debug Event
  │
  ├── Code Changes
  │
  ├── Test Result #2
  │      └── Passed
  │
  └── Final Summary
```

---

# 17. Example Supabase Schema

Conceptual SQL:

```sql
create table projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    name text not null,
    description text,
    repository_url text,
    default_branch text default 'main',
    language text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table tasks (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id),
    user_id uuid not null,
    title text not null,
    description text not null,
    priority text default 'medium',
    status text default 'pending',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table agent_runs (
    id uuid primary key default gen_random_uuid(),
    task_id uuid not null references tasks(id),
    project_id uuid not null references projects(id),
    status text default 'queued',
    current_stage text,
    iteration_count integer default 0,
    plan jsonb,
    final_summary text,
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz default now()
);

create table agent_events (
    id uuid primary key default gen_random_uuid(),
    run_id uuid not null references agent_runs(id),
    stage text not null,
    event_type text not null,
    status text,
    message text,
    metadata jsonb,
    created_at timestamptz default now()
);

create table artifacts (
    id uuid primary key default gen_random_uuid(),
    run_id uuid not null references agent_runs(id),
    file_path text not null,
    artifact_type text,
    action text,
    content_hash text,
    metadata jsonb,
    created_at timestamptz default now()
);

create table test_results (
    id uuid primary key default gen_random_uuid(),
    run_id uuid not null references agent_runs(id),
    test_command text,
    status text,
    tests_run integer default 0,
    tests_passed integer default 0,
    tests_failed integer default 0,
    exit_code integer,
    stdout text,
    stderr text,
    duration_ms integer,
    created_at timestamptz default now()
);
```

The `users` table can either be an application profile table linked to Supabase Auth or be represented through the authenticated Supabase user identity.

---

# 18. Data Lifecycle

```text
User creates project
        ↓
Project stored
        ↓
User submits task
        ↓
Task stored
        ↓
Agent run created
        ↓
Agent events inserted
        ↓
Artifacts recorded
        ↓
Tests recorded
        ↓
Run completed
        ↓
Final summary stored
```

---

# 19. Database Design Principles

### Single database platform

Supabase is the application's database platform.

### Traceability

Every agent run should be traceable from task → run → events → artifacts → tests.

### Structured data

Use JSONB for flexible agent metadata while keeping frequently queried fields relational.

### Security

Use Supabase authentication and Row Level Security where applicable.

### Observability

Persist important agent events so a run can be reconstructed after completion.

### Simplicity

The hackathon version should avoid unnecessary database infrastructure.

---

# 20. Final Schema

```text
┌──────────────┐
│    users     │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│   projects   │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│    tasks     │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│    agent_runs    │
└──────┬───────────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│ agent_events │  │   artifacts  │
└──────────────┘  └──────────────┘
       │
       │
       ▼
┌──────────────┐
│ test_results │
└──────────────┘
```

This schema provides the persistence layer required for Kairo's project management, agent execution, event tracking, code artifacts, and testing workflow.
