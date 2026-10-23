"""Supabase-backed project operations with explicit owner scoping."""

from typing import Any
from uuid import UUID

from fastapi import status
from starlette.concurrency import run_in_threadpool

from app.core.exceptions import api_error
from app.schemas.project import ProjectCreate, ProjectUpdate


async def list_projects(client: Any, user_id: UUID) -> list[dict]:
    """Return the authenticated user's projects only."""
    response = await run_in_threadpool(
        lambda: client.table("projects")
        .select("*")
        .eq("user_id", str(user_id))
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


async def create_project(
    client: Any, user_id: UUID, payload: ProjectCreate
) -> dict:
    """Persist a project with its owner taken exclusively from the token."""
    values = payload.model_dump(exclude_unset=True)
    values["user_id"] = str(user_id)
    response = await run_in_threadpool(
        lambda: client.table("projects").insert(values).select("*").execute()
    )
    if not response.data:
        raise api_error(
            status.HTTP_502_BAD_GATEWAY,
            "PROJECT_CREATE_FAILED",
            "The project could not be created.",
        )
    return response.data[0]


async def get_owned_project(
    client: Any, project_id: UUID, user_id: UUID
) -> dict:
    """Find a project only within the authenticated user's ownership scope."""
    response = await run_in_threadpool(
        lambda: client.table("projects")
        .select("*")
        .eq("id", str(project_id))
        .eq("user_id", str(user_id))
        .limit(1)
        .execute()
    )
    if not response.data:
        raise api_error(
            status.HTTP_404_NOT_FOUND,
            "PROJECT_NOT_FOUND",
            "The project was not found.",
        )
    return response.data[0]


async def update_project(
    client: Any,
    project_id: UUID,
    user_id: UUID,
    payload: ProjectUpdate,
) -> dict:
    """Update only a project matching both its identifier and owner."""
    values = payload.model_dump(exclude_unset=True)
    response = await run_in_threadpool(
        lambda: client.table("projects")
        .update(values)
        .eq("id", str(project_id))
        .eq("user_id", str(user_id))
        .select("*")
        .execute()
    )
    if not response.data:
        raise api_error(
            status.HTTP_404_NOT_FOUND,
            "PROJECT_NOT_FOUND",
            "The project was not found.",
        )
    return response.data[0]


async def delete_project(client: Any, project_id: UUID, user_id: UUID) -> None:
    """Delete only a project matching both its identifier and owner."""
    response = await run_in_threadpool(
        lambda: client.table("projects")
        .delete()
        .eq("id", str(project_id))
        .eq("user_id", str(user_id))
        .select("id")
        .execute()
    )
    if not response.data:
        raise api_error(
            status.HTTP_404_NOT_FOUND,
            "PROJECT_NOT_FOUND",
            "The project was not found.",
        )
