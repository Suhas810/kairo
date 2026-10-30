"""Central agent orchestrator coordinating planning, coding, testing, and reviewing."""

import asyncio
from datetime import datetime, timezone
import logging
from typing import Any, AsyncGenerator
from uuid import UUID, uuid4

from app.agents.coding_agent import CodingAgent
from app.agents.planner import PlannerAgent
from app.agents.reviewer import ReviewerAgent
from app.agents.state import AgentState
from app.agents.test_agent import TestAgent
from app.core.config import get_settings
from app.integrations.nvidia_ai import NvidiaAIClient
from app.integrations.supabase import SupabaseService
from app.services.sandbox_service import SandboxExecutionService

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """Coordinates the full autonomous developer workflow."""

    def __init__(self) -> None:
        settings = get_settings()
        self.ai_client = NvidiaAIClient(
            api_key=settings.nvidia_api_key,
            base_url=settings.nvidia_base_url,
            model=settings.nvidia_model,
            timeout_seconds=float(settings.execution_timeout_seconds),
        )
        self.sandbox = SandboxExecutionService()
        self.planner = PlannerAgent(self.ai_client)
        self.coder = CodingAgent(self.ai_client)
        self.tester = TestAgent(self.sandbox)
        self.reviewer = ReviewerAgent(self.ai_client)

        # In-memory session tracking and active listener queues for live streaming
        self.active_sessions: dict[str, AgentState] = {}
        self.listeners: dict[str, list[asyncio.Queue]] = {}
        self.cancellation_tokens: dict[str, asyncio.Event] = {}

    def get_session_state(self, session_or_task_id: str) -> AgentState | None:
        """Find state by session_id or task_id."""
        if session_or_task_id in self.active_sessions:
            return self.active_sessions[session_or_task_id]
        for state in self.active_sessions.values():
            if str(state.task_id) == str(session_or_task_id):
                return state
        return None

    def cancel_task(self, session_or_task_id: str) -> bool:
        """Signal cancellation for a running task."""
        token = self.cancellation_tokens.get(session_or_task_id)
        if token:
            token.set()
        state = self.get_session_state(session_or_task_id)
        if state:
            state.is_cancelled = True
            state.status = "cancelled"
            state.stage = "failed"
            state.record_activity("error", "failed", "Task was cancelled by the user.")
            self._notify_listeners(str(state.session_id), state)
            return True
        return False

    def subscribe(self, session_id: str) -> asyncio.Queue:
        """Register an event queue for live SSE streaming."""
        queue: asyncio.Queue = asyncio.Queue()
        if session_id not in self.listeners:
            self.listeners[session_id] = []
        self.listeners[session_id].append(queue)
        return queue

    def unsubscribe(self, session_id: str, queue: asyncio.Queue) -> None:
        """Unregister listener queue."""
        if session_id in self.listeners and queue in self.listeners[session_id]:
            self.listeners[session_id].remove(queue)
            if not self.listeners[session_id]:
                del self.listeners[session_id]

    def _notify_listeners(self, session_id: str, state: AgentState) -> None:
        """Broadcast state snapshot to all connected listeners."""
        queues = self.listeners.get(session_id, [])
        for q in list(queues):
            try:
                q.put_nowait({
                    "session_id": str(state.session_id),
                    "task_id": str(state.task_id),
                    "status": state.status,
                    "stage": state.stage,
                    "progress": state.progress,
                    "activity": [e.model_dump() for e in state.activity[-3:]],
                    "diff": state.diff,
                })
            except asyncio.QueueFull:
                pass

    async def execute_task_workflow(
        self,
        user_id: UUID,
        project_id: UUID,
        task_id: UUID,
        task_title: str,
        task_description: str,
        initial_files: dict[str, str],
        supabase_client: Any | None = None,
        language: str = "python",
    ) -> AgentState:
        """Full end-to-end orchestration loop with bounded repair iterations."""
        session_id = uuid4()
        state = AgentState(
            task_id=task_id,
            session_id=session_id,
            project_id=project_id,
            user_id=user_id,
            task_title=task_title,
            task_description=task_description,
            initial_files=dict(initial_files),
            current_files=dict(initial_files),
            language=language,
        )
        self.active_sessions[str(session_id)] = state
        self.active_sessions[str(task_id)] = state
        cancel_token = asyncio.Event()
        self.cancellation_tokens[str(session_id)] = cancel_token
        self.cancellation_tokens[str(task_id)] = cancel_token

        # Update DB session & task status
        if supabase_client is not None:
            try:
                await SupabaseService.create_agent_session(
                    supabase_client,
                    user_id=user_id,
                    project_id=project_id,
                    task_id=task_id,
                    model_name=self.ai_client.model,
                )
                await SupabaseService.update_task(
                    supabase_client,
                    task_id=task_id,
                    user_id=user_id,
                    updates={"status": "in_progress"},
                )
            except Exception as exc:
                logger.warning("Could not persist initial DB state: %s", exc)

        try:
            # 1. Planning stage
            if cancel_token.is_set():
                return state
            state.status = "planning"
            self._notify_listeners(str(session_id), state)
            plan = await self.planner.create_plan(state, repo_summary=f"Files: {list(initial_files.keys())}")
            self._notify_listeners(str(session_id), state)

            # 2. Coding stage (with up to 2 repair iterations if tests fail)
            max_repair_attempts = 2
            test_passed = False
            last_test_output = ""

            for attempt in range(max_repair_attempts + 1):
                if cancel_token.is_set():
                    break

                state.status = "coding"
                self._notify_listeners(str(session_id), state)
                await self.coder.execute_coding(state, plan)
                self._notify_listeners(str(session_id), state)

                if cancel_token.is_set():
                    break

                # 3. Testing stage
                state.status = "testing"
                self._notify_listeners(str(session_id), state)
                test_passed, test_run_info = await self.tester.execute_testing(state)
                last_test_output = test_run_info.get("stdout", "") or test_run_info.get("stderr", "")
                self._notify_listeners(str(session_id), state)

                if test_passed:
                    break

                if attempt < max_repair_attempts:
                    state.record_activity(
                        "message",
                        "coding",
                        f"Tests failed on attempt {attempt + 1}. Initiating bounded repair iteration...",
                    )

            # 4. Review stage
            if not cancel_token.is_set():
                state.status = "reviewing"
                self._notify_listeners(str(session_id), state)
                review = await self.reviewer.review(state, last_test_output)
                state.result_summary = review.get("summary", "Workflow completed.")
                self._notify_listeners(str(session_id), state)

            # 5. Finalize status
            state.completed_at = datetime.now(timezone.utc).isoformat()
            if cancel_token.is_set():
                state.status = "cancelled"
                state.stage = "failed"
            elif test_passed:
                state.status = "completed"
                state.stage = "completed"
                state.progress = 100
                state.record_activity(
                    "status",
                    "completed",
                    f"Agent task completed successfully. {state.result_summary}",
                )
            else:
                state.status = "failed"
                state.stage = "failed"
                state.progress = 100
                state.record_activity(
                    "error",
                    "failed",
                    "Agent task failed after testing. Review diff and diagnostic logs.",
                )

            self._notify_listeners(str(session_id), state)

            # Persist completion in database
            if supabase_client is not None:
                try:
                    db_status = "completed" if state.status == "completed" else "failed"
                    await SupabaseService.update_task(
                        supabase_client,
                        task_id=task_id,
                        user_id=user_id,
                        updates={"status": db_status},
                    )
                    # Create execution record
                    await SupabaseService.create_execution(
                        supabase_client,
                        user_id=user_id,
                        execution_data={
                            "session_id": str(session_id),
                            "project_id": str(project_id),
                            "task_id": str(task_id),
                            "status": db_status,
                            "step_metadata": [e.model_dump() for e in state.activity],
                            "test_results": state.test_results,
                            "diff_summary": state.diff,
                            "exit_code": 0 if test_passed else 1,
                        },
                    )
                except Exception as exc:
                    logger.warning("Could not persist final DB state: %s", exc)

            return state
        finally:
            self.cancellation_tokens.pop(str(session_id), None)
            self.cancellation_tokens.pop(str(task_id), None)


# Shared singleton orchestrator
orchestrator = AgentOrchestrator()
