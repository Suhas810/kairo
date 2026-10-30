"""Sandbox execution service connecting to the container runner and test runner."""

import difflib
import logging
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any
from uuid import uuid4

# Add repository root / sandbox to sys.path if not present so runner modules can be imported
_kairo_root = Path(__file__).resolve().parent.parent.parent.parent
_sandbox_path = _kairo_root / "sandbox"
if str(_sandbox_path) not in sys.path:
    sys.path.insert(0, str(_sandbox_path))

from app.core.config import get_settings
from app.core.exceptions import api_error
from app.core.security import validate_safe_relative_path

logger = logging.getLogger(__name__)


def generate_unified_diff(
    original_files: dict[str, str], modified_files: dict[str, str]
) -> str:
    """Compute unified diff across all changed files."""
    diff_chunks: list[str] = []
    all_paths = sorted(set(original_files.keys()) | set(modified_files.keys()))

    for path in all_paths:
        orig = original_files.get(path, "")
        mod = modified_files.get(path, "")
        if orig == mod:
            continue

        orig_lines = orig.splitlines(keepends=True)
        mod_lines = mod.splitlines(keepends=True)
        diff = difflib.unified_diff(
            orig_lines,
            mod_lines,
            fromfile=f"a/{path}",
            tofile=f"b/{path}",
        )
        diff_text = "".join(diff)
        if diff_text:
            diff_chunks.append(diff_text)

    return "\n".join(diff_chunks)


class SandboxExecutionService:
    """Orchestrates isolated code execution and testing with Docker and local fallback."""

    def __init__(self) -> None:
        self.settings = get_settings()

    def is_docker_available(self) -> bool:
        """Check if docker binary is present and daemon responds."""
        docker_bin = shutil.which("docker")
        if not docker_bin:
            return False
        try:
            res = subprocess.run(
                [docker_bin, "info"],
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
                timeout=2,
            )
            return res.returncode == 0
        except Exception:
            return False

    def execute_code(
        self,
        language: str,
        source_files: dict[str, str],
        entrypoint: str,
        timeout_seconds: int = 60,
        execution_id: str | None = None,
    ) -> dict[str, Any]:
        """Execute source files safely."""
        ident = execution_id or str(uuid4())
        # Validate paths
        for path in source_files:
            validate_safe_relative_path(path)
        validate_safe_relative_path(entrypoint)

        if self.is_docker_available():
            try:
                from runner.execute import execute as docker_execute
                result = docker_execute(
                    {
                        "language": language,
                        "source_files": source_files,
                        "entrypoint": entrypoint,
                        "timeout_seconds": timeout_seconds,
                    },
                    execution_id=ident,
                )
                return {
                    "execution_id": ident,
                    "status": result.status,
                    "exit_code": result.exit_code,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "duration_ms": result.duration_ms,
                    "timed_out": result.timed_out,
                    "error": result.error,
                    "runner": "docker",
                }
            except Exception as exc:
                logger.warning("Docker execution failed: %s; using isolated local runner", exc)

        # Isolated local subprocess fallback
        return self._run_isolated_subprocess(
            language=language,
            source_files=source_files,
            command_args=self._get_command(language, entrypoint),
            timeout_seconds=timeout_seconds,
            execution_id=ident,
        )

    def run_tests(
        self,
        language: str,
        source_files: dict[str, str],
        timeout_seconds: int = 60,
        execution_id: str | None = None,
    ) -> dict[str, Any]:
        """Run tests using test runner."""
        ident = execution_id or str(uuid4())
        for path in source_files:
            validate_safe_relative_path(path)

        if self.is_docker_available():
            try:
                from runner.test_runner import run_tests as docker_run_tests
                result = docker_run_tests(
                    {
                        "language": language,
                        "source_files": source_files,
                        "entrypoint": next(iter(source_files.keys())),
                        "timeout_seconds": timeout_seconds,
                    },
                    execution_id=ident,
                )
                return {
                    "execution_id": ident,
                    "status": result.status,
                    "exit_code": result.exit_code,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "duration_ms": result.duration_ms,
                    "tests_run": result.tests_run,
                    "tests_passed": result.tests_passed,
                    "tests_failed": result.tests_failed,
                    "timed_out": result.timed_out,
                    "error": result.error,
                    "runner": "docker",
                }
            except Exception as exc:
                logger.warning("Docker test runner failed: %s; using isolated local runner", exc)

        # Isolated test execution
        test_cmd = self._get_test_command(language, source_files)
        res = self._run_isolated_subprocess(
            language=language,
            source_files=source_files,
            command_args=test_cmd,
            timeout_seconds=timeout_seconds,
            execution_id=ident,
        )
        # Parse test metrics from stdout
        passed, failed, total = self._parse_tests(res["stdout"], language)
        res["tests_run"] = total
        res["tests_passed"] = passed
        res["tests_failed"] = failed
        return res

    def _get_command(self, language: str, entrypoint: str) -> list[str]:
        if language == "python":
            return [sys.executable, "-B", entrypoint]
        if language in ("javascript", "typescript"):
            node = shutil.which("node") or "node"
            return [node, entrypoint]
        return [sys.executable, entrypoint]

    def _get_test_command(self, language: str, source_files: dict[str, str]) -> list[str]:
        if language == "python":
            test_files = [
                p for p in source_files
                if (p.startswith("test_") or p.endswith("_test.py")) and p.endswith(".py")
            ]
            pytest_cmd = [sys.executable, "-m", "pytest", "-v"]
            if test_files:
                pytest_cmd.extend(test_files)
            return pytest_cmd

        node = shutil.which("node") or "node"
        test_files = [p for p in source_files if ".test." in p or ".spec." in p]
        return [node, "--test", *test_files]

    def _parse_tests(self, output: str, language: str) -> tuple[int, int, int]:
        import re
        if language == "python":
            # pytest style: 4 passed, 1 failed in 0.5s
            match = re.search(r"(\d+)\s+passed", output)
            passed = int(match.group(1)) if match else 0
            match_fail = re.search(r"(\d+)\s+failed", output)
            failed = int(match_fail.group(1)) if match_fail else 0
            total = passed + failed
            if total == 0 and "PASSED" in output:
                passed = output.count("PASSED")
                failed = output.count("FAILED")
                total = passed + failed
            return passed, failed, total

        # TAP style: # pass 4 / # fail 0
        match_p = re.search(r"#\s*pass\s+(\d+)", output)
        match_f = re.search(r"#\s*fail\s+(\d+)", output)
        passed = int(match_p.group(1)) if match_p else 0
        failed = int(match_f.group(1)) if match_f else 0
        return passed, failed, passed + failed

    def _run_isolated_subprocess(
        self,
        language: str,
        source_files: dict[str, str],
        command_args: list[str],
        timeout_seconds: int,
        execution_id: str,
    ) -> dict[str, Any]:
        """Execute command inside a clean, isolated temporary workspace directory."""
        temp_dir = tempfile.mkdtemp(prefix=f"kairo-sandbox-{execution_id}-")
        workspace_path = Path(temp_dir)
        started = time.monotonic()
        try:
            # Write source files safely
            for rel_path, content in source_files.items():
                dest = workspace_path / rel_path
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text(content, encoding="utf-8")

            # Environment scrubbing: strictly scrub environment variables
            safe_env = {
                "PATH": os.environ.get("PATH", ""),
                "SYSTEMROOT": os.environ.get("SYSTEMROOT", ""),
                "PYTHONUNBUFFERED": "1",
                "PYTHONDONTWRITEBYTECODE": "1",
                "TEMP": temp_dir,
                "TMP": temp_dir,
            }

            process = subprocess.run(
                command_args,
                cwd=temp_dir,
                env=safe_env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=timeout_seconds,
            )
            duration_ms = round((time.monotonic() - started) * 1000)
            status_val = "completed" if process.returncode == 0 else "failed"
            return {
                "execution_id": execution_id,
                "status": status_val,
                "exit_code": process.returncode,
                "stdout": process.stdout[:100_000],
                "stderr": process.stderr[:100_000],
                "duration_ms": duration_ms,
                "timed_out": False,
                "error": None if process.returncode == 0 else "Process exited with non-zero code.",
                "runner": "isolated_process",
            }
        except subprocess.TimeoutExpired:
            duration_ms = round((time.monotonic() - started) * 1000)
            return {
                "execution_id": execution_id,
                "status": "timed_out",
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Execution exceeded {timeout_seconds}s limit.",
                "duration_ms": duration_ms,
                "timed_out": True,
                "error": f"Execution timed out after {timeout_seconds}s.",
                "runner": "isolated_process",
            }
        except Exception as exc:
            duration_ms = round((time.monotonic() - started) * 1000)
            return {
                "execution_id": execution_id,
                "status": "infrastructure_error",
                "exit_code": None,
                "stdout": "",
                "stderr": str(exc),
                "duration_ms": duration_ms,
                "timed_out": False,
                "error": "Failed to run execution.",
                "runner": "isolated_process",
            }
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

