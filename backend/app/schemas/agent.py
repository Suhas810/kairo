"""Agent task and event schemas."""

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

AgentStage = Literal["planning", "research", "coding", "testing", "completed", "failed"]
AgentEventType = Literal["status", "message", "tool", "diff", "error"]


class AgentTaskRequest(BaseModel):
    """Validated task input for agent execution."""

    model_config = ConfigDict(extra="forbid")

    project_id: UUID
    task: str = Field(min_length=1, max_length=20_000)
    mode: Literal["autonomous", "assisted"] = "autonomous"

    @field_validator("task")
    @classmethod
    def require_nonblank_task(cls, value: str) -> str:
        task = value.strip()
        if not task:
            raise ValueError("Task description cannot be blank.")
        return task


class AgentActivityEvent(BaseModel):
    """Individual event emitted during agent orchestration."""

    model_config = ConfigDict(extra="ignore")

    id: str
    type: AgentEventType = "status"
    stage: AgentStage = "planning"
    message: str
    timestamp: str | datetime
    toolName: str | None = None
    toolInput: str | None = None
    toolResult: str | None = None
    diff: str | None = None


class AgentSessionResponse(BaseModel):
    """Details of an agent session."""

    model_config = ConfigDict(extra="ignore")

    id: UUID | str
    project_id: UUID | str
    task_id: UUID | str | None = None
    status: str = "queued"
    progress: int = 0
    model_provider: str | None = None
    model_name: str | None = None
    activity: list[AgentActivityEvent] = Field(default_factory=list)
    result_summary: str | None = None
    started_at: datetime | str | None = None
    completed_at: datetime | str | None = None
    created_at: datetime | str | None = None


class AgentTaskResponse(BaseModel):
    """Response returned when submitting or querying an agent task."""

    model_config = ConfigDict(extra="ignore")

    task_id: UUID | str
    session_id: UUID | str
    status: str = "queued"
    progress: int = 5
    message: str = "Task queued for execution."
    activity: list[AgentActivityEvent] = Field(default_factory=list)
    created_at: datetime | str | None = None
    simulated: bool = False
