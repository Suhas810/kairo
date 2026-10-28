"""Normalized result objects returned by execution and test operations."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from runner.models import Language

ExecutionStatus = Literal[
    "completed",
    "failed",
    "timed_out",
    "rejected",
    "infrastructure_error",
]


class ExecutionResult(BaseModel):
    """Structured, bounded and secret-free execution outcome."""

    model_config = ConfigDict(extra="forbid")

    execution_id: str | None = None
    status: ExecutionStatus
    language: Language | None = None
    exit_code: int | None = None
    stdout: str = ""
    stderr: str = ""
    duration_ms: int = Field(ge=0)
    timed_out: bool = False
    output_truncated: bool = False
    error: str | None = None


class TestResult(ExecutionResult):
    """Execution result with parsed test counts when the framework reported them."""

    tests_run: int | None = None
    tests_passed: int | None = None
    tests_failed: int | None = None


def bounded_text(value: bytes | str | None, limit: int) -> tuple[str, bool]:
    """Decode text with replacement and cap it by UTF-8 bytes."""
    if value is None:
        return "", False
    raw = value.encode("utf-8", errors="replace") if isinstance(value, str) else value
    if len(raw) <= limit:
        return raw.decode("utf-8", errors="replace"), False
    trimmed = raw[:limit].decode("utf-8", errors="replace")
    return trimmed, True
