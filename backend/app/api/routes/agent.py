"""Agent task orchestration endpoints."""

import asyncio
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, status

from app.agents.orchestrator import orchestrator
from app.api.dependencies import get_current_user, get_supabase_client
from app.core.exceptions import api_error
from app.integrations.supabase import SupabaseService
from app.schemas.agent import (
    AgentActivityEvent,
    AgentSessionResponse,
    AgentTaskRequest,
    AgentTaskResponse,
)
from app.schemas.user import AuthenticatedUser
from app.services.project_service import get_owned_project

router = APIRouter()


@router.post("/tasks", response_model=AgentTaskResponse, status_code=status.HTTP_202_ACCEPTED)
async def start_agent_task(
    payload: AgentTaskRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Validate project ownership and dispatch AI agent workflow."""
    project = await get_owned_project(client, payload.project_id, current_user.id)

    if not orchestrator.ai_client.is_configured():
        raise api_error(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "AGENT_NOT_CONFIGURED",
            "The AI agent service is not configured for this deployment.",
            {"configured": False},
        )

    task_id = uuid4()
    # Create task record in Supabase
    task_record = await SupabaseService.create_task(
        client,
        current_user.id,
        {
            "id": str(task_id),
            "project_id": str(payload.project_id),
            "title": payload.task[:100],
            "description": payload.task,
            "status": "pending",
            "task_type": "feature",
        },
    )

    # Launch workflow in background
    asyncio.create_task(
        orchestrator.execute_task_workflow(
            user_id=current_user.id,
            project_id=payload.project_id,
            task_id=task_id,
            task_title=payload.task[:100],
            task_description=payload.task,
            initial_files={},
            supabase_client=client,
            language=project.get("language") or "python",
        )
    )

    session_id = uuid4()
    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "task_id": str(task_id),
        "session_id": str(session_id),
        "status": "queued",
        "progress": 5,
        "message": "Task queued for autonomous execution.",
        "activity": [
            AgentActivityEvent(
                id=f"event-{uuid4().hex[:8]}",
                type="status",
                stage="planning",
                message="Task dispatched to Kairo agent orchestrator.",
                timestamp=now_iso,
            )
        ],
        "created_at": now_iso,
        "simulated": False,
    }


@router.get("/tasks/{task_id}", response_model=AgentSessionResponse)
async def get_agent_task(
    task_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Retrieve agent task and active session progress."""
    state = orchestrator.get_session_state(str(task_id))
    if state:
        return {
            "id": state.session_id,
            "project_id": state.project_id,
            "task_id": state.task_id,
            "status": state.status,
            "progress": state.progress,
            "model_provider": "nvidia",
            "model_name": orchestrator.ai_client.model,
            "activity": state.activity,
            "result_summary": state.result_summary,
            "started_at": state.started_at,
            "completed_at": state.completed_at,
        }

    # Fallback to Supabase
    task = await SupabaseService.get_task(client, task_id, current_user.id)
    return {
        "id": str(task_id),
        "project_id": task["project_id"],
        "task_id": str(task_id),
        "status": task["status"],
        "progress": 100 if task["status"] in ("completed", "failed") else 10,
        "model_provider": "nvidia",
        "model_name": orchestrator.ai_client.model,
        "activity": [],
        "result_summary": task.get("description"),
        "created_at": task.get("created_at"),
    }


@router.get("/tasks/{task_id}/status")
async def get_agent_task_status(
    task_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Lightweight status query for agent task polling."""
    state = orchestrator.get_session_state(str(task_id))
    if state:
        return {
            "status": state.status,
            "progress": state.progress,
            "stage": state.stage,
        }

    task = await SupabaseService.get_task(client, task_id, current_user.id)
    return {
        "status": task["status"],
        "progress": 100 if task["status"] in ("completed", "failed") else 10,
        "stage": "completed" if task["status"] == "completed" else "planning",
    }


@router.get("/tasks/{task_id}/activity", response_model=list[AgentActivityEvent])
async def get_agent_task_activity(
    task_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> list[AgentActivityEvent]:
    """Retrieve full activity timeline events for agent task."""
    state = orchestrator.get_session_state(str(task_id))
    if state:
        return state.activity

    # If completed in DB, fetch from executions
    executions = await SupabaseService.list_executions(client, current_user.id)
    for ex in executions:
        if str(ex.get("task_id")) == str(task_id):
            return [AgentActivityEvent(**item) for item in ex.get("step_metadata", [])]
    return []


@router.post("/tasks/{task_id}/cancel")
async def cancel_agent_task(
    task_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Request cancellation of an active agent task."""
    # Verify task ownership
    await SupabaseService.get_task(client, task_id, current_user.id)
    success = orchestrator.cancel_task(str(task_id))
    await SupabaseService.update_task(
        client, task_id, current_user.id, {"status": "cancelled"}
    )
    return {"cancelled": True, "task_id": str(task_id), "stopped": success}
