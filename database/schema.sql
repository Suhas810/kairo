-- Consolidated Kairo schema. Generated from database/migrations in dependency order.
-- Apply this file OR the individual migrations, not both.

-- Source: migrations/001_users.sql
-- User profiles mirror identities managed by Supabase Auth.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT CHECK (display_name IS NULL OR char_length(display_name) <= 120),
    avatar_url TEXT,
    bio TEXT CHECK (bio IS NULL OR char_length(bio) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT users_username_format CHECK (
        username IS NULL OR username ~ '^[A-Za-z0-9_]{3,32}$'
    )
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.users (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        NULLIF(NEW.raw_user_meta_data ->> 'display_name', ''),
        NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_set_updated_at ON public.users;
CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own ON public.users
    FOR SELECT TO authenticated
    USING (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
    FOR UPDATE TO authenticated
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

-- Source: migrations/002_projects.sql
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    name TEXT NOT NULL
        CHECK (char_length(name) BETWEEN 1 AND 120 AND btrim(name) <> ''),
    description TEXT CHECK (description IS NULL OR char_length(description) <= 4000),
    repository_url TEXT CHECK (
        repository_url IS NULL
        OR (char_length(repository_url) <= 2048 AND btrim(repository_url) <> '')
    ),
    default_branch TEXT CHECK (
        default_branch IS NULL OR char_length(default_branch) <= 255
    ),
    language TEXT CHECK (language IS NULL OR char_length(language) <= 100),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'archived')),
    configuration JSONB NOT NULL DEFAULT '{}'::JSONB
        CHECK (jsonb_typeof(configuration) = 'object'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT projects_id_user_id_unique UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS projects_user_updated_at_idx
    ON public.projects (user_id, updated_at DESC);

DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS projects_select_own ON public.projects;
CREATE POLICY projects_select_own ON public.projects
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS projects_insert_own ON public.projects;
CREATE POLICY projects_insert_own ON public.projects
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS projects_update_own ON public.projects;
CREATE POLICY projects_update_own ON public.projects
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS projects_delete_own ON public.projects;
CREATE POLICY projects_delete_own ON public.projects
    FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- Source: migrations/003_repositories.sql
CREATE TABLE IF NOT EXISTS public.repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('github', 'gitlab', 'bitbucket')),
    repository_url TEXT NOT NULL
        CHECK (char_length(repository_url) BETWEEN 1 AND 2048 AND btrim(repository_url) <> ''),
    default_branch TEXT NOT NULL DEFAULT 'main'
        CHECK (char_length(default_branch) BETWEEN 1 AND 255 AND btrim(default_branch) <> ''),
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB
        CHECK (jsonb_typeof(metadata) = 'object'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT repositories_project_url_unique UNIQUE (project_id, repository_url)
);

DROP TRIGGER IF EXISTS repositories_set_updated_at ON public.repositories;
CREATE TRIGGER repositories_set_updated_at
    BEFORE UPDATE ON public.repositories
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS repositories_select_project_owner ON public.repositories;
CREATE POLICY repositories_select_project_owner ON public.repositories
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.projects AS p
            WHERE p.id = repositories.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS repositories_insert_project_owner ON public.repositories;
CREATE POLICY repositories_insert_project_owner ON public.repositories
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.projects AS p
            WHERE p.id = repositories.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS repositories_update_project_owner ON public.repositories;
CREATE POLICY repositories_update_project_owner ON public.repositories
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.projects AS p
            WHERE p.id = repositories.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.projects AS p
            WHERE p.id = repositories.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS repositories_delete_project_owner ON public.repositories;
CREATE POLICY repositories_delete_project_owner ON public.repositories
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.projects AS p
            WHERE p.id = repositories.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    );

-- Source: migrations/004_tasks.sql
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    title TEXT NOT NULL
        CHECK (char_length(title) BETWEEN 1 AND 300 AND btrim(title) <> ''),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    task_type TEXT NOT NULL DEFAULT 'other'
        CHECK (task_type IN ('bug_fix', 'feature', 'refactor', 'documentation', 'test', 'other')),
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB
        CHECK (jsonb_typeof(metadata) = 'object'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT tasks_project_owner_fk
        FOREIGN KEY (project_id, user_id)
        REFERENCES public.projects (id, user_id) ON DELETE CASCADE,
    CONSTRAINT tasks_id_project_unique UNIQUE (id, project_id)
);

CREATE INDEX IF NOT EXISTS tasks_project_status_created_idx
    ON public.tasks (project_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks (user_id);

DROP TRIGGER IF EXISTS tasks_set_updated_at ON public.tasks;
CREATE TRIGGER tasks_set_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tasks_select_project_owner ON public.tasks;
CREATE POLICY tasks_select_project_owner ON public.tasks
    FOR SELECT TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = tasks.project_id AND p.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS tasks_insert_project_owner ON public.tasks;
CREATE POLICY tasks_insert_project_owner ON public.tasks
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = tasks.project_id AND p.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS tasks_update_project_owner ON public.tasks;
CREATE POLICY tasks_update_project_owner ON public.tasks
    FOR UPDATE TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = tasks.project_id AND p.user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = tasks.project_id AND p.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS tasks_delete_project_owner ON public.tasks;
CREATE POLICY tasks_delete_project_owner ON public.tasks
    FOR DELETE TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = tasks.project_id AND p.user_id = (SELECT auth.uid())
        )
    );

-- Source: migrations/005_agent_sessions.sql
CREATE TABLE IF NOT EXISTS public.agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    task_id UUID,
    status TEXT NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    model_provider TEXT,
    model_name TEXT,
    model_metadata JSONB NOT NULL DEFAULT '{}'::JSONB
        CHECK (jsonb_typeof(model_metadata) = 'object'),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT agent_sessions_project_owner_fk
        FOREIGN KEY (project_id, user_id)
        REFERENCES public.projects (id, user_id) ON DELETE CASCADE,
    CONSTRAINT agent_sessions_task_project_fk
        FOREIGN KEY (task_id, project_id)
        REFERENCES public.tasks (id, project_id) ON DELETE CASCADE,
    CONSTRAINT agent_sessions_id_project_owner_unique
        UNIQUE (id, project_id, user_id),
    CONSTRAINT agent_sessions_time_order
        CHECK (started_at IS NULL OR completed_at IS NULL OR completed_at >= started_at)
);

CREATE INDEX IF NOT EXISTS agent_sessions_project_created_idx
    ON public.agent_sessions (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_sessions_task_id_idx
    ON public.agent_sessions (task_id);
CREATE INDEX IF NOT EXISTS agent_sessions_user_id_idx
    ON public.agent_sessions (user_id);

DROP TRIGGER IF EXISTS agent_sessions_set_updated_at ON public.agent_sessions;
CREATE TRIGGER agent_sessions_set_updated_at
    BEFORE UPDATE ON public.agent_sessions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_sessions_select_project_owner ON public.agent_sessions;
CREATE POLICY agent_sessions_select_project_owner ON public.agent_sessions
    FOR SELECT TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = agent_sessions.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS agent_sessions_insert_project_owner ON public.agent_sessions;
CREATE POLICY agent_sessions_insert_project_owner ON public.agent_sessions
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = agent_sessions.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS agent_sessions_update_project_owner ON public.agent_sessions;
CREATE POLICY agent_sessions_update_project_owner ON public.agent_sessions
    FOR UPDATE TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = agent_sessions.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = agent_sessions.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    );
DROP POLICY IF EXISTS agent_sessions_delete_project_owner ON public.agent_sessions;
CREATE POLICY agent_sessions_delete_project_owner ON public.agent_sessions
    FOR DELETE TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = agent_sessions.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    );

-- Source: migrations/006_executions.sql
CREATE TABLE IF NOT EXISTS public.executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled', 'timed_out')),
    step_metadata JSONB NOT NULL DEFAULT '[]'::JSONB
        CHECK (jsonb_typeof(step_metadata) IN ('array', 'object')),
    output_reference TEXT,
    exit_code INTEGER,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT executions_session_owner_fk
        FOREIGN KEY (session_id, project_id, user_id)
        REFERENCES public.agent_sessions (id, project_id, user_id) ON DELETE CASCADE,
    CONSTRAINT executions_time_order
        CHECK (started_at IS NULL OR ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX IF NOT EXISTS executions_session_created_idx
    ON public.executions (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS executions_project_status_created_idx
    ON public.executions (project_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS executions_user_id_idx ON public.executions (user_id);

DROP TRIGGER IF EXISTS executions_set_updated_at ON public.executions;
CREATE TRIGGER executions_set_updated_at
    BEFORE UPDATE ON public.executions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS executions_select_project_owner ON public.executions;
CREATE POLICY executions_select_project_owner ON public.executions
    FOR SELECT TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = executions.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    );

-- Source: migrations/007_activity_logs.sql
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL DEFAULT 'user'
        CHECK (actor_type IN ('user', 'system')),
    entity_type TEXT,
    entity_id UUID,
    action TEXT NOT NULL
        CHECK (char_length(action) BETWEEN 1 AND 120 AND btrim(action) <> ''),
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB
        CHECK (jsonb_typeof(metadata) = 'object'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_logs_project_created_idx
    ON public.activity_logs (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_actor_created_idx
    ON public.activity_logs (actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_entity_idx
    ON public.activity_logs (entity_type, entity_id);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS activity_logs_select_project_owner ON public.activity_logs;
CREATE POLICY activity_logs_select_project_owner ON public.activity_logs
    FOR SELECT TO authenticated
    USING (
        project_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = activity_logs.project_id
              AND p.user_id = (SELECT auth.uid())
        )
    );