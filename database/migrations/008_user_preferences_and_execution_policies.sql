-- Migration 008: Add user preferences, execution policies, and task associations

-- 1. Add preferences JSONB to public.users if not present
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::JSONB;

-- 2. Add task_id, logs, test_results, and diff_summary to public.executions
ALTER TABLE public.executions
    ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS logs JSONB NOT NULL DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS test_results JSONB NOT NULL DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS diff_summary TEXT;

-- 3. Execution policies for authenticated users
DROP POLICY IF EXISTS executions_insert_project_owner ON public.executions;
CREATE POLICY executions_insert_project_owner ON public.executions
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = executions.project_id AND p.user_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS executions_update_project_owner ON public.executions;
CREATE POLICY executions_update_project_owner ON public.executions
    FOR UPDATE TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = executions.project_id AND p.user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = executions.project_id AND p.user_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS executions_delete_project_owner ON public.executions;
CREATE POLICY executions_delete_project_owner ON public.executions
    FOR DELETE TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.projects AS p
            WHERE p.id = executions.project_id AND p.user_id = (SELECT auth.uid())
        )
    );

