"""Agent task request schema."""

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AgentTaskRequest(BaseModel):
    """Validated task input for a future configured agent service."""

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
