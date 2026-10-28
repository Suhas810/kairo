"""Safe integration tests for the implemented GitHub webhook boundary."""

import hashlib
import hmac

from fastapi.testclient import TestClient

from app.main import app

WEBHOOK_SECRET = "local-test-webhook-secret"


def _signature(body: bytes) -> str:
    digest = hmac.new(
        WEBHOOK_SECRET.encode("utf-8"), body, hashlib.sha256
    ).hexdigest()
    return f"sha256={digest}"


def test_signed_github_ping_is_acknowledged(monkeypatch) -> None:
    monkeypatch.setenv("GITHUB_WEBHOOK_SECRET", WEBHOOK_SECRET)
    body = b'{"zen":"Keep it logically awesome."}'

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/webhooks/github",
            content=body,
            headers={
                "X-GitHub-Event": "ping",
                "X-Hub-Signature-256": _signature(body),
            },
        )

    assert response.status_code == 202
    assert response.json() == {
        "accepted": True,
        "event": "ping",
        "processed": True,
    }


def test_signed_non_json_github_payload_is_rejected(monkeypatch) -> None:
    monkeypatch.setenv("GITHUB_WEBHOOK_SECRET", WEBHOOK_SECRET)
    body = b"not-json"

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/webhooks/github",
            content=body,
            headers={
                "X-GitHub-Event": "push",
                "X-Hub-Signature-256": _signature(body),
            },
        )

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_WEBHOOK_PAYLOAD"
