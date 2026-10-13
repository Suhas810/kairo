"""Focused API route tests using in-memory external-service stubs."""

from types import SimpleNamespace
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, get_supabase_client
from app.main import app
from app.schemas.user import AuthenticatedUser

USER_ID = UUID("f3b276b8-377f-48ce-88e0-b8c93a16c86a")
OTHER_USER_ID = UUID("74a440b3-88d9-43ce-b6e4-15653fa18730")
PROJECT_ID = UUID("061f6320-e711-4074-9689-b762b63cf4f4")


class ProjectQuery:
    """Small query stub that applies the ownership filters used by the service."""

    def __init__(self, rows: list[dict]) -> None:
        self.rows = rows
        self.filters: dict[str, str] = {}

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, key: str, value: str):
        self.filters[key] = value
        return self

    def order(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    def execute(self):
        matching = [
            row
            for row in self.rows
            if all(str(row.get(key)) == value for key, value in self.filters.items())
        ]
        return SimpleNamespace(data=matching)


class SupabaseStub:
    def __init__(self, projects: list[dict]) -> None:
        self.projects = projects

    def table(self, name: str) -> ProjectQuery:
        assert name == "projects"
        return ProjectQuery(self.projects)


@pytest.fixture
def client():
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        id=USER_ID, email="user@example.test"
    )
    app.dependency_overrides[get_supabase_client] = lambda: SupabaseStub(
        [
            {
                "id": str(PROJECT_ID),
                "user_id": str(USER_ID),
                "name": "Owned project",
            }
        ]
    )
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_health_is_public_and_lightweight():
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "kairo-api"}


def test_missing_authentication_is_rejected():
    app.dependency_overrides.clear()
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"
    app.dependency_overrides.clear()


def test_invalid_supabase_token_is_rejected():
    class InvalidTokenError(Exception):
        status_code = 401

    class AuthStub:
        def get_user(self, _token):
            raise InvalidTokenError()

    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.clear()
    with TestClient(app) as test_client:
        app.state.supabase_client = SimpleNamespace(auth=AuthStub())
        response = test_client.get(
            "/api/v1/auth/me", headers={"Authorization": "Bearer invalid-token"}
        )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_ACCESS_TOKEN"
    app.state.supabase_client = None


def test_project_request_validation_rejects_blank_name(client):
    response = client.post("/api/v1/projects/", json={"name": "   "})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_REQUEST"


def test_project_access_is_scoped_to_authenticated_user(client):
    response = client.get(f"/api/v1/projects/{PROJECT_ID}")

    assert response.status_code == 200
    assert response.json()["user_id"] == str(USER_ID)

    app.dependency_overrides[get_supabase_client] = lambda: SupabaseStub(
        [
            {
                "id": str(PROJECT_ID),
                "user_id": str(OTHER_USER_ID),
                "name": "Private project",
            }
        ]
    )
    inaccessible = client.get(f"/api/v1/projects/{PROJECT_ID}")
    assert inaccessible.status_code == 404
    assert inaccessible.json()["error"]["code"] == "PROJECT_NOT_FOUND"


def test_agent_service_reports_not_configured_for_owned_project(client):
    response = client.post(
        "/api/v1/agents/tasks",
        json={"project_id": str(PROJECT_ID), "task": "Add a feature"},
    )

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "AGENT_NOT_CONFIGURED"
    assert response.json()["error"]["details"] == {"configured": False}


def test_execution_service_reports_not_configured_for_owned_project(client):
    response = client.post(
        "/api/v1/executions/", json={"project_id": str(PROJECT_ID)}
    )

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "EXECUTION_NOT_CONFIGURED"


def test_repository_integration_reports_not_configured_for_owned_project(client):
    response = client.post(
        "/api/v1/repositories/",
        json={
            "project_id": str(PROJECT_ID),
            "owner": "kairo",
            "repository": "sample",
        },
    )

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "GITHUB_NOT_CONFIGURED"


def test_invalid_github_webhook_signature_is_rejected(client, monkeypatch):
    monkeypatch.setenv("GITHUB_WEBHOOK_SECRET", "test-secret")
    response = client.post(
        "/api/v1/webhooks/github",
        content=b'{"zen":"Keep it logically awesome."}',
        headers={
            "X-GitHub-Event": "ping",
            "X-Hub-Signature-256": "sha256=" + "0" * 64,
        },
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_WEBHOOK_SIGNATURE"
