"""GitHub repository routes pending OAuth and persistence integration."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import get_current_user, get_supabase_client
from app.core.exceptions import api_error
from app.schemas.repository import RepositoryConnectRequest
from app.schemas.user import AuthenticatedUser
from app.services.project_service import get_owned_project

router = APIRouter()


def _integration_unavailable() -> None:
    raise api_error(
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "GITHUB_NOT_CONFIGURED",
        "GitHub repository access is not configured for this deployment.",
        {"configured": False},
    )


@router.post("/", status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
async def connect_repository(
    payload: RepositoryConnectRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> None:
    """Refuse connection until secure OAuth token storage is configured."""
    await get_owned_project(client, payload.project_id, current_user.id)
    _integration_unavailable()


@router.get("/", status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
async def list_repositories(
    project_id: UUID = Query(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> None:
    """Refuse listing until OAuth and repository persistence are configured."""
    await get_owned_project(client, project_id, current_user.id)
    _integration_unavailable()


@router.get("/{owner}/{repository}", status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
async def inspect_repository(
    owner: str,
    repository: str,
    project_id: UUID = Query(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> None:
    """Refuse inspection until authenticated GitHub access is configured."""
    await get_owned_project(client, project_id, current_user.id)
    _integration_unavailable()


@router.delete("/{owner}/{repository}", status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
async def disconnect_repository(
    owner: str,
    repository: str,
    project_id: UUID = Query(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> None:
    """Refuse disconnect until repository connection persistence is configured."""
    await get_owned_project(client, project_id, current_user.id)
    _integration_unavailable()
