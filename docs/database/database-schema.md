# Kairo database schema

Kairo uses Supabase PostgreSQL for persistent application data and Supabase Auth
for identity. The executable source of truth is the ordered migration set in
[`database/migrations/`](../../database/migrations/); [`database/schema.sql`](../../database/schema.sql)
is a consolidated, standalone representation of the same schema.

## Tables and relationships

```text
auth.users
└── users                         profile (one-to-one)
└── projects                      owner (one-to-many)
    ├── repositories              connections (one-to-many)
    ├── tasks                      created by project owner
    │   └── agent_sessions         optional task association
    └── agent_sessions             owner and project association
        └── executions             one-to-many
    └── activity_logs              project audit entries
```

| Table | Purpose and important fields |
|---|---|
| `users` | Profile keyed by `auth.users.id`; optional unique username, display name, avatar URL, and bio. A trigger creates it after Auth user creation. |
| `projects` | `user_id` owner, name, description, status, configuration, and the existing backend-compatible `repository_url`, `default_branch`, and `language` fields. |
| `repositories` | Project-linked provider, repository URL, branch, and non-secret JSON metadata. It deliberately has no credential/token column. |
| `tasks` | Project and owner-linked work item with title, description, status, priority, task type, and JSON metadata. |
| `agent_sessions` | Project and owner-linked lifecycle record, optional task, model metadata, and lifecycle timestamps. |
| `executions` | Session-linked status, structured step metadata, exit code, timestamps, and an output reference. Does not store raw command strings or output. |
| `activity_logs` | Append-only audit events with optional project/actor/entity references, action, metadata, and timestamp. |

UUID primary keys, foreign keys, status/length/JSON checks, useful lookup
indexes, and `updated_at` triggers are defined in the corresponding numbered
migrations. Foreign keys cascade project-owned operational data when a project
is deleted. Profile rows cascade with their Auth identity. Activity records
retain their audit row when a project or actor is deleted, with the relevant
reference set to null.

## Authorization

RLS is enabled for every application table:

- Profiles can be read or updated only by their matching Auth user.
- Projects can be read and managed only by their owner.
- Repositories, tasks, sessions, executions, and project activity are scoped to
  the owning project. Composite foreign keys also prevent attaching a task or
  session to a different owner's project.
- Authenticated clients cannot write executions or activity logs. Trusted
  backend services can write these records with the service role, which bypasses
  RLS; those services must perform explicit owner authorization first.
- Project membership is not implemented. Add a membership table and update
  child-table policies before enabling collaboration.

Service-role credentials must remain on the backend and must never be exposed to
the browser. Repository OAuth credentials belong in a managed secret store, not
in PostgreSQL metadata. Execution output should live in private storage with
separate Storage RLS policies; database output references are not themselves
authorization checks. Treat agent-generated data and output as untrusted and
continue to run code only in the isolated sandbox.

## Edge Functions and API ownership

The existing FastAPI service already owns the API surface and validates
Supabase-authenticated callers. No Edge Functions are added: duplicating project
or lifecycle operations would create a second authorization implementation.
Repository OAuth and isolated execution are explicitly unavailable in the
current backend until their integrations are configured.

## Apply and seed

Apply `001_users.sql` through `007_activity_logs.sql` in numerical order, or
apply `database/schema.sql` once to a fresh Supabase database. Do not apply both
paths as separate schema installs. The migrations assume Supabase's `auth`
schema and `authenticated` role.

For development fixtures, create and confirm a test account through Supabase
Auth with the email `kairo-dev@example.test`, apply the schema, then execute
[`database/seed.sql`](../../database/seed.sql). The seed fails clearly if the
Auth identity does not exist; it never inserts arbitrary rows into
`auth.users`. Never run the seed on production. See
[`database/README.md`](../../database/README.md) for setup and credential
handling.

## Validation status

The migration SQL is ordered by dependencies and designed for repeatable
application (`IF NOT EXISTS`, replaceable functions, and recreated named
triggers/policies). The repository currently has no Supabase CLI, PostgreSQL
client, or local Supabase configuration, so database execution and live RLS
tests require a configured Supabase development project. Backend tests can be
run independently with `pytest` from `backend/`.
