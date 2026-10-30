"""Structured application logging and log sanitization."""

import logging
import re
import sys
from typing import Any

# Sensitive patterns to redact from logs
_SECRET_PATTERNS = [
    re.compile(r"(bearer\s+)[A-Za-z0-9\-_.]+", re.IGNORECASE),
    re.compile(r"(api[_-]?key[\"']?\s*[:=]\s*[\"']?)[A-Za-z0-9\-_.]+", re.IGNORECASE),
    re.compile(r"(token[\"']?\s*[:=]\s*[\"']?)[A-Za-z0-9\-_.]+", re.IGNORECASE),
    re.compile(r"(service_role_key[\"']?\s*[:=]\s*[\"']?)[A-Za-z0-9\-_.]+", re.IGNORECASE),
    re.compile(r"(secret[\"']?\s*[:=]\s*[\"']?)[A-Za-z0-9\-_.]+", re.IGNORECASE),
    re.compile(r"(password[\"']?\s*[:=]\s*[\"']?)[^\s\"',]+", re.IGNORECASE),
]


def sanitize_log_message(message: str) -> str:
    """Redact tokens, passwords, and sensitive keys from log strings."""
    if not isinstance(message, str):
        return str(message)
    sanitized = message
    for pattern in _SECRET_PATTERNS:
        sanitized = pattern.sub(r"\1[REDACTED]", sanitized)
    return sanitized


class SanitizingFormatter(logging.Formatter):
    """Logging formatter that automatically scrubs sensitive credentials."""

    def format(self, record: logging.LogRecord) -> str:
        orig = super().format(record)
        return sanitize_log_message(orig)


def configure_logging(level: int = logging.INFO) -> None:
    """Set up root and kairo application loggers with sanitization."""
    handler = logging.StreamHandler(sys.stdout)
    formatter = SanitizingFormatter(
        "%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    # Remove existing handlers to avoid duplication
    for h in list(root_logger.handlers):
        root_logger.removeHandler(h)
    root_logger.addHandler(handler)


logger = logging.getLogger("kairo")

