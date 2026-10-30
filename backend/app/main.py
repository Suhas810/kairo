"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import api_router
from app.core.config import get_settings, validate_settings
from app.core.logging import configure_logging
from app.database.connection import create_supabase_client

logger = logging.getLogger("kairo.main")
API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    """Initialize optional backend integrations once per application process."""
    configure_logging()
    settings = get_settings()

    issues = validate_settings(settings)
    for issue in issues:
        if settings.app_env.lower() == "production" and ("SUPABASE" in issue or "FRONTEND_ORIGINS" in issue):
            logger.error("Configuration issue: %s", issue)
        else:
            logger.info("Configuration notice: %s", issue)

    application.state.supabase_client = create_supabase_client(settings)
    yield


def create_app() -> FastAPI:
    """Build the API application and register versioned endpoints."""
    settings = get_settings()
    application = FastAPI(
        title="Kairo API",
        version="0.1.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # CORS configuration for authorized frontend origins (wildcard disallowed with credentials)
    allowed_origins = [o for o in settings.frontend_origins if o != "*"]
    if not allowed_origins:
        allowed_origins = ["http://localhost:5173"]

    application.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Top-level health endpoints
    @application.get("/health", tags=["health"])
    async def root_health() -> dict[str, str]:
        return {"status": "ok", "service": "kairo-api"}

    @application.get("/ready", tags=["health"])
    async def root_ready(request: Request) -> dict[str, Any]:
        has_supabase = getattr(request.app.state, "supabase_client", None) is not None
        has_ai = bool((settings.nebius_api_key or settings.nvidia_api_key) and (settings.nebius_api_key or settings.nvidia_api_key).strip())
        return {
            "status": "ready",
            "service": "kairo-api",
            "integrations": {
                "supabase": has_supabase,
                "nebius_token_factory": has_ai,
                "nvidia_ai": has_ai,
            },
            "ai_diagnostics": {
                "provider": "Nebius Token Factory",
                "model": settings.nvidia_model,
                "base_url": settings.nvidia_base_url,
                "configured": has_ai,
            },
        }

    application.include_router(api_router, prefix=API_PREFIX)

    @application.exception_handler(StarletteHTTPException)
    async def handle_http_error(
        _request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        detail = exc.detail
        if isinstance(detail, dict) and "code" in detail and "message" in detail:
            error = detail
        else:
            error = {
                "code": "HTTP_ERROR",
                "message": str(detail),
                "details": {},
            }
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": error},
            headers=exc.headers,
        )

    @application.exception_handler(RequestValidationError)
    async def handle_validation_error(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        details = [
            {"location": list(error["loc"]), "type": error["type"]}
            for error in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "INVALID_REQUEST",
                    "message": "Request validation failed.",
                    "details": {"errors": details},
                }
            },
        )

    return application


app = create_app()


if __name__ == "__main__":
    import os
    import uvicorn

    settings = get_settings()
    port = int(os.getenv("PORT", os.getenv("API_PORT", str(settings.api_port))))
    host = os.getenv("API_HOST", settings.api_host)
    uvicorn.run("app.main:app", host=host, port=port, reload=False)

