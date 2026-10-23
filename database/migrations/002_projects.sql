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
