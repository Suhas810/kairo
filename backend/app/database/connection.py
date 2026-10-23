"""Optional Supabase client construction."""

from typing import Any

from app.core.config import Settings


def create_supabase_client(settings: Settings) -> Any | None:
    """Create a server-side Supabase client when both credentials are configured."""
    url = settings.supabase_url
    key = settings.supabase_service_role_key
    if not url and not key:
        return None
    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together."
        )

    from supabase import create_client

    return create_client(url, key)
