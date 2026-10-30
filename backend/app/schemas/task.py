"""Task API request and response schemas."""

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


TaskStatus = Literal["pending", "in_progress", "completed", "failed", "cancelled"]
TaskPriority = Literal["low", "normal", "high", "urgent"]
TaskType = Literal["bug_fix", "feature", "refactor", "documentation", "test", "other"]


class TaskCreate(BaseModel):
    """Payload to create a task."""

    model_config = ConfigDict(extra="ignore")

    project_id: UUID
    title: str = Field(min_length=1, max_length=300)
    description: str | None = Field(default=None, max_length=10000)
    priority: TaskPriority = "normal"
    task_type: TaskType = "feature"
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        clean = value.strip()
        if not clean:
            raise ValueError("Task title cannot be blank.")
        return clean


class TaskUpdate(BaseModel):
    """Payload to update an existing task."""

    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=300)
    description: str | None = Field(default=None, max_length=10000)
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    task_type: TaskType | None = None
    metadata: dict[str, Any] | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str | None) -> str | None:
        if value is None:
            return None
        clean = value.strip()
        if not clean:
            raise ValueError("Task title cannot be blank.")
        return clean

    @model_validator(mode="after")
    def check_at_least_one(self) -> "TaskUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one task field must be provided.")
        return self


class TaskResponse(BaseModel):
    """Public task response."""

    model_config = ConfigDict(extra="ignore")

    id: UUID | str
    project_id: UUID | str
    projectId: UUID | str | None = None
    user_id: UUID | str
    title: str
    description: str | None = None
    status: TaskStatus = "pending"
    priority: TaskPriority = "normal"
    task_type: TaskType = "other"
    taskType: TaskType | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | str | None = None
    createdAt: datetime | str | None = None
    updated_at: datetime | str | None = None
    updatedAt: datetime | str | None = None


class TaskStatusResponse(BaseModel):
    """Lightweight task status query response."""

    task_id: UUID | str
    status: TaskStatus
    progress: int = 0
    message: str | None = None

