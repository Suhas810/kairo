"""Resource-limited Docker CLI invocation for untrusted source code."""

import os
import shutil
import subprocess
import tempfile
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence
from uuid import UUID, uuid4

from runner.output import ExecutionStatus, bounded_text

MAX_OUTPUT_BYTES = 64_000
KILL_TIMEOUT_SECONDS = 5
POLL_INTERVAL_SECONDS = 0.02
@dataclass(frozen=True)
class ProcessResult:
    """Sanitized result from one Docker CLI run."""

    status: ExecutionStatus
    exit_code: int | None
    stdout: str
    stderr: str
    duration_ms: int
    timed_out: bool = False
    output_truncated: bool = False
    error: str | None = None


class _BoundedCapture:
    """Drain both subprocess streams while retaining at most a combined byte cap."""

    def __init__(self, limit: int) -> None:
        self.limit = limit
        self.lock = threading.Lock()
        self.stdout = bytearray()
        self.stderr = bytearray()
        self.total = 0
        self.truncated = threading.Event()

    def drain(self, stream, destination: bytearray) -> None:
        try:
            while True:
                chunk = stream.read(8192)
                if not chunk:
                    return
                with self.lock:
                    remaining = max(0, self.limit - self.total)
                    kept = chunk[:remaining]
                    destination.extend(kept)
                    self.total += len(kept)
                    if len(kept) != len(chunk):
                        self.truncated.set()
        finally:
            stream.close()


def _container_identity(execution_id: UUID | str) -> str:
    """Normalize an internally generated identifier before using it as an option value."""
    try:
        return f"kairo-exec-{UUID(str(execution_id))}"
    except ValueError as exc:
        raise ValueError("An internal execution identifier is invalid.") from exc


def _docker_command(
    image: str,
    command: Sequence[str],
    workspace: Path,
    container_name: str,
    cid_file: Path | None = None,
) -> list[str]:
    """Build only fixed Docker options and a trusted, predefined image name."""
    if image not in {
        "kairo-sandbox-python:1",
        "kairo-sandbox-javascript:1",
        "kairo-sandbox-typescript:1",
    }:
        raise ValueError("The requested execution image is not supported.")
    if not command or any(
        not isinstance(part, str) or "\x00" in part for part in command
    ):
        raise ValueError("The execution command is invalid.")
    allowed_executables = {
        "kairo-sandbox-python:1": {"python"},
        "kairo-sandbox-javascript:1": {"node"},
        "kairo-sandbox-typescript:1": {"run", "test"},
    }
    if command[0] not in allowed_executables[image]:
        raise ValueError("The execution command is not supported for this image.")
    if container_name != _container_identity(container_name.removeprefix("kairo-exec-")):
        raise ValueError("The execution container name is invalid.")

    uid = os.getuid() if hasattr(os, "getuid") else 10001
    gid = os.getgid() if hasattr(os, "getgid") else 10001
    if uid == 0:
        uid = gid = 10001
    docker_args = [
        "docker",
        "run",
        "--rm",
        "--init",
        "--pull=never",
        "--name",
        container_name,
    ]
    if cid_file is not None:
        docker_args.extend(["--cidfile", str(cid_file)])
    docker_args.extend([
        "--network=none",
        "--read-only",
        "--tmpfs",
        "/tmp:rw,noexec,nosuid,size=64m",
        "--cap-drop=ALL",
        "--security-opt=no-new-privileges:true",
        "--pids-limit=64",
        "--memory=256m",
        "--memory-swap=256m",
        "--cpus=1",
        "--ulimit=nofile=64:64",
        "--user",
        f"{uid}:{gid}",
        "--mount",
        f"type=bind,source={workspace.resolve()},target=/workspace,rw",
        image,
        *command,
    ])
    return docker_args


def _terminate_container(container_name: str, action: str) -> None:
    """Best-effort cleanup using a fixed Docker subcommand and generated name."""
    try:
        subprocess.run(
            ["docker", action, container_name],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
            timeout=KILL_TIMEOUT_SECONDS,
        )
    except (OSError, subprocess.SubprocessError):
        return


def run_container(
    image: str,
    command: Sequence[str],
    workspace: Path,
    timeout_seconds: int,
    execution_id: UUID | str,
    output_limit: int = MAX_OUTPUT_BYTES,
) -> ProcessResult:
    """Run fixed Docker images without a shell, cap output, and enforce a deadline."""
    if not 1 <= timeout_seconds <= 120:
        raise ValueError("The execution timeout is outside the allowed range.")
    if not 1 <= output_limit <= MAX_OUTPUT_BYTES:
        raise ValueError("The execution output limit is outside the allowed range.")
    container_name = _container_identity(execution_id)
    docker = shutil.which("docker")
    if docker is None:
        return ProcessResult(
            status="infrastructure_error",
            exit_code=None,
            stdout="",
            stderr="",
            duration_ms=0,
            error="Docker is not installed or is unavailable on the runner.",
        )

    cid_file = workspace.parent / f".{container_name}-{uuid4().hex}.cid"
    args = _docker_command(image, command, workspace, container_name, cid_file)
    args[0] = docker
    started = time.monotonic()
    try:
        process = subprocess.Popen(
            args,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=False,
            close_fds=True,
        )
    except OSError:
        cid_file.unlink(missing_ok=True)
        return ProcessResult(
            status="infrastructure_error",
            exit_code=None,
            stdout="",
            stderr="",
            duration_ms=round((time.monotonic() - started) * 1000),
            error="The Docker execution process could not be started.",
        )

    capture = _BoundedCapture(output_limit)
    assert process.stdout is not None
    assert process.stderr is not None
    readers = [
        threading.Thread(
            target=capture.drain, args=(process.stdout, capture.stdout), daemon=True
        ),
        threading.Thread(
            target=capture.drain, args=(process.stderr, capture.stderr), daemon=True
        ),
    ]
    for reader in readers:
        reader.start()

    timed_out = False
    container_started = False
    cleanup_failed = False
    try:
        deadline = started + timeout_seconds
        while process.poll() is None:
            if capture.truncated.is_set():
                _terminate_container(container_name, "kill")
                break
            if time.monotonic() >= deadline:
                timed_out = True
                _terminate_container(container_name, "kill")
                break
            time.sleep(POLL_INTERVAL_SECONDS)

        try:
            process.wait(timeout=KILL_TIMEOUT_SECONDS)
        except subprocess.TimeoutExpired:
            process.terminate()
            try:
                process.wait(timeout=KILL_TIMEOUT_SECONDS)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
    finally:
        if process.poll() is None:
            process.kill()
            process.wait()
        for reader in readers:
            reader.join(timeout=KILL_TIMEOUT_SECONDS)
        _terminate_container(container_name, "rm")
        container_started = cid_file.is_file()
        try:
            cid_file.unlink(missing_ok=True)
        except OSError:
            cleanup_failed = True

    duration_ms = round((time.monotonic() - started) * 1000)
    stdout, stdout_truncated = bounded_text(bytes(capture.stdout), output_limit)
    stderr, stderr_truncated = bounded_text(bytes(capture.stderr), output_limit)
    truncated = capture.truncated.is_set() or stdout_truncated or stderr_truncated

    if cleanup_failed:
        return ProcessResult(
            status="infrastructure_error",
            exit_code=process.returncode,
            stdout="",
            stderr="",
            duration_ms=duration_ms,
            error="The Docker execution metadata could not be cleaned up.",
        )
    if timed_out:
        return ProcessResult(
            status="timed_out",
            exit_code=process.returncode,
            stdout=stdout,
            stderr=stderr,
            duration_ms=duration_ms,
            timed_out=True,
            output_truncated=truncated,
            error="Execution exceeded its configured time limit.",
        )
    if truncated:
        return ProcessResult(
            status="failed",
            exit_code=process.returncode,
            stdout=stdout,
            stderr=stderr,
            duration_ms=duration_ms,
            output_truncated=True,
            error="Execution output exceeded the configured size limit.",
        )

    if not container_started:
        return ProcessResult(
            status="infrastructure_error",
            exit_code=process.returncode,
            stdout="",
            stderr="",
            duration_ms=duration_ms,
            error="The Docker image or daemon is unavailable.",
        )

    return ProcessResult(
        status="completed" if process.returncode == 0 else "failed",
        exit_code=process.returncode,
        stdout=stdout,
        stderr=stderr,
        duration_ms=duration_ms,
        error=None if process.returncode == 0 else "The execution process failed.",
    )
