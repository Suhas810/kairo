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
