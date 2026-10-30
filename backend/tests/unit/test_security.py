"""Security tests: path traversal, secret sanitization, and HMAC verification."""

import pytest
from fastapi import HTTPException

from app.core.logging import sanitize_log_message
from app.core.security import validate_safe_relative_path, verify_hmac_sha256


def test_sanitize_log_message_redacts_tokens():
    msg = "User logged in with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz and api_key=nvapi-secret123"
    sanitized = sanitize_log_message(msg)
    assert "Bearer [REDACTED]" in sanitized
    assert "api_key=[REDACTED]" in sanitized
    assert "nvapi-secret123" not in sanitized


@pytest.mark.parametrize(
    "bad_path",
    [
        "../etc/passwd",
        "/absolute/path/file.py",
        "nested/../../secret.txt",
        "file\x00name.py",
        "c:\\windows\\system32",
        "test/./file.py",
    ],
)
def test_path_traversal_rejection(bad_path: str):
    with pytest.raises(HTTPException) as exc_info:
        validate_safe_relative_path(bad_path)
    assert exc_info.value.status_code == 400


def test_valid_safe_relative_path():
    assert validate_safe_relative_path("src/app/main.py") == "src/app/main.py"
    assert validate_safe_relative_path("utils.py") == "utils.py"


def test_verify_hmac_sha256():
    import hashlib
    import hmac

    secret = "kairo-webhook-secret"
    payload = b'{"event":"test"}'
    signature = "sha256=" + hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()

    assert verify_hmac_sha256(secret, payload, signature) is True
    assert verify_hmac_sha256(secret, payload, "sha256=invalid") is False
    assert verify_hmac_sha256("wrong-secret", payload, signature) is False

