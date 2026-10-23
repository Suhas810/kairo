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
