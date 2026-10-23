"""Environment-backed application settings."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    """Backend settings; all credentials are read from environment variables."""

    supabase_url: str | None
    supabase_service_role_key: str | None
    github_webhook_secret: str | None


def get_settings() -> Settings:
    """Read settings without caching so runtime configuration remains testable."""
    return Settings(
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        github_webhook_secret=os.getenv("GITHUB_WEBHOOK_SECRET"),
    )
