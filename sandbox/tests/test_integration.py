"""Optional end-to-end tests; source only executes inside prebuilt Docker images."""

import shutil
import subprocess

import pytest

from runner.execute import execute
from runner.test_runner import run_tests

pytestmark = pytest.mark.integration

LANGUAGE_CASES = [
    (
        "python",
        "kairo-sandbox-python:1",
        "main.py",
        'print("sandbox-ok")',
    ),
    (
        "javascript",
        "kairo-sandbox-javascript:1",
        "main.js",
        'console.log("sandbox-ok");',
    ),
    (
        "typescript",
        "kairo-sandbox-typescript:1",
        "main.ts",
        'console.log("sandbox-ok");',
    ),
]


def _require_image(image: str) -> None:
    """Skip an integration case unless Docker and its prebuilt image are available."""
    docker = shutil.which("docker")
    if docker is None:
        pytest.skip("Docker is unavailable.")
    try:
        result = subprocess.run(
            [docker, "image", "inspect", image],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
            timeout=5,
        )
    except (OSError, subprocess.SubprocessError):
        pytest.skip("The Docker daemon is unavailable.")
    if result.returncode != 0:
        pytest.skip(f"The prebuilt {image} image is unavailable.")


@pytest.mark.parametrize(
    ("language", "image", "entrypoint", "source"),
    LANGUAGE_CASES,
)
def test_real_language_execution(language, image, entrypoint, source):
    _require_image(image)
    result = execute(
        {
            "language": language,
            "source_files": {entrypoint: source},
            "entrypoint": entrypoint,
            "timeout_seconds": 10,
        }
    )

    assert result.status == "completed"
    assert result.exit_code == 0
    assert "sandbox-ok" in result.stdout


def test_real_typescript_compile_error_is_not_success():
    _require_image("kairo-sandbox-typescript:1")
    result = execute(
        {
            "language": "typescript",
            "source_files": {"main.ts": "const value: number = 'not a number';"},
            "entrypoint": "main.ts",
            "timeout_seconds": 10,
        }
    )

    assert result.status == "failed"
    assert result.exit_code != 0


@pytest.mark.parametrize(
    ("language", "image", "entrypoint", "source"),
    [
        ("python", "kairo-sandbox-python:1", "test_main.py", "def test_ok():\n    assert 1 + 1 == 2\n"),
        (
            "javascript",
            "kairo-sandbox-javascript:1",
            "main.test.js",
            'const test = require("node:test");\n'
            'const assert = require("node:assert/strict");\n'
            'test("addition", () => assert.equal(1 + 1, 2));\n',
        ),
        (
            "typescript",
            "kairo-sandbox-typescript:1",
            "main.test.ts",
            'import test from "node:test";\n'
            'import assert from "node:assert/strict";\n'
            'test("addition", () => assert.equal(1 + 1, 2));\n',
        ),
    ],
)
def test_real_test_suites(language, image, entrypoint, source):
    _require_image(image)
    main_file = "main.py" if language == "python" else (
        "main.js" if language == "javascript" else "main.ts"
    )
    main_source = (
        "pass\n"
        if language == "python"
        else "console.log('ready');\n"
    )
    result = run_tests(
        {
            "language": language,
            "source_files": {main_file: main_source, entrypoint: source},
            "entrypoint": main_file,
            "timeout_seconds": 15,
        }
    )

    assert result.status == "completed"
    assert result.tests_run == 1
    assert result.tests_passed == 1
    assert result.tests_failed == 0


def test_real_execution_timeout_stops_container():
    _require_image("kairo-sandbox-python:1")
    result = execute(
        {
            "language": "python",
            "source_files": {"main.py": "while True:\n    pass\n"},
            "entrypoint": "main.py",
            "timeout_seconds": 1,
        }
    )

    assert result.status == "timed_out"
    assert result.timed_out
