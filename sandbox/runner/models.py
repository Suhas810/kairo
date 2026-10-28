"""Validated input models for sandbox executions."""

from pathlib import PurePosixPath
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

Language = Literal["python", "javascript", "typescript"]

_ALLOWED_TEST_COMMANDS = {
    "python": "pytest",
    "javascript": "node --test",
    "typescript": "typescript",
}


def _default_timeout_seconds() -> int:
    from runner.environment import load_resource_limits

    return load_resource_limits().default_timeout_seconds


def _validate_relative_path(value: str) -> str:
    """Reject absolute paths, traversal attempts, and platform-specific paths."""
    if (
        not isinstance(value, str)
        or not value
        or "\x00" in value
        or "\\" in value
        or ":" in value
        or value.startswith("/")
    ):
        raise ValueError("A source file path is invalid.")

    parts = value.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise ValueError("A source file path is invalid.")

    path = PurePosixPath(value)
    if path.is_absolute() or not path.parts:
        raise ValueError("A source file path is invalid.")
    return path.as_posix()


class ExecutionRequest(BaseModel):
    """Source files and bounded runtime options for one isolated execution."""

    model_config = ConfigDict(extra="forbid")

    language: Language
    source_files: dict[str, str] = Field(min_length=1, max_length=100)
    entrypoint: str = Field(min_length=1, max_length=240)
    timeout_seconds: int = Field(
        default_factory=_default_timeout_seconds, ge=1, le=120, strict=True
    )
    test_command: str | None = Field(default=None, max_length=64)

    @field_validator("source_files")
    @classmethod
    def validate_source_size(cls, files: dict[str, str]) -> dict[str, str]:
        total_size = 0
        for path, content in files.items():
            if not isinstance(path, str) or not isinstance(content, str):
                raise ValueError("Source file paths and contents must be strings.")
            _validate_relative_path(path)
            file_size = len(content.encode("utf-8"))
            if file_size > 1_000_000:
                raise ValueError("A source file exceeds the 1 MB limit.")
            total_size += file_size
        if total_size > 4_000_000:
            raise ValueError("The combined source files exceed the 4 MB limit.")
        return files

    @model_validator(mode="after")
    def validate_request(self) -> "ExecutionRequest":
        allowed_command = _ALLOWED_TEST_COMMANDS[self.language]
        if self.test_command not in {None, allowed_command}:
            raise ValueError("The requested test command is not supported for this language.")

        normalized_source_paths: set[str] = set()
        for path in self.source_files:
            normalized = _validate_relative_path(path)
            if normalized in normalized_source_paths:
                raise ValueError("Source file paths must be unique.")
            normalized_source_paths.add(normalized)

        entrypoint = _validate_relative_path(self.entrypoint)
        if entrypoint not in normalized_source_paths:
            raise ValueError("The entry point must name a provided source file.")

        expected_suffix = {
            "python": ".py",
            "javascript": ".js",
            "typescript": ".ts",
        }[self.language]
        if PurePosixPath(entrypoint).suffix.lower() != expected_suffix:
            raise ValueError("The entry point extension does not match the selected language.")

        return self
