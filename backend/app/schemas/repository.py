"""GitHub repository request and response schemas."""

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RepositoryConnectRequest(BaseModel):
    """Repository connection request; deliberately contains no access token."""

    model_config = ConfigDict(extra="forbid")

    project_id: UUID
    owner: str = Field(min_length=1, max_length=100)
    repository: str = Field(min_length=1, max_length=100)
    provider: Literal["github", "gitlab", "bitbucket"] = "github"
    default_branch: str = "main"

    @field_validator("owner", "repository")
    @classmethod
    def normalize_component(cls, value: str) -> str:
        component = value.strip()
        if not component:
            raise ValueError("Repository owner and name cannot be blank.")
        return component


class RepositoryResponse(BaseModel):
    """Public representation of a connected repository."""

    model_config = ConfigDict(extra="ignore")

    id: UUID | str
    project_id: UUID
    provider: str = "github"
    repository_url: str
    owner: str
    repository: str
    name: str
    fullName: str
    default_branch: str = "main"
    defaultBranch: str = "main"
    language: str | None = None
    description: str | None = None
    is_private: bool = False
    isPrivate: bool = False
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None
    updated_at: datetime | None = None
    updatedAt: datetime | None = None


class RepositoryNode(BaseModel):
    """File tree node for repository browser."""

    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    path: str
    type: Literal["file", "directory"]
    language: str | None = None
    size: int | None = None
    children: list["RepositoryNode"] | None = None


class RepositoryFileContent(BaseModel):
    """File content representation."""

    path: str
    content: str
    language: str | None = None
    size: int = 0


class GitChangeEntry(BaseModel):
    """Git change record for diff inspection."""

    path: str
    status: Literal["added", "modified", "deleted"]
    detail: str
    additions: int = 0
    deletions: int = 0
