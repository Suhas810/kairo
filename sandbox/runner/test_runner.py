"""Safe, predefined test commands executed in the same Docker boundary."""

import re
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
from runner.execute import _result
from runner.models import ExecutionRequest
from runner.output import ExecutionResult, TestResult
from runner.process import ProcessResult, run_container


def _test_files(request: ExecutionRequest) -> list[str]:
    """Return deterministic test paths using language-specific filename patterns."""
    if request.language == "python":
        return sorted(
            path
            for path in request.source_files
            if (
                Path(path).name.startswith("test_") and path.endswith(".py")
            )
            or Path(path).name.endswith("_test.py")
        )
    extension = ".js" if request.language == "javascript" else ".ts"
    return sorted(
        path
        for path in request.source_files
        if path.endswith((f".test{extension}", f".spec{extension}"))
    )


def _test_command(request: ExecutionRequest, test_files: list[str]) -> list[str]:
    """Build only fixed test invocations; never interpret a user shell command."""
    workspace_paths = [f"/workspace/{path}" for path in test_files]
    if request.language == "python":
        return [
            "python",
            "-B",
            "-m",
            "pytest",
            "-p",
            "no:cacheprovider",
            *workspace_paths,
        ]
    if request.language == "javascript":
        return ["node", "--test", "--test-reporter=tap", *workspace_paths]
    return [
        "test",
        *test_files,
    ]


def _parse_test_summary(output: str, language: str) -> dict[str, int | None]:
    """Parse the standard concise pytest or Node TAP summary, if present."""
    if language == "python":
        summary_lines = [
            line
            for line in output.splitlines()
            if re.search(r"\bin\s+\d+(?:\.\d+)?s?\s*$", line.strip())
            and re.search(r"\b(?:passed|failed|error|errors|skipped)\b", line)
        ]
        if not summary_lines:
            return {"tests_run": None, "tests_passed": None, "tests_failed": None}

        counts = {
            label: int(count)
            for count, label in re.findall(
                r"(\d+)\s+(passed|failed|errors?|skipped|xfailed|xpassed)",
                summary_lines[-1],
            )
        }
        passed = counts.get("passed", 0)
        failed = counts.get("failed", 0) + counts.get("error", 0) + counts.get("errors", 0)
        total = sum(counts.values())
        return {
            "tests_run": total,
            "tests_passed": passed,
            "tests_failed": failed,
        }

    taps = {
        key: int(value)
        for key, value in re.findall(
            r"^\s*#\s*(tests|pass|fail)\s+(\d+)\s*$",
            output,
            flags=re.MULTILINE,
        )
    }
    if not {"tests", "pass", "fail"}.issubset(taps):
        return {"tests_run": None, "tests_passed": None, "tests_failed": None}
    return {
        "tests_run": taps["tests"],
        "tests_passed": taps["pass"],
        "tests_failed": taps["fail"],
    }


def run_tests(
    request: ExecutionRequest | Mapping[str, Any],
    *,
    execution_id: str | None = None,
    container_runner=run_container,
) -> TestResult:
    """Run discovered tests in a disposable container with execution limits."""
    try:
        parsed = (
            request
            if isinstance(request, ExecutionRequest)
            else ExecutionRequest.model_validate(request)
        )
        validate_request_files(parsed)
        environment = get_language_environment(parsed.language)
        tests = _test_files(parsed)
        if not tests:
            return TestResult(
                status="rejected",
                language=parsed.language,
                duration_ms=0,
                error="No supported test files were provided.",
            )
        temporary = prepare_workspace(parsed)
    except InvalidSourceError as exc:
        return TestResult(
            status="rejected",
            language=request.language if isinstance(request, ExecutionRequest) else None,
            duration_ms=0,
            error=str(exc),
        )
    except (ValidationError, ValueError, TypeError):
        return TestResult(
            status="rejected",
            language=request.language if isinstance(request, ExecutionRequest) else None,
            duration_ms=0,
            error="The test request is invalid.",
        )
    except OSError:
        return TestResult(
            status="infrastructure_error",
            language=request.language if isinstance(request, ExecutionRequest) else None,
            duration_ms=0,
            error="The temporary test workspace could not be prepared.",
        )

    result: TestResult
    try:
        process_result: ProcessResult = container_runner(
            environment.image,
            _test_command(parsed, tests),
            Path(temporary.name),
            parsed.timeout_seconds,
            execution_id or str(uuid4()),
        )
        execution_result: ExecutionResult = _result(process_result, parsed.language)
        result = TestResult(
            **execution_result.model_dump(),
            **_parse_test_summary(
                f"{execution_result.stdout}\n{execution_result.stderr}",
                parsed.language,
            ),
        )
    except (OSError, RuntimeError, ValueError):
        result = TestResult(
            status="infrastructure_error",
            language=parsed.language,
            duration_ms=0,
            error="The isolated test service could not be started.",
        )
    finally:
        try:
            temporary.cleanup()
        except OSError:
            result = ExecutionResult(
                status="infrastructure_error",
                language=parsed.language,
                duration_ms=result.duration_ms,
                error="The temporary test workspace could not be cleaned up.",
            )
    return result
