"""User-owned project endpoints."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Response, status

from app.api.dependencies import get_current_user, get_supabase_client
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.user import AuthenticatedUser
from app.services.project_service import (
    create_project,
    delete_project,
    get_owned_project,
    list_projects,
    update_project,
)

router = APIRouter()


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_user_project(
    payload: ProjectCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict:
    """Create a project owned by the authenticated user."""
    return await create_project(client, current_user.id, payload)


@router.get("/", response_model=dict[str, list[ProjectResponse]])
async def list_user_projects(
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, list[dict]]:
    """List only projects owned by the authenticated user."""
    return {"projects": await list_projects(client, current_user.id)}


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_user_project(
    project_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict:
    """Retrieve a project only when it belongs to the authenticated user."""
    return await get_owned_project(client, project_id, current_user.id)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_user_project(
    project_id: UUID,
    payload: ProjectUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict:
    """Update a project only when it belongs to the authenticated user."""
    return await update_project(client, project_id, current_user.id, payload)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_project(
    project_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> Response:
    """Delete a project only when it belongs to the authenticated user."""
    await delete_project(client, project_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
