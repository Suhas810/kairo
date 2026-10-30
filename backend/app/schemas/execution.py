"""Execution request and response schemas."""

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


ExecutionStatusType = Literal[
    "queued", "running", "completed", "passed", "failed", "cancelled", "timed_out", "rejected", "infrastructure_error"
]


class ExecutionLogEntry(BaseModel):
    """Structured log record for an execution."""

    model_config = ConfigDict(extra="ignore")

    id: str
    timestamp: str | datetime
    level: Literal["info", "warn", "error"] = "info"
    message: str


class TestCaseResult(BaseModel):
    """Test case outcome from test runner."""

    model_config = ConfigDict(extra="ignore")

    name: str
    status: Literal["passed", "failed", "skipped"]
    duration: str = "0 ms"
    error: str | None = None


class ExecutionCreateRequest(BaseModel):
    """Request to create an isolated execution associated with a project."""

    model_config = ConfigDict(extra="ignore")

    project_id: UUID
    title: str = "Automated execution"
    task_id: UUID | None = None
    language: Literal["python", "javascript", "typescript"] = "python"
    source_files: dict[str, str] = Field(default_factory=dict)
    entrypoint: str = "main.py"
    test_command: str | None = None
    timeout_seconds: int = 60


class ExecutionResponse(BaseModel):
    """Full execution state and results."""

    model_config = ConfigDict(extra="ignore")

    id: UUID | str
    session_id: UUID | str | None = None
    project_id: UUID | str
    projectId: UUID | str | None = None
    user_id: UUID | str | None = None
    task_id: UUID | str | None = None
    title: str = "Execution"
    status: ExecutionStatusType = "queued"
    exit_code: int | None = None
    duration_ms: int = 0
    durationMs: int = 0
    started_at: datetime | str | None = None
    startedAt: datetime | str | None = None
    ended_at: datetime | str | None = None
    finishedAt: datetime | str | None = None
    logs: list[ExecutionLogEntry] = Field(default_factory=list)
    output: list[str] = Field(default_factory=list)
    test_results: list[TestCaseResult] = Field(default_factory=list)
    testResults: list[TestCaseResult] = Field(default_factory=list)
    diff_summary: str | None = None
    simulated: bool = False


class ExecutionStatusResponse(BaseModel):
    """Status query response."""

    execution_id: UUID | str
    status: ExecutionStatusType
    progress: int = 0
    duration_ms: int = 0
