"""Safe integration-boundary tests for optional Supabase client setup."""

import sys
from types import ModuleType

import pytest

from app.core.config import Settings
from app.database.connection import create_supabase_client


def test_supabase_client_is_absent_when_both_settings_are_missing() -> None:
    settings = Settings(
        supabase_url=None,
        supabase_service_role_key=None,
        github_webhook_secret=None,
    )

    assert create_supabase_client(settings) is None


@pytest.mark.parametrize(
    ("url", "key"),
    [
        ("https://example.test", None),
        (None, "test-service-key"),
    ],
)
def test_supabase_client_rejects_partial_configuration(
    url: str | None, key: str | None
) -> None:
    settings = Settings(
        supabase_url=url,
        supabase_service_role_key=key,
        github_webhook_secret=None,
    )

    with pytest.raises(RuntimeError, match="must be configured together"):
        create_supabase_client(settings)


def test_supabase_client_uses_configured_credentials_without_network(
    monkeypatch,
) -> None:
    calls: list[tuple[str, str]] = []
    client = object()

    def create_client(url: str, key: str) -> object:
        calls.append((url, key))
        return client

    supabase_module = ModuleType("supabase")
    setattr(supabase_module, "create_client", create_client)
    monkeypatch.setitem(sys.modules, "supabase", supabase_module)
    settings = Settings(
        supabase_url="https://example.test",
        supabase_service_role_key="local-test-key",
        github_webhook_secret=None,
    )

    result = create_supabase_client(settings)

    assert result is client
    assert calls == [("https://example.test", "local-test-key")]
