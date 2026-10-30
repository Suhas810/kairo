"""Unit tests for Nebius Token Factory / NVIDIA AI client and structured response parsing."""

from unittest.mock import AsyncMock, patch
import httpx
import pytest
from app.integrations.nvidia_ai import NvidiaAIClient


def test_nebius_ai_client_configuration_check(monkeypatch):
    monkeypatch.delenv("NEBIUS_API_KEY", raising=False)
    monkeypatch.delenv("NVIDIA_API_KEY", raising=False)

    unconfigured = NvidiaAIClient(api_key=None)
    assert unconfigured.is_configured() is False
    assert unconfigured.base_url == "https://api.tokenfactory.nebius.com/v1"
    assert "nemotron" in unconfigured.model.lower()

    # Supports NEBIUS_API_KEY env var
    monkeypatch.setenv("NEBIUS_API_KEY", "nebius-token-factory-key-xyz")
    from_env = NvidiaAIClient()
    assert from_env.is_configured() is True
    assert from_env.api_key == "nebius-token-factory-key-xyz"

    configured = NvidiaAIClient(api_key="nvapi-test-key-123")
    assert configured.is_configured() is True


def test_nvidia_ai_extract_json_block():
    client = NvidiaAIClient()
    markdown_json = (
        "Here is the plan:\n"
        "```json\n"
        '{\n  "summary": "Implement AST extractor",\n  "steps": []\n}\n'
        "```"
    )
    extracted = client._extract_json_block(markdown_json)
    assert extracted.get("summary") == "Implement AST extractor"
    assert "steps" in extracted


def test_nvidia_ai_extract_raw_json():
    client = NvidiaAIClient()
    raw = '{"approved": true, "summary": "Looks great!"}'
    extracted = client._extract_json_block(raw)
    assert extracted.get("approved") is True


@pytest.mark.asyncio
async def test_nebius_connectivity_unconfigured(monkeypatch):
    monkeypatch.delenv("NEBIUS_API_KEY", raising=False)
    monkeypatch.delenv("NVIDIA_API_KEY", raising=False)
    client = NvidiaAIClient(api_key=None)
    status = await client.test_connectivity()
    assert status["status"] == "unconfigured"
    assert status["configured"] is False
    assert status["provider"] == "Nebius Token Factory"


@pytest.mark.asyncio
async def test_nebius_authenticated_chat_completion_mock():
    client = NvidiaAIClient(
        api_key="mock-nebius-key",
        base_url="https://api.tokenfactory.nebius.com/v1/",
        model="nvidia/nemotron-3-super-120b-a12b",
    )

    mock_response = {
        "id": "chatcmpl-123",
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": '{"summary": "Test plan", "steps": []}'},
                "finish_reason": "stop",
            }
        ],
        "usage": {"prompt_tokens": 15, "completion_tokens": 10, "total_tokens": 25},
    }

    mock_resp = httpx.Response(
        status_code=200,
        json=mock_response,
        request=httpx.Request("POST", "https://api.tokenfactory.nebius.com/v1/chat/completions"),
    )

    with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=mock_resp)) as mock_post:
        plan = await client.generate_plan("Test task", "Test desc", "Files: []")
        assert plan["summary"] == "Test plan"
        assert plan["token_usage"]["total_tokens"] == 25

        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args.kwargs
        assert "Authorization" in call_kwargs["headers"]
        assert call_kwargs["headers"]["Authorization"] == "Bearer mock-nebius-key"
        assert call_kwargs["json"]["model"] == "nvidia/nemotron-3-super-120b-a12b"


