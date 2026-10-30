"""Health and readiness endpoints."""

from typing import Any
from fastapi import APIRouter, Request

from app.core.config import get_settings

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Report that the API process is responsive."""
    return {"status": "ok", "service": "kairo-api"}


@router.get("/ready")
async def readiness_check(request: Request) -> dict[str, Any]:
    """Report readiness of dependencies without revealing credentials."""
    settings = get_settings()
    has_supabase = getattr(request.app.state, "supabase_client", None) is not None
    has_ai = bool((settings.nebius_api_key or settings.nvidia_api_key) and (settings.nebius_api_key or settings.nvidia_api_key).strip())
    has_github = bool(settings.github_webhook_secret or settings.github_client_id)

    return {
        "status": "ready",
        "service": "kairo-api",
        "integrations": {
            "supabase": has_supabase,
            "nebius_token_factory": has_ai,
            "nvidia_ai": has_ai,
            "github": has_github,
        },
        "ai_diagnostics": {
            "provider": "Nebius Token Factory",
            "model": settings.nvidia_model,
            "base_url": settings.nvidia_base_url,
            "configured": has_ai,
        },
    }


@router.get("/ai-provider")
@router.get("/health/ai-provider")
async def ai_provider_status() -> dict[str, Any]:
    """Test and report safe Nebius Token Factory connectivity diagnostics."""
    from app.agents.orchestrator import orchestrator
    return await orchestrator.ai_client.test_connectivity()

