"""User response schema built only from the validated Supabase identity."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuthenticatedUser(BaseModel):
    """A minimal authenticated identity; never populated from request user IDs."""

    model_config = ConfigDict(extra="forbid")

    id: UUID
    email: str | None = None
