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
