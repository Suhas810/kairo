"""Authentication endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.schemas.user import AuthenticatedUser

router = APIRouter()


@router.get("/me", response_model=AuthenticatedUser)
async def get_authenticated_user(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    """Return the identity associated with the validated Supabase access token."""
    return current_user
