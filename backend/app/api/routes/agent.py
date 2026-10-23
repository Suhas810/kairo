"""Agent task endpoint."""

from typing import Any

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_current_user, get_supabase_client
from app.core.exceptions import api_error
from app.schemas.agent import AgentTaskRequest
from app.schemas.user import AuthenticatedUser
from app.services.project_service import get_owned_project

router = APIRouter()


@router.post("/tasks", status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
async def start_agent_task(
    payload: AgentTaskRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> None:
    """Validate project ownership and report that agent orchestration is unavailable."""
    await get_owned_project(client, payload.project_id, current_user.id)
    raise api_error(
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "AGENT_NOT_CONFIGURED",
        "The AI agent service is not configured for this deployment.",
        {"configured": False},
    )
