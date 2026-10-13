"""Consistent structured API errors."""

from fastapi import HTTPException


def api_error(
    status_code: int,
    code: str,
    message: str,
    details: dict | None = None,
) -> HTTPException:
    """Build an HTTP error using the public API error format."""
    return HTTPException(
        status_code=status_code,
        detail={"code": code, "message": message, "details": details or {}},
    )
