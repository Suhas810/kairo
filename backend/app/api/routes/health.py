"""Lightweight public health endpoint."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Report that the API process is responsive without probing dependencies."""
    return {"status": "ok", "service": "kairo-api"}
