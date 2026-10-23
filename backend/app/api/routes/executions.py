"""Execution endpoints pending isolated execution infrastructure."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_current_user, get_supabase_client
from app.core.exceptions import api_error
from app.schemas.execution import ExecutionCreateRequest
from app.schemas.user import AuthenticatedUser
from app.services.project_service import get_owned_project

router = APIRouter()


@router.post("/", status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
async def create_execution(
    payload: ExecutionCreateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> None:
    """Validate ownership and refuse execution without an isolated execution service."""
    await get_owned_project(client, payload.project_id, current_user.id)
    raise api_error(
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "EXECUTION_NOT_CONFIGURED",
        "Isolated code execution is not configured for this deployment.",
        {"configured": False},
    )


@router.get("/{execution_id}", status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
async def get_execution(
    execution_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> None:
    """Report execution status as unavailable rather than fabricating a result."""
    raise api_error(
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "EXECUTION_NOT_CONFIGURED",
        "Execution status and results are unavailable because execution is not configured.",
        {"configured": False},
    )
