"""Trusted language image selection and temporary workspace preparation."""

import os
import tempfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath

from runner.models import ExecutionRequest

MAX_SOURCE_BYTES = 4_000_000


class InvalidSourceError(ValueError):
    """Raised when source paths cannot be safely written into the workspace."""


@dataclass(frozen=True)
class LanguageEnvironment:
    """Predefined image and command configuration for a supported language."""

    image: str
    extension: str
    test_command: str


LANGUAGE_ENVIRONMENTS: dict[str, LanguageEnvironment] = {
    "python": LanguageEnvironment(
        image="kairo-sandbox-python:1",
        extension=".py",
        test_command="pytest",
    ),
    "javascript": LanguageEnvironment(
        image="kairo-sandbox-javascript:1",
        extension=".js",
        test_command="node --test",
    ),
    "typescript": LanguageEnvironment(
        image="kairo-sandbox-typescript:1",
        extension=".ts",
        test_command="typescript",
    ),
}


def get_language_environment(language: str) -> LanguageEnvironment:
    """Look up a fixed, locally built image; never accept an image from a request."""
    try:
        return LANGUAGE_ENVIRONMENTS[language]
    except KeyError as exc:
        raise InvalidSourceError("Unsupported execution language.") from exc


def validate_relative_path(value: str) -> PurePosixPath:
    """Reject absolute paths, traversal, platform-specific roots, and bad names."""
    if (
        not value
        or "\x00" in value
        or "\\" in value
        or ":" in value
        or value.startswith("/")
    ):
        raise InvalidSourceError("A source file path is invalid.")

    parts = value.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise InvalidSourceError("A source file path is invalid.")

    path = PurePosixPath(value)
    if path.is_absolute() or not path.parts:
        raise InvalidSourceError("A source file path is invalid.")
    return path


def validate_request_files(request: ExecutionRequest) -> None:
    """Ensure file paths and the entry point remain inside the workspace."""
    environment = get_language_environment(request.language)
    if request.test_command not in {None, environment.test_command}:
        raise InvalidSourceError(
            "The requested test command is not supported for this language."
        )

    normalized: dict[str, PurePosixPath] = {}
    for raw_path in request.source_files:
        path = validate_relative_path(raw_path)
        key = path.as_posix()
        if key in normalized:
            raise InvalidSourceError("Source file paths must be unique.")
        normalized[key] = path

    entrypoint = validate_relative_path(request.entrypoint)
    if entrypoint.as_posix() not in normalized:
        raise InvalidSourceError("The entry point must name a provided source file.")
    if entrypoint.suffix.lower() != environment.extension:
        raise InvalidSourceError(
            "The entry point extension does not match the selected language."
        )

    total_size = sum(len(content.encode("utf-8")) for content in request.source_files.values())
    if total_size > MAX_SOURCE_BYTES:
        raise InvalidSourceError("The combined source files exceed the 4 MB limit.")


def prepare_workspace(request: ExecutionRequest) -> tempfile.TemporaryDirectory:
    """Write validated source to a unique workspace and return its cleanup handle."""
    validate_request_files(request)
    temporary = tempfile.TemporaryDirectory(prefix="kairo-execution-")
    root = Path(temporary.name).resolve()
    try:
        for raw_path, content in request.source_files.items():
            relative = validate_relative_path(raw_path)
            target = (root / Path(*relative.parts)).resolve()
            try:
                target.relative_to(root)
            except ValueError as exc:
                raise InvalidSourceError("A source file path escapes its workspace.") from exc
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8", newline="")

        if hasattr(os, "getuid") and hasattr(os, "getgid"):
            uid, gid = os.getuid(), os.getgid()
            if uid == 0:
                uid = gid = 10001
                for directory, _, filenames in os.walk(root):
                    os.chown(directory, uid, gid)
                    for filename in filenames:
                        os.chown(Path(directory) / filename, uid, gid)
            else:
                os.chown(root, uid, gid)
    except Exception:
        temporary.cleanup()
        raise
    return temporary
