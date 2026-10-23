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
