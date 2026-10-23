"""Shared request dependencies for authentication and Supabase access."""

import logging
from typing import Any
from uuid import UUID

from fastapi import Depends, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.concurrency import run_in_threadpool

from app.core.exceptions import api_error
from app.schemas.user import AuthenticatedUser

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)


def get_supabase_client(request: Request) -> Any:
    """Return the configured Supabase client or report the missing integration."""
    client = getattr(request.app.state, "supabase_client", None)
    if client is None:
        raise api_error(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "SUPABASE_NOT_CONFIGURED",
            "Supabase is not configured for this deployment.",
            {"configured": False},
        )
    return client


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthenticatedUser:
    """Validate the bearer token with Supabase Auth and return its trusted identity."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise api_error(
            status.HTTP_401_UNAUTHORIZED,
            "AUTHENTICATION_REQUIRED",
            "A valid Supabase access token is required.",
        )

    client = get_supabase_client(request)
    try:
        response = await run_in_threadpool(
            client.auth.get_user, credentials.credentials
        )
    except Exception as exc:
        provider_status = getattr(
            exc, "status_code", getattr(exc, "status", None)
        )
        try:
            provider_status = int(provider_status)
        except (TypeError, ValueError):
            provider_status = None

        if provider_status in {400, 401, 403}:
            raise api_error(
                status.HTTP_401_UNAUTHORIZED,
                "INVALID_ACCESS_TOKEN",
                "The Supabase access token is invalid or expired.",
            ) from exc

        logger.warning("Supabase Auth token validation is unavailable.")
        raise api_error(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "AUTH_SERVICE_UNAVAILABLE",
            "Authentication could not be verified at this time.",
        ) from exc

    user = getattr(response, "user", None)
    if user is None and isinstance(response, dict):
        user = response.get("user")

    user_id = (
        user.get("id") if isinstance(user, dict) else getattr(user, "id", None)
    )
    if not user_id:
        raise api_error(
            status.HTTP_401_UNAUTHORIZED,
            "INVALID_ACCESS_TOKEN",
            "The Supabase access token is invalid or expired.",
        )

    try:
        parsed_user_id = UUID(str(user_id))
    except ValueError as exc:
        logger.warning("Supabase Auth returned an invalid user identifier.")
        raise api_error(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "AUTH_SERVICE_UNAVAILABLE",
            "Authentication could not be verified at this time.",
        ) from exc

    email = (
        user.get("email") if isinstance(user, dict) else getattr(user, "email", None)
    )
    return AuthenticatedUser(id=parsed_user_id, email=email)
