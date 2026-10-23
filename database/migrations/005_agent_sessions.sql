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
