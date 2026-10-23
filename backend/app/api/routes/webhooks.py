"""GitHub webhook signature verification and safe acknowledgement."""

import hashlib
import hmac
import json
import re
from json import JSONDecodeError

from fastapi import APIRouter, Request, status

from app.core.config import get_settings
from app.core.exceptions import api_error

router = APIRouter()

MAX_WEBHOOK_BODY_BYTES = 1_048_576
SUPPORTED_EVENTS = {"ping", "push", "issues", "pull_request", "repository"}


async def _read_bounded_body(request: Request) -> bytes:
    content_length = request.headers.get("content-length")
    if content_length is not None:
        try:
            if int(content_length) > MAX_WEBHOOK_BODY_BYTES:
                raise api_error(
                    status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    "WEBHOOK_PAYLOAD_TOO_LARGE",
                    "The webhook payload exceeds the allowed size.",
                )
        except ValueError as exc:
            raise api_error(
                status.HTTP_400_BAD_REQUEST,
                "INVALID_CONTENT_LENGTH",
                "The webhook content length is invalid.",
            ) from exc

    chunks: list[bytes] = []
    size = 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > MAX_WEBHOOK_BODY_BYTES:
            raise api_error(
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                "WEBHOOK_PAYLOAD_TOO_LARGE",
                "The webhook payload exceeds the allowed size.",
            )
        chunks.append(chunk)
    return b"".join(chunks)


@router.post("/github", status_code=status.HTTP_202_ACCEPTED)
async def receive_github_webhook(request: Request) -> dict[str, object]:
    """Verify GitHub's HMAC signature before acknowledging a webhook event."""
    secret = get_settings().github_webhook_secret
    if not secret:
        raise api_error(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "WEBHOOK_NOT_CONFIGURED",
            "GitHub webhook verification is not configured.",
            {"configured": False},
        )

    signature = request.headers.get("x-hub-signature-256", "")
    event = request.headers.get("x-github-event", "")
    if not re.fullmatch(r"sha256=[0-9a-f]{64}", signature) or not event:
        raise api_error(
            status.HTTP_401_UNAUTHORIZED,
            "INVALID_WEBHOOK_SIGNATURE",
            "The GitHub webhook signature is missing or invalid.",
        )

    body = await _read_bounded_body(request)
    expected_signature = "sha256=" + hmac.new(
        secret.encode("utf-8"), body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(signature, expected_signature):
        raise api_error(
            status.HTTP_401_UNAUTHORIZED,
            "INVALID_WEBHOOK_SIGNATURE",
            "The GitHub webhook signature is missing or invalid.",
        )

    try:
        payload = json.loads(body)
    except (JSONDecodeError, UnicodeDecodeError) as exc:
        raise api_error(
            status.HTTP_400_BAD_REQUEST,
            "INVALID_WEBHOOK_PAYLOAD",
            "The GitHub webhook payload is not valid JSON.",
        ) from exc
    if not isinstance(payload, dict):
        raise api_error(
            status.HTTP_400_BAD_REQUEST,
            "INVALID_WEBHOOK_PAYLOAD",
            "The GitHub webhook payload must be a JSON object.",
        )

    if event not in SUPPORTED_EVENTS:
        return {"accepted": True, "event": event, "processed": False}
    if event == "ping":
        return {"accepted": True, "event": event, "processed": True}
    return {
        "accepted": True,
        "event": event,
        "processed": False,
        "reason": "event_processing_not_configured",
    }
