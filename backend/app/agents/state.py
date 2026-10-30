"""Agent execution state and session tracking models."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from app.schemas.agent import AgentActivityEvent, AgentStage


@dataclass
class AgentState:
    """Live state for an active agent execution loop."""

    task_id: UUID | str
    session_id: UUID | str
    project_id: UUID | str
    user_id: UUID | str
    task_title: str
    task_description: str
    stage: AgentStage = "planning"
    status: str = "queued"
    progress: int = 5
    plan: dict[str, Any] = field(default_factory=dict)
    initial_files: dict[str, str] = field(default_factory=dict)
    current_files: dict[str, str] = field(default_factory=dict)
    diff: str = ""
    test_results: list[dict[str, Any]] = field(default_factory=list)
    activity: list[AgentActivityEvent] = field(default_factory=list)
    result_summary: str | None = None
    is_cancelled: bool = False
    started_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: str | None = None
    language: str = "python"

    def record_activity(
        self,
        event_type: str,
        stage: AgentStage,
        message: str,
        tool_name: str | None = None,
        tool_input: str | None = None,
        tool_result: str | None = None,
        diff: str | None = None,
    ) -> AgentActivityEvent:
        """Create and append an activity event."""
        import uuid
        event = AgentActivityEvent(
            id=f"event-{uuid.uuid4().hex[:8]}",
            type=event_type,  # type: ignore
            stage=stage,
            message=message,
            timestamp=datetime.now(timezone.utc).isoformat(),
            toolName=tool_name,
            toolInput=tool_input,
            toolResult=tool_result,
            diff=diff,
        )
        self.activity.append(event)
        return event
