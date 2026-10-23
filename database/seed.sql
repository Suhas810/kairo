-- Development fixtures only. Create and confirm this account through Supabase Auth
-- before running the seed; this script never inserts into auth.users.
DO $$
DECLARE
    fixture_user_id UUID;
    fixture_project_id CONSTANT UUID := 'a4c38808-e553-4ef1-bcf1-5886243c897e';
    fixture_task_id CONSTANT UUID := 'e12cac99-f597-48bd-99f4-4b88dd242e0b';
    fixture_session_id CONSTANT UUID := '80824601-6ab6-4dd7-aaac-e173c88abf45';
    fixture_execution_id CONSTANT UUID := 'eb4f2c33-bcb7-4c95-a996-f6a4573f1327';
BEGIN
    SELECT id INTO fixture_user_id
    FROM auth.users
    WHERE email = 'kairo-dev@example.test'
    LIMIT 1;

    IF fixture_user_id IS NULL THEN
        RAISE EXCEPTION
            'Create and confirm kairo-dev@example.test through Supabase Auth before running database/seed.sql';
    END IF;

    INSERT INTO public.projects (id, user_id, name, description, repository_url, default_branch, language)
    VALUES (
        fixture_project_id,
        fixture_user_id,
        'Kairo Development Fixture',
        'Development-only sample project.',
        'https://github.com/example/kairo-development-fixture',
        'main',
        'Python'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.repositories (project_id, provider, repository_url, default_branch, metadata)
    VALUES (
        fixture_project_id,
        'github',
        'https://github.com/example/kairo-development-fixture',
        'main',
        '{"fixture": true}'::JSONB
    )
    ON CONFLICT (project_id, repository_url) DO NOTHING;

    INSERT INTO public.tasks (id, project_id, user_id, title, description, priority, task_type, metadata)
    VALUES (
        fixture_task_id,
        fixture_project_id,
        fixture_user_id,
        'Review the sample project setup',
        'A harmless development fixture task.',
        'normal',
        'documentation',
        '{"fixture": true}'::JSONB
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.agent_sessions (id, project_id, user_id, task_id, status, model_provider, model_name, model_metadata)
    VALUES (
        fixture_session_id,
        fixture_project_id,
        fixture_user_id,
        fixture_task_id,
        'completed',
        'fixture',
        'not-a-real-model',
        '{"fixture": true}'::JSONB
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.executions (
        id, session_id, project_id, user_id, status, step_metadata,
        output_reference, exit_code
    )
    VALUES (
        fixture_execution_id,
        fixture_session_id,
        fixture_project_id,
        fixture_user_id,
        'completed',
        '[{"name":"fixture-check","status":"completed"}]'::JSONB,
        'dev-fixtures/execution-output/sample.txt',
        0
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.activity_logs (
        project_id, actor_user_id, actor_type, entity_type, entity_id, action, metadata
    )
    SELECT
        fixture_project_id,
        fixture_user_id,
        'user',
        'task',
        fixture_task_id,
        'development_fixture_created',
        '{"fixture": true}'::JSONB
    WHERE NOT EXISTS (
        SELECT 1 FROM public.activity_logs
        WHERE project_id = fixture_project_id
          AND entity_id = fixture_task_id
          AND action = 'development_fixture_created'
    );
END;
$$;
