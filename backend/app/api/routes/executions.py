"""Execution routes for starting, querying, and streaming code runs."""

import asyncio
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse

from app.api.dependencies import get_current_user, get_supabase_client
from app.core.config import get_settings
from app.core.exceptions import api_error
from app.integrations.supabase import SupabaseService
from app.schemas.execution import (
    ExecutionCreateRequest,
    ExecutionLogEntry,
    ExecutionResponse,
    ExecutionStatusResponse,
    TestCaseResult,
)
from app.schemas.user import AuthenticatedUser
from app.services.execution_service import execution_service
from app.services.project_service import get_owned_project

router = APIRouter()


def _is_execution_configured() -> bool:
    settings = get_settings()
    import os
    if os.getenv("EXECUTION_ENABLED", "false").lower() in ("true", "1", "yes"):
        return True
    return execution_service.sandbox.is_docker_available()


def _raise_execution_not_configured() -> None:
    raise api_error(
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "EXECUTION_NOT_CONFIGURED",
        "Isolated code execution is not configured for this deployment.",
        {"configured": False},
    )


@router.post("/", response_model=ExecutionResponse, status_code=status.HTTP_201_CREATED)
async def create_execution(
    payload: ExecutionCreateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> ExecutionResponse:
    """Validate ownership and launch isolated execution."""
    await get_owned_project(client, payload.project_id, current_user.id)
    if not _is_execution_configured():
        _raise_execution_not_configured()

    return await execution_service.start_execution(payload, current_user.id, client)


@router.get("/", response_model=list[ExecutionResponse])
async def list_executions(
    project_id: UUID | None = Query(None),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> list[ExecutionResponse]:
    """List executions for user or project."""
    if project_id:
        await get_owned_project(client, project_id, current_user.id)
    if not _is_execution_configured():
        _raise_execution_not_configured()

    db_executions = await SupabaseService.list_executions(client, current_user.id, project_id)
    results = []
    for row in db_executions:
        results.append(
            ExecutionResponse(
                id=row["id"],
                session_id=row.get("session_id"),
                project_id=row["project_id"],
                projectId=row["project_id"],
                user_id=row["user_id"],
                task_id=row.get("task_id"),
                status=row.get("status", "completed"),
                exit_code=row.get("exit_code"),
                test_results=row.get("test_results", []),
                testResults=row.get("test_results", []),
                diff_summary=row.get("diff_summary"),
                logs=[ExecutionLogEntry(**item) if isinstance(item, dict) else item for item in row.get("step_metadata", [])],
            )
        )
    return results


@router.get("/{execution_id}", response_model=ExecutionResponse)
async def get_execution(
    execution_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> ExecutionResponse:
    """Retrieve execution status and outcome."""
    if not _is_execution_configured():
        _raise_execution_not_configured()

    return await execution_service.get_execution(execution_id, current_user.id, client)


@router.get("/{execution_id}/status", response_model=ExecutionStatusResponse)
async def get_execution_status(
    execution_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Lightweight polling endpoint for execution status and progress."""
    if not _is_execution_configured():
        _raise_execution_not_configured()

    res = await execution_service.get_execution(execution_id, current_user.id, client)
    progress = 100 if res.status in ("completed", "passed", "failed", "cancelled") else 50
    return {
        "execution_id": str(execution_id),
        "status": res.status,
        "progress": progress,
        "duration_ms": res.duration_ms,
    }


@router.get("/{execution_id}/logs", response_model=list[ExecutionLogEntry])
async def get_execution_logs(
    execution_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> list[ExecutionLogEntry]:
    """Retrieve logs for execution."""
    if not _is_execution_configured():
        _raise_execution_not_configured()

    res = await execution_service.get_execution(execution_id, current_user.id, client)
    return res.logs


@router.get("/{execution_id}/test-results", response_model=list[TestCaseResult])
async def get_execution_test_results(
    execution_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> list[TestCaseResult]:
    """Retrieve individual test outcomes for execution."""
    if not _is_execution_configured():
        _raise_execution_not_configured()

    res = await execution_service.get_execution(execution_id, current_user.id, client)
    return res.test_results


@router.get("/{execution_id}/diff")
async def get_execution_diff(
    execution_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Retrieve git diff for execution changes."""
    if not _is_execution_configured():
        _raise_execution_not_configured()

    res = await execution_service.get_execution(execution_id, current_user.id, client)
    return {
        "execution_id": str(execution_id),
        "diff": res.diff_summary or "",
    }


@router.post("/{execution_id}/cancel", response_model=ExecutionResponse)
async def cancel_execution(
    execution_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> ExecutionResponse:
    """Request termination of running execution."""
    if not _is_execution_configured():
        _raise_execution_not_configured()

    return await execution_service.cancel_execution(execution_id, current_user.id, client)


@router.get("/{execution_id}/stream")
async def stream_execution_events(
    execution_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> StreamingResponse:
    """Stream live execution events and log output using SSE."""
    if not _is_execution_configured():
        _raise_execution_not_configured()

    queue = execution_service.subscribe(str(execution_id))

    async def event_generator():
        try:
            while True:
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=20.0)
                    import json
                    yield f"data: {json.dumps(data)}\n\n"
                    if data.get("status") in ("completed", "passed", "failed", "cancelled", "timed_out"):
                        break
                except asyncio.TimeoutError:
                    yield ": ping\n\n"
        finally:
            execution_service.unsubscribe(str(execution_id), queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
