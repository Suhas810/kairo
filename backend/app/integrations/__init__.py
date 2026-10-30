"""External integrations for Kairo: Supabase, GitHub, NVIDIA AI."""

from .github import GitHubIntegration
from .nvidia_ai import NvidiaAIClient
from .supabase import SupabaseService

__all__ = ["GitHubIntegration", "NvidiaAIClient", "SupabaseService"]

