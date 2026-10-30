"""Environment-backed application settings."""

import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

# Automatically load local .env if present
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if _env_path.exists():
    load_dotenv(_env_path)


@dataclass(frozen=True)
class Settings:
    """Backend settings; all credentials are read from environment variables."""

    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_v1_prefix: str = "/api/v1"
    frontend_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4000",
        "http://localhost:3000",
    )

    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None
    database_url: str | None = None

    nebius_api_key: str | None = None
    nvidia_api_key: str | None = None
    nvidia_base_url: str = "https://api.tokenfactory.nebius.com/v1/"
    nvidia_model: str = "nvidia/nemotron-3-super-120b-a12b"

    github_app_id: str | None = None
    github_private_key: str | None = None
    github_client_id: str | None = None
    github_client_secret: str | None = None
    github_webhook_secret: str | None = None

    execution_timeout_seconds: int = 120
    max_concurrent_executions: int = 2
    sandbox_fallback_local: bool = True


def _parse_origins(raw: str | None) -> tuple[str, ...]:
    if not raw:
        return (
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4000",
            "http://localhost:3000",
        )
    parsed: list[str] = []
    for origin in raw.split(","):
        cleaned = origin.strip().rstrip("/")
        if cleaned:
            parsed.append(cleaned)
    return tuple(parsed)


def validate_settings(settings: Settings) -> list[str]:
    """Validate required environment variables for deployment readiness.

    Returns a list of missing configuration warnings/errors.
    """
    issues: list[str] = []

    # Supabase credentials check
    if not settings.supabase_url:
        issues.append("SUPABASE_URL is not set.")
    if not settings.supabase_service_role_key:
        issues.append("SUPABASE_SERVICE_ROLE_KEY is not set.")
    if not settings.supabase_anon_key:
        issues.append("SUPABASE_ANON_KEY is not set.")

    # Nebius Token Factory / NVIDIA AI credentials check
    ai_key = settings.nebius_api_key or settings.nvidia_api_key
    if not ai_key:
        issues.append("NEBIUS_API_KEY (or NVIDIA_API_KEY) is not set (Nebius Token Factory inference will report 503).")

    # Production CORS check
    if settings.app_env.lower() == "production":
        if not settings.frontend_origins:
            issues.append("FRONTEND_ORIGINS must be configured for production deployments.")
        elif "*" in settings.frontend_origins:
            issues.append("Wildcard '*' in FRONTEND_ORIGINS is unsafe with credentials in production.")

    return issues


def get_settings() -> Settings:
    """Read settings without caching so runtime configuration remains testable."""
    raw_origins = os.getenv("FRONTEND_ORIGINS") or os.getenv("FRONTEND_ORIGIN")
    origins = _parse_origins(raw_origins)

    port_val = os.getenv("PORT") or os.getenv("API_PORT", "8000")
    try:
        api_port = int(port_val)
    except ValueError:
        api_port = 8000

    try:
        timeout_sec = int(os.getenv("EXECUTION_TIMEOUT_SECONDS", "120"))
    except ValueError:
        timeout_sec = 120

    try:
        max_concurrent = int(os.getenv("MAX_CONCURRENT_EXECUTIONS", "2"))
    except ValueError:
        max_concurrent = 2

    sandbox_fallback = os.getenv("SANDBOX_FALLBACK_LOCAL", "true").lower() in ("true", "1", "yes")

    nebius_key = os.getenv("NEBIUS_API_KEY")
    nvidia_key = os.getenv("NVIDIA_API_KEY")
    effective_ai_key = nebius_key or nvidia_key

    return Settings(
        app_env=os.getenv("APP_ENV", "development"),
        api_host=os.getenv("API_HOST", "0.0.0.0"),
        api_port=api_port,
        api_v1_prefix=os.getenv("API_V1_PREFIX", "/api/v1"),
        frontend_origins=origins,
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_anon_key=os.getenv("SUPABASE_ANON_KEY"),
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        database_url=os.getenv("DATABASE_URL"),
        nebius_api_key=effective_ai_key,
        nvidia_api_key=effective_ai_key,
        nvidia_base_url=os.getenv("NVIDIA_BASE_URL", "https://api.tokenfactory.nebius.com/v1/"),
        nvidia_model=os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3-super-120b-a12b"),
        github_app_id=os.getenv("GITHUB_APP_ID"),
        github_private_key=os.getenv("GITHUB_PRIVATE_KEY"),
        github_client_id=os.getenv("GITHUB_CLIENT_ID"),
        github_client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
        github_webhook_secret=os.getenv("GITHUB_WEBHOOK_SECRET"),
        execution_timeout_seconds=timeout_sec,
        max_concurrent_executions=max_concurrent,
        sandbox_fallback_local=sandbox_fallback,
    )
