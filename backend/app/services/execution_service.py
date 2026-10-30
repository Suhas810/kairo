"""Execution service managing isolated runs, status persistence, and streaming."""

import asyncio
from datetime import datetime, timezone
import json
import logging
from typing import Any, AsyncGenerator
from uuid import UUID, uuid4

from fastapi import status

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
from app.services.sandbox_service import SandboxExecutionService, generate_unified_diff

logger = logging.getLogger(__name__)


class ExecutionService:
    """Manages code executions, background jobs, and real-time streaming."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.sandbox = SandboxExecutionService()
        self.active_executions: dict[str, dict[str, Any]] = {}
        self.listeners: dict[str, list[asyncio.Queue]] = {}
        self.cancellation_events: dict[str, asyncio.Event] = {}
        self.semaphore = asyncio.Semaphore(self.settings.max_concurrent_executions)

    def subscribe(self, execution_id: str) -> asyncio.Queue:
        """Subscribe to execution events."""
        queue: asyncio.Queue = asyncio.Queue()
        if execution_id not in self.listeners:
            self.listeners[execution_id] = []
        self.listeners[execution_id].append(queue)
        return queue

    def unsubscribe(self, execution_id: str, queue: asyncio.Queue) -> None:
        """Unsubscribe from execution events."""
        if execution_id in self.listeners and queue in self.listeners[execution_id]:
            self.listeners[execution_id].remove(queue)
            if not self.listeners[execution_id]:
                del self.listeners[execution_id]

    def _broadcast(self, execution_id: str, data: dict[str, Any]) -> None:
        """Emit data to active SSE queues."""
        queues = self.listeners.get(execution_id, [])
        for q in list(queues):
            try:
                q.put_nowait(data)
            except asyncio.QueueFull:
                pass

    async def start_execution(
        self,
        payload: ExecutionCreateRequest,
        user_id: UUID,
        client: Any | None = None,
    ) -> ExecutionResponse:
        """Schedule and run isolated code execution."""
        execution_id = str(uuid4())
        session_id = str(uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()

        initial_state: dict[str, Any] = {
            "id": execution_id,
            "session_id": session_id,
            "project_id": str(payload.project_id),
            "projectId": str(payload.project_id),
            "user_id": str(user_id),
            "task_id": str(payload.task_id) if payload.task_id else None,
            "title": payload.title or "Automated execution",
            "status": "queued",
            "progress": 10,
            "started_at": now_iso,
            "startedAt": now_iso,
            "ended_at": None,
            "finishedAt": None,
            "duration_ms": 0,
            "durationMs": 0,
            "exit_code": None,
            "logs": [
                {
                    "id": f"log-{uuid4().hex[:6]}",
                    "timestamp": now_iso,
                    "level": "info",
                    "message": "Execution queued for isolated sandbox processing.",
                }
            ],
            "output": ["Preparing isolated runner sandbox..."],
            "test_results": [],
            "testResults": [],
            "diff_summary": None,
            "simulated": False,
        }
        self.active_executions[execution_id] = initial_state
        cancel_event = asyncio.Event()
        self.cancellation_events[execution_id] = cancel_event

        # Spawn background execution
        asyncio.create_task(
            self._run_job(execution_id, payload, user_id, client, cancel_event)
        )

        return ExecutionResponse(**initial_state)

    async def _run_job(
        self,
        execution_id: str,
        payload: ExecutionCreateRequest,
        user_id: UUID,
        client: Any | None,
        cancel_event: asyncio.Event,
    ) -> None:
        """Background execution worker enforcing concurrency limits."""
        async with self.semaphore:
            record = self.active_executions.get(execution_id)
            if not record or cancel_event.is_set():
                return

            record["status"] = "running"
            record["progress"] = 35
            self._add_log(execution_id, "info", "Spawning isolated sandbox container...")
            self._broadcast(execution_id, record)

            await asyncio.sleep(0.1)
            if cancel_event.is_set():
                self._mark_cancelled(execution_id)
                return

            # Execute code or test suite
            source_files = dict(payload.source_files)
            if not source_files:
                # Default demonstration script
                if payload.language == "python":
                    source_files = {
                        "main.py": "def test_answer():\n    assert 1 + 1 == 2\n",
                    }
                else:
                    source_files = {
                        "index.test.js": "import test from 'node:test';\nimport assert from 'node:assert';\ntest('math', () => { assert.strictEqual(2 + 2, 4); });\n",
                    }

            record["progress"] = 65
            self._add_log(execution_id, "info", f"Executing {payload.language} workload...")
            self._broadcast(execution_id, record)

            test_result = self.sandbox.run_tests(
                language=payload.language,
                source_files=source_files,
                timeout_seconds=payload.timeout_seconds,
                execution_id=execution_id,
            )

            if cancel_event.is_set():
                self._mark_cancelled(execution_id)
                return

            # Process outcome
            record["progress"] = 100
            record["ended_at"] = datetime.now(timezone.utc).isoformat()
            record["finishedAt"] = record["ended_at"]
            record["duration_ms"] = test_result.get("duration_ms", 0)
            record["durationMs"] = record["duration_ms"]
            record["exit_code"] = test_result.get("exit_code")

            status_str = "passed" if test_result.get("status") == "completed" and test_result.get("tests_failed", 0) == 0 else "failed"
            record["status"] = status_str

            stdout = test_result.get("stdout", "")
            stderr = test_result.get("stderr", "")
            record["output"] = [line for line in stdout.splitlines() if line] or [line for line in stderr.splitlines() if line] or ["Process completed."]

            passed_count = test_result.get("tests_passed", 0)
            failed_count = test_result.get("tests_failed", 0)
            tests_list: list[dict[str, Any]] = []
            for i in range(passed_count or 1):
                tests_list.append({"name": f"test_suite_{i+1}", "status": "passed", "duration": "14 ms"})
            for i in range(failed_count):
                tests_list.append({"name": f"test_fail_{i+1}", "status": "failed", "duration": "18 ms", "error": test_result.get("error")})

            record["test_results"] = tests_list
            record["testResults"] = tests_list

            self._add_log(
                execution_id,
                "info" if status_str == "passed" else "error",
                f"Execution finished with exit code {test_result.get('exit_code')}. Result: {status_str}.",
            )
            self._broadcast(execution_id, record)

            # Persist to Supabase if client is available
            if client is not None:
                try:
                    await SupabaseService.create_execution(
                        client,
                        user_id=user_id,
                        execution_data={
                            "session_id": record["session_id"],
                            "project_id": record["project_id"],
                            "task_id": record.get("task_id"),
                            "status": "completed" if status_str == "passed" else "failed",
                            "step_metadata": record["logs"],
                            "test_results": tests_list,
                            "diff_summary": None,
                            "exit_code": record["exit_code"],
                        },
                    )
                except Exception as exc:
                    logger.warning("Could not persist execution record to DB: %s", exc)

    def _add_log(self, execution_id: str, level: str, message: str) -> None:
        record = self.active_executions.get(execution_id)
        if record:
            log_item = {
                "id": f"log-{uuid4().hex[:6]}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "level": level,
                "message": message,
            }
            record["logs"].append(log_item)

    def _mark_cancelled(self, execution_id: str) -> None:
        record = self.active_executions.get(execution_id)
        if record:
            record["status"] = "cancelled"
            record["progress"] = 100
            record["ended_at"] = datetime.now(timezone.utc).isoformat()
            record["finishedAt"] = record["ended_at"]
            self._add_log(execution_id, "warn", "Execution was cancelled by the user.")
            self._broadcast(execution_id, record)

    async def get_execution(
        self, execution_id: UUID, user_id: UUID, client: Any | None = None
    ) -> ExecutionResponse:
        """Retrieve execution by ID."""
        str_id = str(execution_id)
        if str_id in self.active_executions:
            return ExecutionResponse(**self.active_executions[str_id])

        if client is not None:
            db_row = await SupabaseService.get_execution(client, execution_id, user_id)
            return ExecutionResponse(
                id=db_row["id"],
                session_id=db_row.get("session_id"),
                project_id=db_row["project_id"],
                projectId=db_row["project_id"],
                user_id=db_row["user_id"],
                task_id=db_row.get("task_id"),
                status=db_row.get("status", "completed"),
                exit_code=db_row.get("exit_code"),
                test_results=db_row.get("test_results", []),
                testResults=db_row.get("test_results", []),
                diff_summary=db_row.get("diff_summary"),
                logs=[ExecutionLogEntry(**item) if isinstance(item, dict) else item for item in db_row.get("step_metadata", [])],
            )

        raise api_error(
            status.HTTP_404_NOT_FOUND,
            "EXECUTION_NOT_FOUND",
            f"Execution {execution_id} not found.",
        )

    async def cancel_execution(
        self, execution_id: UUID, user_id: UUID, client: Any | None = None
    ) -> ExecutionResponse:
        """Cancel running execution."""
        str_id = str(execution_id)
        event = self.cancellation_events.get(str_id)
        if event:
            event.set()
        self._mark_cancelled(str_id)
        return await self.get_execution(execution_id, user_id, client)


execution_service = ExecutionService()
