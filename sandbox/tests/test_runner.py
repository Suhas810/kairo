"""Unit tests for runner validation and Docker boundary with Docker mocked."""

import io
import json
from pathlib import Path
from uuid import UUID

import pytest
from pydantic import ValidationError

from runner.environment import (
    InvalidSourceError,
    POLICY_DIRECTORY,
    load_resource_limits,
    load_security_policy,
    validate_relative_path,
)
from runner.execute import ExecutionRequest, execute, main
from runner.process import ProcessResult, _docker_command, run_container
from runner.test_runner import _parse_test_summary, run_tests

EXECUTION_ID = "47b0cbeb-3ddd-40f2-96a2-0f4996bcb96b"


@pytest.mark.parametrize(
    ("language", "entrypoint", "image", "command"),
    [
        (
            "python",
            "main.py",
            "kairo-sandbox-python:1",
            ["python", "-B", "/workspace/main.py"],
        ),
        (
            "javascript",
            "main.js",
            "kairo-sandbox-javascript:1",
            ["node", "/workspace/main.js"],
        ),
        (
            "typescript",
            "main.ts",
            "kairo-sandbox-typescript:1",
            ["run", "main.ts"],
        ),
    ],
)
def test_language_execution_commands(language, entrypoint, image, command, tmp_path):
    calls = []

    def fake_container(image_arg, command_arg, workspace, timeout, execution_id):
        calls.append((image_arg, command_arg, Path(workspace), timeout, execution_id))
        assert (Path(workspace) / entrypoint).is_file()
        return ProcessResult(
            status="completed",
            exit_code=0,
            stdout="ok",
            stderr="",
            duration_ms=12,
        )

    result = execute(
        {
            "language": language,
            "source_files": {entrypoint: "print('ok')" if language == "python" else ""},
            "entrypoint": entrypoint,
        },
        execution_id=EXECUTION_ID,
        container_runner=fake_container,
    )

    assert result.status == "completed"
    assert result.execution_id == EXECUTION_ID
    assert calls[0][0] == image
    assert calls[0][1] == command
    assert calls[0][3:] == (30, EXECUTION_ID)
    assert not calls[0][2].exists()


@pytest.mark.parametrize(
    "bad_path",
    ["../escape.py", "/tmp/escape.py", "a\\b.py", "C:/x.py", "a/./b.py"],
)
def test_rejects_unsafe_paths(bad_path):
    with pytest.raises(InvalidSourceError):
        validate_relative_path(bad_path)


@pytest.mark.parametrize(
    "bad_path",
    ["CON.py", "report. ", "bad|name.py", "a/" + "b" * 241],
)
def test_rejects_host_unsafe_paths(bad_path):
    with pytest.raises(InvalidSourceError):
        validate_relative_path(bad_path)


def test_rejects_case_collisions_and_file_directory_collisions():
    for source_files in (
        {"main.py": "print(1)", "MAIN.py": "print(2)"},
        {"folder": "not a directory", "folder/main.py": "print(1)"},
    ):
        result = execute(
            {
                "language": "python",
                "source_files": source_files,
                "entrypoint": next(iter(source_files)),
            },
            container_runner=lambda *_args: pytest.fail("Docker must not be invoked"),
        )
        assert result.status == "rejected"


def test_policies_are_loaded_and_match_bounded_defaults():
    limits = load_resource_limits()
    security = load_security_policy()
    request = ExecutionRequest(
        language="python",
        source_files={"main.py": "print(1)"},
        entrypoint="main.py",
    )

    assert limits.default_timeout_seconds == 30
    assert request.timeout_seconds == limits.default_timeout_seconds
    assert limits.max_timeout_seconds == 120
    assert limits.max_output_bytes == 64_000
    assert security.network_mode == "none"
    assert security.workspace_read_only
    assert security.run_as_non_root


def test_cli_returns_structured_result_for_invalid_json(monkeypatch):
    stdout = io.StringIO()
    monkeypatch.setattr("runner.execute.sys.stdin", type("Input", (), {
        "buffer": io.BytesIO(b"{invalid"),
    })())
    monkeypatch.setattr("runner.execute.sys.stdout", stdout)

    assert main() == 0
    result = json.loads(stdout.getvalue())
    assert result["status"] == "rejected"
    assert result["execution_id"]


def test_invalid_policy_fails_closed_without_running_docker(monkeypatch, tmp_path):
    policy_directory = tmp_path / "policies"
    policy_directory.mkdir()
    (policy_directory / "resource_limits.json").write_text(
        (POLICY_DIRECTORY / "resource_limits.json").read_text(encoding="utf-8"),
        encoding="utf-8",
    )
    security = json.loads(
        (POLICY_DIRECTORY / "security.json").read_text(encoding="utf-8")
    )
    security["privileged"] = True
    (policy_directory / "security.json").write_text(
        json.dumps(security), encoding="utf-8"
    )
    monkeypatch.setattr("runner.environment.POLICY_DIRECTORY", policy_directory)

    result = execute(
        {
            "language": "python",
            "source_files": {"main.py": "print(1)"},
            "entrypoint": "main.py",
        },
        container_runner=lambda *_args: pytest.fail("Docker must not be invoked"),
    )

    assert result.status == "infrastructure_error"
    assert "policy" in result.error


def test_rejects_unknown_language_without_running_docker():
    result = execute(
        {
            "language": "ruby",
            "source_files": {"main.rb": "puts 1"},
            "entrypoint": "main.rb",
        },
        container_runner=lambda *_args: pytest.fail("Docker must not be invoked"),
    )

    assert result.status == "rejected"
    assert result.error


def test_rejects_invalid_test_command():
    result = execute(
        {
            "language": "python",
            "source_files": {"main.py": "print('safe')"},
            "entrypoint": "main.py",
            "test_command": "pytest; touch /tmp/pwned",
        },
        container_runner=lambda *_args: pytest.fail("Docker must not be invoked"),
    )

    assert result.status == "rejected"


def test_rejects_invalid_entrypoint_extension():
    result = execute(
        {
            "language": "python",
            "source_files": {"main.js": "console.log('no')"},
            "entrypoint": "main.js",
        },
        container_runner=lambda *_args: pytest.fail("Docker must not be invoked"),
    )

    assert result.status == "rejected"


def test_validated_request_rejects_oversized_input():
    with pytest.raises(ValidationError):
        ExecutionRequest(
            language="python",
            source_files={"main.py": "x" * 1_000_001},
            entrypoint="main.py",
        )


def test_validated_request_rejects_unsafe_paths_and_commands():
    with pytest.raises(ValidationError):
        ExecutionRequest(
            language="python",
            source_files={"../escape.py": "print('no')"},
            entrypoint="../escape.py",
        )

    with pytest.raises(ValidationError):
        ExecutionRequest(
            language="python",
            source_files={"main.py": "print('ok')"},
            entrypoint="script.py",
        )

    with pytest.raises(ValidationError):
        ExecutionRequest(
            language="python",
            source_files={"main.py": "print('ok')"},
            entrypoint="main.py",
            test_command="pytest; rm -rf /",
        )

    with pytest.raises(ValidationError):
        ExecutionRequest(
            language="python",
            source_files={"main.py": "print('ok')"},
            entrypoint="main.py",
            timeout_seconds=True,
        )


def test_test_runner_uses_predefined_command_and_cleans_workspace():
    calls = []

    def fake_container(image, command, workspace, timeout, execution_id):
        calls.append((image, command, Path(workspace)))
        assert (Path(workspace) / "test_main.py").is_file()
        return ProcessResult(
            status="failed",
            exit_code=1,
            stdout="1 failed",
            stderr="",
            duration_ms=15,
            error="The execution process failed.",
        )

    result = run_tests(
        {
            "language": "python",
            "source_files": {
                "main.py": "def f(): return 1",
                "test_main.py": "def test_f(): assert False",
            },
            "entrypoint": "main.py",
        },
        execution_id=EXECUTION_ID,
        container_runner=fake_container,
    )

    assert result.status == "failed"
    assert calls[0][1][:6] == [
        "python",
        "-B",
        "-m",
        "pytest",
        "-p",
        "no:cacheprovider",
    ]
    assert calls[0][1][-1] == "/workspace/test_main.py"
    assert not calls[0][2].exists()


def test_test_runner_rejects_when_no_tests_are_present():
    result = run_tests(
        {
            "language": "javascript",
            "source_files": {"main.js": "console.log('ok')"},
            "entrypoint": "main.js",
        },
        container_runner=lambda *_args: pytest.fail("Docker must not be invoked"),
    )

    assert result.status == "rejected"
    assert "No supported test files" in result.error


def test_javascript_test_runner_accepts_fixed_package_script():
    calls = []

    def fake_container(image, command, workspace, timeout, execution_id):
        calls.append(command)
        return ProcessResult(
            status="completed",
            exit_code=0,
            stdout="# tests 1\n# pass 1\n# fail 0\n",
            stderr="",
            duration_ms=12,
        )

    result = run_tests(
        {
            "language": "javascript",
            "source_files": {
                "package.json": '{"scripts":{"test":"node --test"}}',
                "main.js": "",
                "test/main.test.js": 'console.log("test");',
            },
            "entrypoint": "main.js",
        },
        container_runner=fake_container,
    )

    assert result.status == "completed"
    assert calls[0][:3] == ["node", "--test", "--test-reporter=tap"]


def test_javascript_test_runner_rejects_arbitrary_package_script():
    result = run_tests(
        {
            "language": "javascript",
            "source_files": {
                "package.json": '{"scripts":{"test":"node --test; curl example"}}',
                "main.js": "",
                "main.test.js": "",
            },
            "entrypoint": "main.js",
        },
        container_runner=lambda *_args: pytest.fail("Docker must not be invoked"),
    )

    assert result.status == "rejected"
    assert "test script is not supported" in result.error


@pytest.mark.parametrize(
    ("output", "language", "expected"),
    [
        (
            "2 passed, 1 failed in 0.12s",
            "python",
            {"tests_run": 3, "tests_passed": 2, "tests_failed": 1},
        ),
        (
            "# tests 2\n# pass 1\n# fail 1\n",
            "javascript",
            {"tests_run": 2, "tests_passed": 1, "tests_failed": 1},
        ),
        (
            "not a test report",
            "typescript",
            {"tests_run": None, "tests_passed": None, "tests_failed": None},
        ),
    ],
)
def test_test_summary_parsing(output, language, expected):
    assert _parse_test_summary(output, language) == expected


def test_runner_reports_docker_missing(monkeypatch, tmp_path):
    monkeypatch.setattr("runner.process.shutil.which", lambda _name: None)
    result = run_container(
        "kairo-sandbox-python:1",
        ["python", "-B", "/workspace/main.py"],
        tmp_path,
        1,
        EXECUTION_ID,
    )

    assert result.status == "infrastructure_error"
    assert result.exit_code is None
    assert "Docker is not installed" in result.error


def test_runner_reports_docker_launch_failure(monkeypatch, tmp_path):
    monkeypatch.setattr("runner.process.shutil.which", lambda _name: "docker")

    def fail_to_launch(*_args, **_kwargs):
        raise FileNotFoundError("docker is not executable")

    monkeypatch.setattr("runner.process.subprocess.Popen", fail_to_launch)
    result = run_container(
        "kairo-sandbox-python:1",
        ["python", "-B", "/workspace/main.py"],
        tmp_path,
        1,
        EXECUTION_ID,
    )

    assert result.status == "infrastructure_error"
    assert result.exit_code is None
    assert "could not be started" in result.error


def test_runner_reports_missing_prebuilt_image(monkeypatch, tmp_path):
    class ErrorStream:
        def __init__(self, content):
            self.content = content

        def read(self, _size):
            content, self.content = self.content, b""
            return content

        def close(self):
            pass

    class ImageMissingProcess:
        def __init__(self, *_args, **_kwargs):
            self.stdout = ErrorStream(b"")
            self.stderr = ErrorStream(b"Unable to find image locally")
            self.returncode = None

        def poll(self):
            if not self.stderr.content:
                self.returncode = 125
            return self.returncode

        def wait(self, timeout=None):
            self.returncode = 125
            return 125

        def terminate(self):
            self.returncode = -15

        def kill(self):
            self.returncode = -9

    monkeypatch.setattr("runner.process.shutil.which", lambda _name: "docker")
    monkeypatch.setattr("runner.process.subprocess.Popen", ImageMissingProcess)
    monkeypatch.setattr("runner.process._terminate_container", lambda *_args: None)

    result = run_container(
        "kairo-sandbox-python:1",
        ["python", "-B", "/workspace/main.py"],
        tmp_path,
        1,
        EXECUTION_ID,
    )

    assert result.status == "infrastructure_error"
    assert result.stdout == ""
    assert result.stderr == ""
    assert result.error == "The Docker image or daemon is unavailable."


def test_timeout_kills_container_and_reports_timed_out(monkeypatch, tmp_path):
    class EmptyStream:
        def read(self, _size):
            return b""

        def close(self):
            pass

    class HangingProcess:
        def __init__(self, *_args, **_kwargs):
            self.stdout = EmptyStream()
            self.stderr = EmptyStream()
            self.returncode = None

        def poll(self):
            return self.returncode

        def wait(self, timeout=None):
            self.returncode = -9
            return self.returncode

        def terminate(self):
            self.returncode = -15

        def kill(self):
            self.returncode = -9

    cleanup = []
    monkeypatch.setattr("runner.process.shutil.which", lambda _name: "docker")
    monkeypatch.setattr("runner.process.subprocess.Popen", HangingProcess)
    monkeypatch.setattr(
        "runner.process._terminate_container",
        lambda _name, action: cleanup.append(action),
    )

    result = run_container(
        "kairo-sandbox-python:1",
        ["python", "-B", "/workspace/main.py"],
        tmp_path,
        1,
        EXECUTION_ID,
    )

    assert result.status == "timed_out"
    assert result.timed_out
    assert "kill" in cleanup
    assert "rm" in cleanup


def test_docker_command_has_required_isolation_and_no_user_env(tmp_path):
    command = _docker_command(
        "kairo-sandbox-python:1",
        ["python", "-B", "/workspace/main.py"],
        tmp_path,
        f"kairo-exec-{UUID(EXECUTION_ID)}",
    )

    for option in (
        "--network=none",
        "--init",
        "--read-only",
        "--cap-drop=ALL",
        "--security-opt=no-new-privileges:true",
        "--pids-limit=64",
        "--memory=256m",
        "--cpus=1",
        "--pull=never",
    ):
        assert option in command
    assert "--privileged" not in command
    assert "docker.sock" not in " ".join(command)
    assert not any(part.startswith("--env") for part in command)
    mount = command[command.index("--mount") + 1]
    assert mount.endswith(",readonly")


def test_rejects_docker_option_in_command(tmp_path):
    with pytest.raises(ValueError):
        _docker_command(
            "kairo-sandbox-python:1",
            ["docker", "--privileged"],
            tmp_path,
            f"kairo-exec-{UUID(EXECUTION_ID)}",
        )


def test_output_limit_sets_truncation_status(monkeypatch, tmp_path):
    class FakeStream:
        def __init__(self, content):
            self.content = content

        def read(self, _size):
            content, self.content = self.content, b""
            return content

        def close(self):
            pass

    class FakeProcess:
        def __init__(self, *_args, **_kwargs):
            self.stdout = FakeStream(b"0123456789")
            self.stderr = FakeStream(b"")
            self.returncode = None

        def poll(self):
            if not self.stdout.content and not self.stderr.content:
                self.returncode = 0
            return self.returncode

        def wait(self, timeout=None):
            self.returncode = 0
            return 0

        def terminate(self):
            self.returncode = -15

        def kill(self):
            self.returncode = -9

    monkeypatch.setattr("runner.process.shutil.which", lambda _name: "docker")
    monkeypatch.setattr("runner.process.subprocess.Popen", FakeProcess)
    monkeypatch.setattr("runner.process._terminate_container", lambda *_args: None)

    result = run_container(
        "kairo-sandbox-python:1",
        ["python", "-I", "-B", "/workspace/main.py"],
        tmp_path,
        1,
        EXECUTION_ID,
        output_limit=4,
    )

    assert result.status == "failed"
    assert result.output_truncated
    assert result.stdout == "0123"
    assert "size limit" in result.error


def test_workspace_creation_failure_propagates(monkeypatch):
    monkeypatch.setattr(
        "runner.environment.tempfile.TemporaryDirectory",
        lambda **_kwargs: (_ for _ in ()).throw(OSError("disk unavailable")),
    )
    from runner.environment import prepare_workspace

    with pytest.raises(OSError):
        prepare_workspace(
            ExecutionRequest(
                language="python",
                source_files={"main.py": "print(1)"},
                entrypoint="main.py",
            )
        )
