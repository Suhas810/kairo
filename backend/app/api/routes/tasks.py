"""Task management endpoints covering the complete task lifecycle."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status

from app.api.dependencies import get_current_user, get_supabase_client
from app.integrations.supabase import SupabaseService
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskStatusResponse,
    TaskUpdate,
)
from app.schemas.user import AuthenticatedUser
from app.services.project_service import get_owned_project

router = APIRouter()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Create a new task within an owned project."""
    await get_owned_project(client, payload.project_id, current_user.id)
    values = payload.model_dump(exclude_unset=True)
    task = await SupabaseService.create_task(client, current_user.id, values)
    return {
        **task,
        "projectId": task.get("project_id"),
        "taskType": task.get("task_type"),
        "createdAt": task.get("created_at"),
        "updatedAt": task.get("updated_at"),
    }


@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    project_id: UUID | None = Query(None),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> list[dict[str, Any]]:
    """List tasks owned by the authenticated user, optionally filtered by project."""
    if project_id:
        await get_owned_project(client, project_id, current_user.id)

    tasks = await SupabaseService.list_tasks(client, current_user.id, project_id)
    results = []
    for t in tasks:
        results.append(
            {
                **t,
                "projectId": t.get("project_id"),
                "taskType": t.get("task_type"),
                "createdAt": t.get("created_at"),
                "updatedAt": t.get("updated_at"),
            }
        )
    return results


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Retrieve details for an owned task."""
    task = await SupabaseService.get_task(client, task_id, current_user.id)
    return {
        **task,
        "projectId": task.get("project_id"),
        "taskType": task.get("task_type"),
        "createdAt": task.get("created_at"),
        "updatedAt": task.get("updated_at"),
    }


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Update fields on an owned task."""
    updates = payload.model_dump(exclude_unset=True)
    task = await SupabaseService.update_task(client, task_id, current_user.id, updates)
    return {
        **task,
        "projectId": task.get("project_id"),
        "taskType": task.get("task_type"),
        "createdAt": task.get("created_at"),
        "updatedAt": task.get("updated_at"),
    }


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> Response:
    """Delete an owned task."""
    await SupabaseService.delete_task(client, task_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{task_id}/status", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Retrieve the current lifecycle status for a task."""
    task = await SupabaseService.get_task(client, task_id, current_user.id)
    progress = 100 if task["status"] in ("completed", "failed", "cancelled") else 40
    return {
        "task_id": str(task_id),
        "status": task["status"],
        "progress": progress,
        "message": f"Task is currently {task['status']}.",
    }


@router.post("/{task_id}/cancel", response_model=TaskResponse)
async def cancel_task(
    task_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Request cancellation for a task."""
    task = await SupabaseService.update_task(
        client, task_id, current_user.id, {"status": "cancelled"}
    )
    return {
        **task,
        "projectId": task.get("project_id"),
        "taskType": task.get("task_type"),
        "createdAt": task.get("created_at"),
        "updatedAt": task.get("updated_at"),
    }

