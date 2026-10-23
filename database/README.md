# Kairo database

Supabase PostgreSQL is Kairo's persistence layer. Apply the numbered SQL files in
`migrations/` in order to a Supabase project, or apply `schema.sql` once to a new
project. `schema.sql` is the consolidated form of the numbered migrations; do not
apply it after the migrations as a separate migration. The SQL uses Supabase's
`auth` schema and roles.

No Edge Functions are defined here: the existing FastAPI backend owns project,
authentication, repository, agent, and execution API routes. Repository OAuth
and isolated execution routes currently return an explicit unavailable response
until those integrations are implemented. Keeping these operations in FastAPI
avoids duplicating authorization and lifecycle logic in Edge Functions.

## Development fixtures

1. Create a Supabase development project and configure the backend with
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The service-role key is
   server-only; never put it in frontend configuration or commit it.
2. Create and confirm a user through Supabase Auth (for example, using the
   Supabase dashboard's Authentication > Users flow) with the email
   `kairo-dev@example.test`. The profile row is created by the Auth trigger.
3. Apply the migrations, then run `seed.sql` in the development database.

The seed script refuses to create or assume an Auth user. It inserts only
development fixture records and uses fixed fixture IDs so repeated runs do not
duplicate them. Never run it against production data.

## Security and integration

- RLS is enabled on every application table. Current authorization is
  project-owner-only; collaboration should add a project-members table and
  replace owner checks in child-table policies with membership checks.
- Executions and activity logs are read-only to `authenticated` clients. Write
  them from trusted backend code using the server-side service role, after
  checking the caller's project ownership. Service-role clients bypass RLS.
- Repository credentials are intentionally absent from these tables. Store
  OAuth tokens in a managed secret store and persist only non-secret repository
  metadata. Never write tokens into JSON metadata.
- Executions store step metadata and an output reference, not raw stdout/stderr
  or executable command strings. Treat step metadata and referenced output as
  untrusted; store output in a private Storage bucket with its own owner-based
  policies and keep code execution inside the isolated sandbox.
- The existing backend uses `projects.user_id`, `repository_url`,
  `default_branch`, and `language`; the schema retains those project fields.
  Authenticated IDs must always come from validated Supabase tokens, never from
  request payloads.

See [the database schema guide](../docs/database/database-schema.md) for table
relationships, migration details, and validation notes.
