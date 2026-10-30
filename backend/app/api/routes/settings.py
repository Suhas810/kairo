"""Settings endpoints for reading and persisting user preferences."""

from typing import Any
from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user, get_supabase_client
from app.core.config import get_settings
from app.integrations.supabase import SupabaseService
from app.schemas.settings import UserSettingsResponse, UserSettingsUpdate
from app.schemas.user import AuthenticatedUser

router = APIRouter()


@router.get("/", response_model=UserSettingsResponse)
async def get_user_settings(
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Retrieve user appearance, notifications, and integration statuses."""
    profile = await SupabaseService.get_user_profile(client, current_user.id)
    prefs = profile.get("preferences", {})
    settings = get_settings()

    has_ai = bool((settings.nebius_api_key or settings.nvidia_api_key) and (settings.nebius_api_key or settings.nvidia_api_key).strip())
    active_integrations = {
        "supabase": True,
        "nebius_token_factory": has_ai,
        "nvidia_ai": has_ai,
        "github": bool(settings.github_client_id or settings.github_webhook_secret),
    }

    return {
        "theme": prefs.get("theme", "system"),
        "notifications": prefs.get("notifications", True),
        "telemetry": prefs.get("telemetry", False),
        "model_preferences": prefs.get("model_preferences", {
            "model": settings.nvidia_model,
            "provider": "Nebius Token Factory",
            "base_url": settings.nvidia_base_url,
        }),
        "active_integrations": active_integrations,
    }


@router.patch("/", response_model=UserSettingsResponse)
async def update_user_settings(
    payload: UserSettingsUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Update user preferences."""
    profile = await SupabaseService.get_user_profile(client, current_user.id)
    prefs = profile.get("preferences", {})

    updates = payload.model_dump(exclude_unset=True)
    prefs.update(updates)

    await SupabaseService.update_user_profile(client, current_user.id, {"preferences": prefs})
    return await get_user_settings(current_user, client)

