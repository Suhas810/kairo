"""Public execution interface and JSON-lines runner entry point."""

import json
import sys
import time
from pathlib import Path
from typing import Any, Mapping
from uuid import uuid4

from pydantic import ValidationError

from runner.environment import (
    InvalidSourceError,
    get_language_environment,
    prepare_workspace,
    validate_request_files,
)
from runner.models import ExecutionRequest, Language
from runner.output import ExecutionResult
from runner.process import ProcessResult, run_container

MAX_REQUEST_BYTES = 24_000_000


def _docker_command(request: ExecutionRequest) -> list[str]:
    """Select a fixed language command using a validated workspace entry point."""
    path = f"/workspace/{request.entrypoint}"
    if request.language == "python":
        return ["python", "-B", path]
    if request.language == "javascript":
        return ["node", path]
    return ["run", request.entrypoint]


def _result(
    process_result: ProcessResult,
    language: Language,
) -> ExecutionResult:
    """Map internal process outcomes onto the public result schema."""
    return ExecutionResult(
        status=process_result.status,
        language=language,
        exit_code=process_result.exit_code,
        stdout=process_result.stdout,
        stderr=process_result.stderr,
        duration_ms=process_result.duration_ms,
        timed_out=process_result.timed_out,
        output_truncated=process_result.output_truncated,
        error=process_result.error,
    )


def execute(
    request: ExecutionRequest | Mapping[str, Any],
    *,
    execution_id: str | None = None,
    container_runner=run_container,
) -> ExecutionResult:
    """Execute validated source in a disposable, resource-limited Docker container.

    The source is never evaluated by this Python process. The runner must have
    access to a Docker daemon; execution containers receive only their temporary
    workspace and no application environment variables.
    """
    started = time.monotonic()
    try:
        parsed = (
            request
            if isinstance(request, ExecutionRequest)
            else ExecutionRequest.model_validate(request)
        )
        validate_request_files(parsed)
        environment = get_language_environment(parsed.language)
        temporary = prepare_workspace(parsed)
    except InvalidSourceError as exc:
        return ExecutionResult(
            status="rejected",
            language=request.language if isinstance(request, ExecutionRequest) else None,
            duration_ms=round((time.monotonic() - started) * 1000),
            error=str(exc),
        )
    except (ValidationError, ValueError, TypeError):
        return ExecutionResult(
            status="rejected",
            language=request.language if isinstance(request, ExecutionRequest) else None,
            duration_ms=round((time.monotonic() - started) * 1000),
            error="The execution request is invalid.",
        )
    except OSError:
        return ExecutionResult(
            status="infrastructure_error",
            language=request.language if isinstance(request, ExecutionRequest) else None,
            duration_ms=round((time.monotonic() - started) * 1000),
            error="The temporary execution workspace could not be prepared.",
        )

    result: ExecutionResult
    try:
        process_result = container_runner(
            environment.image,
            _docker_command(parsed),
            Path(temporary.name),
            parsed.timeout_seconds,
            execution_id or str(uuid4()),
        )
        result = _result(process_result, parsed.language)
    except (OSError, RuntimeError, ValueError):
        result = ExecutionResult(
            status="infrastructure_error",
            language=parsed.language,
            duration_ms=round((time.monotonic() - started) * 1000),
            error="The isolated execution service could not be started.",
        )
    finally:
        try:
            temporary.cleanup()
        except OSError:
            result = ExecutionResult(
                status="infrastructure_error",
                language=parsed.language,
                duration_ms=round((time.monotonic() - started) * 1000),
                error="The temporary execution workspace could not be cleaned up.",
            )
    return result


def main() -> int:
    """Read one JSON request from stdin and emit one JSON result to stdout."""
    try:
        request_bytes = sys.stdin.buffer.read(MAX_REQUEST_BYTES + 1)
        if len(request_bytes) > MAX_REQUEST_BYTES:
            raise ValueError("The execution request exceeds the size limit.")
        request = json.loads(request_bytes)
    except ValueError:
        result = ExecutionResult(
            status="rejected",
            duration_ms=0,
            error="The execution request is invalid or exceeds the size limit.",
        )
    else:
        result = execute(request)
    sys.stdout.write(result.model_dump_json() + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
