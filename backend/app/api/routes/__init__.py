"""Route registration for the versioned API."""

from fastapi import APIRouter

from . import agent, auth, executions, health, projects, repositories, webhooks

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(repositories.router, prefix="/repositories", tags=["repositories"])
api_router.include_router(agent.router, prefix="/agents", tags=["agents"])
api_router.include_router(executions.router, prefix="/executions", tags=["executions"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])

__all__ = [
    "agent",
    "api_router",
    "auth",
    "executions",
    "health",
    "projects",
    "repositories",
    "webhooks",
]
