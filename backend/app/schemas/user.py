"""User schemas built from the validated Supabase identity and profile."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AuthenticatedUser(BaseModel):
    """A minimal authenticated identity; never populated from request user IDs."""

    model_config = ConfigDict(extra="forbid")

    id: UUID
    email: str | None = None


class UserProfile(BaseModel):
    """Full user profile including customizable display information and preferences."""

    model_config = ConfigDict(extra="ignore")

    id: UUID
    email: str | None = None
    username: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    preferences: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None
    updated_at: datetime | None = None


class UserProfileUpdate(BaseModel):
    """Allowed modifications to the user's public profile."""

    model_config = ConfigDict(extra="forbid")

    display_name: str | None = Field(default=None, max_length=120)
    avatar_url: str | None = Field(default=None, max_length=2048)
    bio: str | None = Field(default=None, max_length=500)
    preferences: dict[str, Any] | None = None
