"""Unit tests for sandbox execution service and unified diff generation."""

import pytest
from app.services.sandbox_service import SandboxExecutionService, generate_unified_diff


def test_unified_diff_calculation():
    original = {"main.py": "def add(a, b):\n    return a + b\n"}
    modified = {"main.py": "def add(a, b):\n    # Added type hint\n    return int(a + b)\n"}

    diff = generate_unified_diff(original, modified)
    assert "--- a/main.py" in diff
    assert "+++ b/main.py" in diff
    assert "+    return int(a + b)" in diff


def test_sandbox_executes_python_code():
    service = SandboxExecutionService()
    files = {
        "hello.py": "print('Hello Kairo!')\n",
    }
    result = service.execute_code(
        language="python",
        source_files=files,
        entrypoint="hello.py",
        timeout_seconds=10,
    )

    assert result["status"] == "completed"
    assert result["exit_code"] == 0
    assert "Hello Kairo!" in result["stdout"]


def test_sandbox_runs_tests():
    service = SandboxExecutionService()
    files = {
        "calculator.py": "def add(x, y): return x + y\n",
        "test_calc.py": "from calculator import add\ndef test_add(): assert add(2, 3) == 5\n",
    }
    result = service.run_tests(
        language="python",
        source_files=files,
        timeout_seconds=15,
    )

    assert result["status"] == "completed"
    assert result["exit_code"] == 0
    assert result.get("tests_passed", 0) >= 1

