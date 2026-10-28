"""Unit tests for existing settings and project service behavior."""

import asyncio
from uuid import UUID

import pytest
from fastapi import HTTPException

from app.core.config import get_settings
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.project_service import (
    create_project,
    delete_project,
    get_owned_project,
    list_projects,
    update_project,
)
from tests.conftest import ProjectClientStub


def test_settings_read_environment_values_without_caching(monkeypatch) -> None:
    monkeypatch.setenv("SUPABASE_URL", "https://example.test")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "test-key")
    monkeypatch.setenv("GITHUB_WEBHOOK_SECRET", "webhook-test-secret")

    settings = get_settings()

    assert settings.supabase_url == "https://example.test"
    assert settings.supabase_service_role_key == "test-key"
    assert settings.github_webhook_secret == "webhook-test-secret"


def test_settings_allow_missing_optional_integrations(monkeypatch) -> None:
    for name in (
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "GITHUB_WEBHOOK_SECRET",
    ):
        monkeypatch.delenv(name, raising=False)

    settings = get_settings()

    assert settings.supabase_url is None
    assert settings.supabase_service_role_key is None
    assert settings.github_webhook_secret is None


def test_list_projects_scopes_results_to_the_authenticated_owner(
    project_client: ProjectClientStub, project_ids: tuple[UUID, UUID, UUID, UUID]
) -> None:
    user_id = project_ids[0]

    projects = asyncio.run(list_projects(project_client, user_id))

    assert [project["name"] for project in projects] == ["Owned project"]


def test_create_project_uses_authenticated_owner(
    project_client: ProjectClientStub, project_ids: tuple[UUID, UUID, UUID, UUID]
) -> None:
    user_id = project_ids[0]

    created = asyncio.run(
        create_project(
            project_client,
            user_id,
            ProjectCreate(name="  New project  ", description="Test project"),
        )
    )

    assert created["name"] == "New project"
    assert created["user_id"] == str(user_id)


def test_get_owned_project_does_not_return_another_users_project(
    project_client: ProjectClientStub, project_ids: tuple[UUID, UUID, UUID, UUID]
) -> None:
    user_id, _other_user_id, _project_id, other_project_id = project_ids

    with pytest.raises(HTTPException) as error:
        asyncio.run(get_owned_project(project_client, other_project_id, user_id))

    assert error.value.status_code == 404
    assert error.value.detail["code"] == "PROJECT_NOT_FOUND"


def test_update_project_changes_only_the_authenticated_users_project(
    project_client: ProjectClientStub, project_ids: tuple[UUID, UUID, UUID, UUID]
) -> None:
    user_id, _other_user_id, project_id, other_project_id = project_ids

    updated = asyncio.run(
        update_project(
            project_client,
            project_id,
            user_id,
            ProjectUpdate(name="Renamed project"),
        )
    )

    assert updated["name"] == "Renamed project"
    with pytest.raises(HTTPException) as error:
        asyncio.run(
            update_project(
                project_client,
                other_project_id,
                user_id,
                ProjectUpdate(name="Unauthorized change"),
            )
        )
    assert error.value.status_code == 404


def test_delete_project_removes_only_the_authenticated_users_project(
    project_client: ProjectClientStub, project_ids: tuple[UUID, UUID, UUID, UUID]
) -> None:
    user_id, _other_user_id, project_id, other_project_id = project_ids

    asyncio.run(delete_project(project_client, project_id, user_id))

    assert all(row["id"] != str(project_id) for row in project_client.rows)
    assert any(row["id"] == str(other_project_id) for row in project_client.rows)
