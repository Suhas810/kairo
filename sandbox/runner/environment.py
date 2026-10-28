"""Trusted language image selection and temporary workspace preparation."""

import json
import os
import re
import tempfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

from runner.models import ExecutionRequest

POLICY_DIRECTORY = Path(__file__).resolve().parent.parent / "policies"
_LANGUAGE_NAMES = {"python", "javascript", "typescript"}
_EXPECTED_IMAGES = {
    "python": "kairo-sandbox-python:1",
    "javascript": "kairo-sandbox-javascript:1",
    "typescript": "kairo-sandbox-typescript:1",
}
_EXPECTED_EXTENSIONS = {"python": ".py", "javascript": ".js", "typescript": ".ts"}
_EXPECTED_TEST_COMMANDS = {
    "python": "pytest",
    "javascript": "node --test",
    "typescript": "typescript",
}


class PolicyConfigurationError(RuntimeError):
    """Raised when trusted sandbox policy is missing or invalid."""


@dataclass(frozen=True)
class ResourceLimits:
    """Validated resource limits applied to requests and Docker containers."""

    default_timeout_seconds: int
    max_timeout_seconds: int
    cpu_count: float
    memory_bytes: int
    pid_limit: int
    max_output_bytes: int
    max_source_files: int
    max_source_file_bytes: int
    max_workspace_bytes: int
    temporary_storage_bytes: int


@dataclass(frozen=True)
class SecurityPolicy:
    """Immutable container isolation settings loaded from trusted policy."""

    images: dict[str, str]
    network_mode: str
    read_only_root_filesystem: bool
    workspace_read_only: bool
    temporary_path: str
    temporary_noexec: bool
    drop_capabilities: tuple[str, ...]
    no_new_privileges: bool
    run_as_non_root: bool
    automatic_image_pull: bool
    remove_after_execution: bool


def _read_policy(filename: str) -> dict[str, Any]:
    try:
        value = json.loads((POLICY_DIRECTORY / filename).read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise PolicyConfigurationError(
            f"The sandbox policy file {filename} is unavailable or invalid."
        ) from exc
    if not isinstance(value, dict):
        raise PolicyConfigurationError(f"The sandbox policy {filename} is invalid.")
    return value


def _integer(
    policy: dict[str, Any], key: str, *, minimum: int, maximum: int
) -> int:
    value = policy.get(key)
    if isinstance(value, bool) or not isinstance(value, int):
        raise PolicyConfigurationError(f"The sandbox resource policy {key} is invalid.")
    if not minimum <= value <= maximum:
        raise PolicyConfigurationError(f"The sandbox resource policy {key} is invalid.")
    return value


def load_resource_limits() -> ResourceLimits:
    """Load and validate the bounded resource policy."""
    policy = _read_policy("resource_limits.json")
    expected_keys = {
        "default_timeout_seconds",
        "max_timeout_seconds",
        "cpu_count",
        "memory_bytes",
        "pid_limit",
        "max_output_bytes",
        "max_source_files",
        "max_source_file_bytes",
        "max_workspace_bytes",
        "temporary_storage_bytes",
    }
    if set(policy) != expected_keys:
        raise PolicyConfigurationError("The sandbox resource policy is invalid.")
    default_timeout = _integer(
        policy, "default_timeout_seconds", minimum=1, maximum=120
    )
    max_timeout = _integer(policy, "max_timeout_seconds", minimum=1, maximum=120)
    if default_timeout > max_timeout:
        raise PolicyConfigurationError("The sandbox timeout policy is invalid.")

    cpu_count = policy.get("cpu_count")
    if (
        isinstance(cpu_count, bool)
        or not isinstance(cpu_count, (float, int))
        or not 0 < cpu_count <= 4
    ):
        raise PolicyConfigurationError("The sandbox CPU policy is invalid.")

    memory_bytes = _integer(
        policy, "memory_bytes", minimum=64_000_000, maximum=2_000_000_000
    )
    temporary_storage_bytes = _integer(
        policy, "temporary_storage_bytes", minimum=1_000_000, maximum=256_000_000
    )
    if memory_bytes % 1_048_576 or temporary_storage_bytes % 1_048_576:
        raise PolicyConfigurationError("The sandbox memory policy is invalid.")

    return ResourceLimits(
        default_timeout_seconds=default_timeout,
        max_timeout_seconds=max_timeout,
        cpu_count=float(cpu_count),
        memory_bytes=memory_bytes,
        pid_limit=_integer(policy, "pid_limit", minimum=1, maximum=256),
        max_output_bytes=_integer(
            policy, "max_output_bytes", minimum=1, maximum=1_000_000
        ),
        max_source_files=_integer(
            policy, "max_source_files", minimum=1, maximum=100
        ),
        max_source_file_bytes=_integer(
            policy, "max_source_file_bytes", minimum=1, maximum=1_000_000
        ),
        max_workspace_bytes=_integer(
            policy, "max_workspace_bytes", minimum=1, maximum=4_000_000
        ),
        temporary_storage_bytes=temporary_storage_bytes,
    )


def load_security_policy() -> SecurityPolicy:
    """Load and strictly validate immutable container-security settings."""
    policy = _read_policy("security.json")
    expected_keys = {
        "privileged",
        "host_network",
        "network_mode",
        "run_as_non_root",
        "read_only_root_filesystem",
        "workspace_read_only",
        "temporary_path",
        "temporary_noexec",
        "drop_capabilities",
        "no_new_privileges",
        "approved_images",
        "environment_allowlist",
        "devices",
        "automatic_image_pull",
        "remove_after_execution",
    }
    if set(policy) != expected_keys:
        raise PolicyConfigurationError("The sandbox security policy is invalid.")
    images = policy.get("approved_images")
    if not isinstance(images, dict) or images != _EXPECTED_IMAGES:
        raise PolicyConfigurationError("The approved sandbox images are invalid.")
    if (
        policy.get("privileged") is not False
        or policy.get("host_network") is not False
        or policy.get("network_mode") != "none"
        or policy.get("read_only_root_filesystem") is not True
        or policy.get("workspace_read_only") is not True
        or policy.get("temporary_path") != "/tmp"
        or policy.get("temporary_noexec") is not True
        or policy.get("drop_capabilities") != ["ALL"]
        or policy.get("no_new_privileges") is not True
        or policy.get("run_as_non_root") is not True
        or policy.get("remove_after_execution") is not True
        or policy.get("environment_allowlist") != []
        or policy.get("devices") != []
        or policy.get("automatic_image_pull") is not False
    ):
        raise PolicyConfigurationError("The sandbox security policy is invalid.")
    return SecurityPolicy(
        images=dict(images),
        network_mode="none",
        read_only_root_filesystem=True,
        workspace_read_only=True,
        temporary_path="/tmp",
        temporary_noexec=True,
        drop_capabilities=("ALL",),
        no_new_privileges=True,
        run_as_non_root=True,
        automatic_image_pull=False,
        remove_after_execution=True,
    )


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
    if language not in _LANGUAGE_NAMES:
        raise InvalidSourceError("Unsupported execution language.")
    security = load_security_policy()
    return LanguageEnvironment(
        image=security.images[language],
        extension=_EXPECTED_EXTENSIONS[language],
        test_command=_EXPECTED_TEST_COMMANDS[language],
    )


def validate_relative_path(value: str) -> PurePosixPath:
    """Reject absolute paths, traversal, platform-specific roots, and bad names."""
    if (
        not value
        or len(value) > 240
        or "\x00" in value
        or "\\" in value
        or ":" in value
        or value.startswith("/")
    ):
        raise InvalidSourceError("A source file path is invalid.")

    parts = value.split("/")
    reserved_windows_names = re.compile(
        r"^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$", re.IGNORECASE
    )
    for part in parts:
        if (
            part in {"", ".", ".."}
            or part.endswith((" ", "."))
            or any(ord(character) < 32 or character in '<>"|?*' for character in part)
            or reserved_windows_names.fullmatch(part)
        ):
            raise InvalidSourceError("A source file path is invalid.")

    path = PurePosixPath(value)
    if path.is_absolute() or not path.parts:
        raise InvalidSourceError("A source file path is invalid.")
    return path


def validate_request_files(request: ExecutionRequest) -> None:
    """Ensure file paths and the entry point remain inside the workspace."""
    limits = load_resource_limits()
    environment = get_language_environment(request.language)
    if request.timeout_seconds > limits.max_timeout_seconds:
        raise InvalidSourceError("The requested timeout exceeds the configured limit.")
    if request.test_command not in {None, environment.test_command}:
        raise InvalidSourceError(
            "The requested test command is not supported for this language."
        )

    if len(request.source_files) > limits.max_source_files:
        raise InvalidSourceError("The source file count exceeds the configured limit.")
    normalized: dict[str, PurePosixPath] = {}
    for raw_path in request.source_files:
        path = validate_relative_path(raw_path)
        key = path.as_posix().casefold()
        if key in normalized:
            raise InvalidSourceError("Source file paths must be unique.")
        normalized[key] = path

    source_paths = set(normalized)
    for key in source_paths:
        parts = key.split("/")
        if any("/".join(parts[:index]) in source_paths for index in range(1, len(parts))):
            raise InvalidSourceError("A source file path conflicts with a directory.")
    if any(
        len(content.encode("utf-8")) > limits.max_source_file_bytes
        for content in request.source_files.values()
    ):
        raise InvalidSourceError("A source file exceeds the configured size limit.")
    entrypoint = validate_relative_path(request.entrypoint)
    if entrypoint.as_posix() not in {
        path.as_posix() for path in normalized.values()
    }:
        raise InvalidSourceError("The entry point must name a provided source file.")
    if entrypoint.suffix.lower() != environment.extension:
        raise InvalidSourceError(
            "The entry point extension does not match the selected language."
        )

    total_size = sum(
        len(content.encode("utf-8")) for content in request.source_files.values()
    )
    if total_size > limits.max_workspace_bytes:
        raise InvalidSourceError("The combined source files exceed the configured limit.")


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

        if hasattr(os, "getuid") and os.getuid() == 0:
            for directory, _, filenames in os.walk(root):
                os.chown(directory, -1, 10001)
                Path(directory).chmod(0o750)
                for filename in filenames:
                    path = Path(directory) / filename
                    os.chown(path, -1, 10001)
                    path.chmod(0o640)
        elif hasattr(os, "getuid"):
            for directory, _, filenames in os.walk(root):
                Path(directory).chmod(0o700)
                for filename in filenames:
                    (Path(directory) / filename).chmod(0o600)
        else:
            for directory, _, filenames in os.walk(root):
                Path(directory).chmod(0o755)
                for filename in filenames:
                    (Path(directory) / filename).chmod(0o644)
    except Exception:
        temporary.cleanup()
        raise
    return temporary
