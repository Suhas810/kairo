"""GitHub repository request schemas."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RepositoryConnectRequest(BaseModel):
    """Repository connection request; deliberately contains no access token."""

    model_config = ConfigDict(extra="forbid")

    project_id: UUID
    owner: str = Field(min_length=1, max_length=100)
    repository: str = Field(min_length=1, max_length=100)

    @field_validator("owner", "repository")
    @classmethod
    def normalize_component(cls, value: str) -> str:
        component = value.strip()
        if not component:
            raise ValueError("Repository owner and name cannot be blank.")
        return component
