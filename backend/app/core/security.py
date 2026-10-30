"""Security utilities, constant-time validation, and path traversal guards."""

import hmac
import os
import re
from pathlib import Path, PurePosixPath

from fastapi import status
from app.core.exceptions import api_error


def verify_hmac_sha256(secret: str, payload: bytes, signature_header: str) -> bool:
    """Verify an HMAC-SHA256 signature in constant time."""
    if not secret or not signature_header:
        return False
    match = re.fullmatch(r"sha256=([0-9a-fA-F]{64})", signature_header.strip())
    if not match:
        return False
    expected = hmac.new(secret.encode("utf-8"), payload, "sha256").hexdigest()
    return hmac.compare_digest(expected.lower(), match.group(1).lower())


def validate_safe_relative_path(path_str: str) -> str:
    """Ensure a file path is safe, relative, posix, and does not escape workspace."""
    if (
        not path_str
        or "\x00" in path_str
        or "\\" in path_str
        or ":" in path_str
        or path_str.startswith("/")
    ):
        raise api_error(
            status.HTTP_400_BAD_REQUEST,
            "INVALID_PATH",
            "Path cannot be absolute, contain backslashes or null bytes.",
        )

    parts = path_str.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise api_error(
            status.HTTP_400_BAD_REQUEST,
            "PATH_TRAVERSAL_DETECTED",
            "Path traversal components are not permitted.",
        )

    posix_path = PurePosixPath(path_str)
    if posix_path.is_absolute() or not posix_path.parts:
        raise api_error(
            status.HTTP_400_BAD_REQUEST,
            "INVALID_PATH",
            "Invalid file path.",
        )
    return posix_path.as_posix()


def is_safe_workspace_file(workspace_root: Path, target_path: Path) -> bool:
    """Verify target_path resolves strictly within workspace_root."""
    try:
        resolved_root = workspace_root.resolve()
        resolved_target = target_path.resolve()
        return resolved_target.is_relative_to(resolved_root)
    except (ValueError, OSError):
        return False

