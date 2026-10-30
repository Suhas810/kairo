"""Project API schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ProjectCreate(BaseModel):
    """Fields accepted when creating a project."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=4000)
    repository_url: str | None = Field(default=None, max_length=2048)
    default_branch: str | None = Field(default=None, max_length=255)
    language: str | None = Field(default=None, max_length=100)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("Project name cannot be blank.")
        return name


class ProjectUpdate(BaseModel):
    """Fields that may be changed on an existing project."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=4000)
    repository_url: str | None = Field(default=None, max_length=2048)
    default_branch: str | None = Field(default=None, max_length=255)
    language: str | None = Field(default=None, max_length=100)
    status: str | None = Field(default=None, max_length=50)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        name = value.strip()
        if not name:
            raise ValueError("Project name cannot be blank.")
        return name

    @model_validator(mode="after")
    def require_at_least_one_field(self) -> "ProjectUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one project field must be provided.")
        if "name" in self.model_fields_set and self.name is None:
            raise ValueError("Project name cannot be null.")
        return self


class ProjectResponse(BaseModel):
    """Public project representation, excluding internal credentials."""

    model_config = ConfigDict(extra="ignore")

    id: UUID
    user_id: UUID
    name: str
    description: str | None = None
    repository_url: str | None = None
    default_branch: str | None = None
    language: str | None = None
    status: str = "active"
    configuration: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None
    updated_at: datetime | None = None
