"""Settings API request and response schemas."""

from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class UserSettingsResponse(BaseModel):
    """User preferences and non-secret application configuration."""

    model_config = ConfigDict(extra="ignore")

    theme: str = "system"
    notifications: bool = True
    telemetry: bool = False
    model_preferences: dict[str, Any] = Field(default_factory=dict)
    active_integrations: dict[str, bool] = Field(default_factory=dict)


class UserSettingsUpdate(BaseModel):
    """Payload to update user preferences."""

    model_config = ConfigDict(extra="ignore")

    theme: str | None = None
    notifications: bool | None = None
    telemetry: bool | None = None
    model_preferences: dict[str, Any] | None = None

