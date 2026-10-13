"""Execution request schemas."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ExecutionCreateRequest(BaseModel):
    """Request to create an isolated execution associated with a project."""

    model_config = ConfigDict(extra="forbid")

    project_id: UUID
