# Kairo Authentication & Authorization

## Architecture

Kairo utilizes Supabase Auth as the single source of truth for identity management.

1. **Client Authentication**:
   - The React frontend handles user sign-up, sign-in, and password resets directly through the Supabase client or demo session provider.
   - When authenticated, an access token (JWT) is issued to the client.

2. **Backend Token Verification**:
   - Every protected route injects `current_user: AuthenticatedUser = Depends(get_current_user)`.
   - The token is validated using `client.auth.get_user(credentials.credentials)` in a non-blocking threadpool.
   - The user ID is parsed and verified as a valid UUID.
   - If invalid or expired, the backend returns HTTP 401 `INVALID_ACCESS_TOKEN`.
   - Never trust a `user_id` supplied in the request body.

3. **Database Authorization (Row Level Security)**:
   - RLS is enabled on all PostgreSQL application tables (`users`, `projects`, `repositories`, `tasks`, `agent_sessions`, `executions`, `activity_logs`).
   - Project ownership policies enforce `USING (user_id = auth.uid())` and child table policies enforce `WHERE project.user_id = auth.uid()`.
   - The backend uses the `SUPABASE_SERVICE_ROLE_KEY` exclusively server-side to coordinate cross-entity background operations after verifying owner rights in application logic.

