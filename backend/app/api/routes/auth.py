"""Authentication and user profile endpoints."""

from typing import Any
from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user, get_supabase_client
from app.integrations.supabase import SupabaseService
from app.schemas.user import AuthenticatedUser, UserProfile, UserProfileUpdate

router = APIRouter()


@router.get("/me", response_model=AuthenticatedUser)
async def get_authenticated_user(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    """Return the identity associated with the validated Supabase access token."""
    return current_user


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Retrieve full user profile and preferences."""
    profile = await SupabaseService.get_user_profile(client, current_user.id)
    profile["email"] = current_user.email
    return profile


@router.patch("/profile", response_model=UserProfile)
async def update_user_profile(
    payload: UserProfileUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Update public user profile fields and preferences."""
    updates = payload.model_dump(exclude_unset=True)
    profile = await SupabaseService.update_user_profile(client, current_user.id, updates)
    profile["email"] = current_user.email
    return profile
