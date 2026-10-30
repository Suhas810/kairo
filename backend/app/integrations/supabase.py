"""Supabase database repository operations with ownership scoping."""

import logging
from typing import Any
from uuid import UUID

from fastapi import status
from starlette.concurrency import run_in_threadpool

from app.core.exceptions import api_error

logger = logging.getLogger(__name__)


class SupabaseService:
    """Threadpool-wrapped database operations over the Supabase Python client."""

    @staticmethod
    async def get_user_profile(client: Any, user_id: UUID) -> dict[str, Any]:
        """Fetch profile for user or return default if row doesn't exist yet."""
        response = await run_in_threadpool(
            lambda: client.table("users")
            .select("*")
            .eq("id", str(user_id))
            .limit(1)
            .execute()
        )
        if response.data:
            return response.data[0]
        return {
            "id": str(user_id),
            "display_name": None,
            "avatar_url": None,
            "bio": None,
            "preferences": {},
        }

    @staticmethod
    async def update_user_profile(
        client: Any, user_id: UUID, updates: dict[str, Any]
    ) -> dict[str, Any]:
        """Upsert user profile."""
        clean_updates = {k: v for k, v in updates.items() if v is not None}
        clean_updates["id"] = str(user_id)
        response = await run_in_threadpool(
            lambda: client.table("users").upsert(clean_updates).select("*").execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "PROFILE_UPDATE_FAILED",
                "Could not update user profile.",
            )
        return response.data[0]

    # --- Repositories ---
    @staticmethod
    async def list_repositories(
        client: Any, user_id: UUID, project_id: UUID | None = None
    ) -> list[dict[str, Any]]:
        """List repositories for a project or all projects owned by user."""
        query = client.table("repositories").select("*, projects!inner(user_id)")
        if project_id:
            query = query.eq("project_id", str(project_id))
        query = query.eq("projects.user_id", str(user_id))
        response = await run_in_threadpool(lambda: query.execute())
        data = response.data or []
        for r in data:
            r.pop("projects", None)
        return data

    @staticmethod
    async def create_repository(
        client: Any, user_id: UUID, project_id: UUID, repo_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Insert a repository record after verifying project ownership."""
        # Verify project ownership first
        p_res = await run_in_threadpool(
            lambda: client.table("projects")
            .select("id")
            .eq("id", str(project_id))
            .eq("user_id", str(user_id))
            .limit(1)
            .execute()
        )
        if not p_res.data:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "PROJECT_NOT_FOUND",
                "Project not found or not owned by caller.",
            )

        repo_data["project_id"] = str(project_id)
        response = await run_in_threadpool(
            lambda: client.table("repositories").insert(repo_data).select("*").execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "REPOSITORY_CREATE_FAILED",
                "Could not create repository record.",
            )
        return response.data[0]

    @staticmethod
    async def delete_repository(
        client: Any, user_id: UUID, project_id: UUID, repo_url_or_id: str
    ) -> None:
        """Delete repository belonging to user's project."""
        query = (
            client.table("repositories")
            .delete()
            .eq("project_id", str(project_id))
        )
        if "/" in repo_url_or_id or "http" in repo_url_or_id:
            query = query.ilike("repository_url", f"%{repo_url_or_id}%")
        else:
            query = query.eq("id", repo_url_or_id)

        response = await run_in_threadpool(lambda: query.select("id").execute())
        if not response.data:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "REPOSITORY_NOT_FOUND",
                "Repository not found.",
            )

    # --- Tasks ---
    @staticmethod
    async def list_tasks(
        client: Any, user_id: UUID, project_id: UUID | None = None
    ) -> list[dict[str, Any]]:
        """List tasks owned by user, optionally filtered by project."""
        query = (
            client.table("tasks")
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
        )
        if project_id:
            query = query.eq("project_id", str(project_id))
        response = await run_in_threadpool(lambda: query.execute())
        return response.data or []

    @staticmethod
    async def get_task(client: Any, task_id: UUID, user_id: UUID) -> dict[str, Any]:
        """Retrieve task by id with user ownership check."""
        response = await run_in_threadpool(
            lambda: client.table("tasks")
            .select("*")
            .eq("id", str(task_id))
            .eq("user_id", str(user_id))
            .limit(1)
            .execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "TASK_NOT_FOUND",
                "Task not found or not owned by user.",
            )
        return response.data[0]

    @staticmethod
    async def create_task(
        client: Any, user_id: UUID, task_values: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a task owned by user."""
        project_id = task_values["project_id"]
        # Verify project ownership
        p_res = await run_in_threadpool(
            lambda: client.table("projects")
            .select("id")
            .eq("id", str(project_id))
            .eq("user_id", str(user_id))
            .limit(1)
            .execute()
        )
        if not p_res.data:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "PROJECT_NOT_FOUND",
                "Target project not found or not owned by user.",
            )

        task_values["user_id"] = str(user_id)
        task_values["project_id"] = str(project_id)
        response = await run_in_threadpool(
            lambda: client.table("tasks").insert(task_values).select("*").execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "TASK_CREATE_FAILED",
                "Could not create task.",
            )
        return response.data[0]

    @staticmethod
    async def update_task(
        client: Any, task_id: UUID, user_id: UUID, updates: dict[str, Any]
    ) -> dict[str, Any]:
        """Update task by ID for user."""
        response = await run_in_threadpool(
            lambda: client.table("tasks")
            .update(updates)
            .eq("id", str(task_id))
            .eq("user_id", str(user_id))
            .select("*")
            .execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "TASK_NOT_FOUND",
                "Task not found or not owned by user.",
            )
        return response.data[0]

    @staticmethod
    async def delete_task(client: Any, task_id: UUID, user_id: UUID) -> None:
        """Delete task by ID for user."""
        response = await run_in_threadpool(
            lambda: client.table("tasks")
            .delete()
            .eq("id", str(task_id))
            .eq("user_id", str(user_id))
            .select("id")
            .execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "TASK_NOT_FOUND",
                "Task not found or not owned by user.",
            )

    # --- Agent Sessions ---
    @staticmethod
    async def create_agent_session(
        client: Any,
        user_id: UUID,
        project_id: UUID,
        task_id: UUID | None,
        model_name: str | None = None,
        model_provider: str = "nvidia",
    ) -> dict[str, Any]:
        """Create a new agent session record."""
        payload = {
            "user_id": str(user_id),
            "project_id": str(project_id),
            "task_id": str(task_id) if task_id else None,
            "status": "queued",
            "model_provider": model_provider,
            "model_name": model_name or "nvidia/nemotron-4-340b-instruct",
            "model_metadata": {},
        }
        response = await run_in_threadpool(
            lambda: client.table("agent_sessions").insert(payload).select("*").execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "SESSION_CREATE_FAILED",
                "Could not create agent session record.",
            )
        return response.data[0]

    @staticmethod
    async def get_agent_session(
        client: Any, session_id: UUID, user_id: UUID
    ) -> dict[str, Any]:
        """Retrieve agent session."""
        response = await run_in_threadpool(
            lambda: client.table("agent_sessions")
            .select("*")
            .eq("id", str(session_id))
            .eq("user_id", str(user_id))
            .limit(1)
            .execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "SESSION_NOT_FOUND",
                "Agent session not found.",
            )
        return response.data[0]

    @staticmethod
    async def update_agent_session(
        client: Any, session_id: UUID, user_id: UUID, updates: dict[str, Any]
    ) -> dict[str, Any]:
        """Update agent session."""
        response = await run_in_threadpool(
            lambda: client.table("agent_sessions")
            .update(updates)
            .eq("id", str(session_id))
            .eq("user_id", str(user_id))
            .select("*")
            .execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "SESSION_NOT_FOUND",
                "Agent session not found.",
            )
        return response.data[0]

    # --- Executions ---
    @staticmethod
    async def create_execution(
        client: Any, user_id: UUID, execution_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create an execution record."""
        execution_data["user_id"] = str(user_id)
        response = await run_in_threadpool(
            lambda: client.table("executions").insert(execution_data).select("*").execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "EXECUTION_CREATE_FAILED",
                "Could not create execution record.",
            )
        return response.data[0]

    @staticmethod
    async def get_execution(
        client: Any, execution_id: UUID, user_id: UUID
    ) -> dict[str, Any]:
        """Retrieve execution record."""
        response = await run_in_threadpool(
            lambda: client.table("executions")
            .select("*")
            .eq("id", str(execution_id))
            .eq("user_id", str(user_id))
            .limit(1)
            .execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "EXECUTION_NOT_FOUND",
                "Execution not found or not owned by user.",
            )
        return response.data[0]

    @staticmethod
    async def list_executions(
        client: Any, user_id: UUID, project_id: UUID | None = None
    ) -> list[dict[str, Any]]:
        """List executions for user, optionally filtered by project."""
        query = (
            client.table("executions")
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
        )
        if project_id:
            query = query.eq("project_id", str(project_id))
        response = await run_in_threadpool(lambda: query.execute())
        return response.data or []

    @staticmethod
    async def update_execution(
        client: Any, execution_id: UUID, user_id: UUID, updates: dict[str, Any]
    ) -> dict[str, Any]:
        """Update execution record."""
        response = await run_in_threadpool(
            lambda: client.table("executions")
            .update(updates)
            .eq("id", str(execution_id))
            .eq("user_id", str(user_id))
            .select("*")
            .execute()
        )
        if not response.data:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "EXECUTION_NOT_FOUND",
                "Execution not found or not owned by caller.",
            )
        return response.data[0]

    # --- Activity Logs ---
    @staticmethod
    async def log_activity(
        client: Any,
        project_id: UUID | None,
        user_id: UUID | None,
        action: str,
        entity_type: str | None = None,
        entity_id: UUID | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Best-effort activity log append."""
        try:
            payload = {
                "project_id": str(project_id) if project_id else None,
                "actor_user_id": str(user_id) if user_id else None,
                "actor_type": "user" if user_id else "system",
                "action": action,
                "entity_type": entity_type,
                "entity_id": str(entity_id) if entity_id else None,
                "metadata": metadata or {},
            }
            await run_in_threadpool(
                lambda: client.table("activity_logs").insert(payload).execute()
            )
        except Exception as exc:
            logger.warning("Failed to record activity log: %s", exc)

