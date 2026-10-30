# Kairo Deployment Guide

## Production Architecture

- **Frontend**: Deployed to Vercel or Nebius Static Hosting.
- **Backend**: Containerized FastAPI service running on Nebius AI Cloud or Docker container host.
- **Persistence**: Supabase Managed PostgreSQL with Row Level Security.
- **Model Inference**: Nebius Token Factory or NVIDIA API.

## Container Build

The backend includes a production Dockerfile in `backend/Dockerfile`:

```powershell
cd backend
docker build -t kairo-backend:latest .
```

To run the container:
```powershell
docker run -d \
  -p 8000:8000 \
  -e APP_ENV=production \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  -e NVIDIA_API_KEY=your-nvidia-key \
  --name kairo-backend \
  kairo-backend:latest
```

## Database Migrations in Production

Apply the SQL migration files in `database/migrations/` sequentially:
1. `001_users.sql`
2. `002_projects.sql`
3. `003_repositories.sql`
4. `004_tasks.sql`
5. `005_agent_sessions.sql`
6. `006_executions.sql`
7. `007_activity_logs.sql`
8. `008_user_preferences_and_execution_policies.sql`

Or apply `database/schema.sql` once on initial project provisioning.

