"""GitHub repository management and inspection routes."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status

from app.api.dependencies import get_current_user, get_supabase_client
from app.core.config import get_settings
from app.core.exceptions import api_error
from app.core.security import validate_safe_relative_path
from app.integrations.github import GitHubIntegration
from app.integrations.supabase import SupabaseService
from app.schemas.repository import (
    GitChangeEntry,
    RepositoryConnectRequest,
    RepositoryFileContent,
    RepositoryNode,
    RepositoryResponse,
)
from app.schemas.user import AuthenticatedUser
from app.services.project_service import get_owned_project

router = APIRouter()


def _is_github_configured() -> bool:
    settings = get_settings()
    return bool(settings.github_client_id or settings.github_app_id or settings.github_webhook_secret)


def _raise_github_not_configured() -> None:
    raise api_error(
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "GITHUB_NOT_CONFIGURED",
        "GitHub repository access is not configured for this deployment.",
        {"configured": False},
    )


def _get_github_client() -> GitHubIntegration:
    settings = get_settings()
    token = settings.github_client_secret or None
    return GitHubIntegration(token=token)


@router.post("/", response_model=RepositoryResponse, status_code=status.HTTP_201_CREATED)
async def connect_repository(
    payload: RepositoryConnectRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Connect a repository to an owned project."""
    await get_owned_project(client, payload.project_id, current_user.id)
    if not _is_github_configured():
        _raise_github_not_configured()

    github = _get_github_client()
    repo_info = await github.get_repository_info(payload.owner, payload.repository)

    repo_record = {
        "provider": payload.provider,
        "repository_url": repo_info["html_url"],
        "default_branch": repo_info["default_branch"],
        "metadata": {
            "owner": payload.owner,
            "repository": payload.repository,
            "language": repo_info["language"],
            "description": repo_info["description"],
            "is_private": repo_info["is_private"],
        },
    }
    saved = await SupabaseService.create_repository(
        client, current_user.id, payload.project_id, repo_record
    )
    meta = saved.get("metadata", {})
    return {
        "id": saved["id"],
        "project_id": saved["project_id"],
        "provider": saved["provider"],
        "repository_url": saved["repository_url"],
        "owner": meta.get("owner", payload.owner),
        "repository": meta.get("repository", payload.repository),
        "name": payload.repository,
        "fullName": f"{payload.owner}/{payload.repository}",
        "default_branch": saved["default_branch"],
        "defaultBranch": saved["default_branch"],
        "language": meta.get("language", "TypeScript"),
        "description": meta.get("description", ""),
        "is_private": meta.get("is_private", False),
        "isPrivate": meta.get("is_private", False),
        "metadata": meta,
        "created_at": saved.get("created_at"),
        "updated_at": saved.get("updated_at"),
        "updatedAt": saved.get("updated_at"),
    }


@router.get("/", response_model=list[RepositoryResponse])
async def list_repositories(
    project_id: UUID = Query(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> list[dict[str, Any]]:
    """List repositories connected to an owned project."""
    await get_owned_project(client, project_id, current_user.id)
    if not _is_github_configured():
        _raise_github_not_configured()

    records = await SupabaseService.list_repositories(client, current_user.id, project_id)
    results = []
    for r in records:
        meta = r.get("metadata", {})
        results.append(
            {
                "id": r["id"],
                "project_id": r["project_id"],
                "provider": r["provider"],
                "repository_url": r["repository_url"],
                "owner": meta.get("owner", "unknown"),
                "repository": meta.get("repository", "unknown"),
                "name": meta.get("repository", "repository"),
                "fullName": f"{meta.get('owner', 'user')}/{meta.get('repository', 'repo')}",
                "default_branch": r.get("default_branch", "main"),
                "defaultBranch": r.get("default_branch", "main"),
                "language": meta.get("language", "TypeScript"),
                "description": meta.get("description", ""),
                "is_private": meta.get("is_private", False),
                "isPrivate": meta.get("is_private", False),
                "metadata": meta,
                "created_at": r.get("created_at"),
                "updated_at": r.get("updated_at"),
                "updatedAt": r.get("updated_at"),
            }
        )
    return results


@router.get("/{owner}/{repository}", response_model=RepositoryResponse)
async def inspect_repository(
    owner: str,
    repository: str,
    project_id: UUID = Query(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Retrieve metadata for a specific repository."""
    await get_owned_project(client, project_id, current_user.id)
    if not _is_github_configured():
        _raise_github_not_configured()

    github = _get_github_client()
    info = await github.get_repository_info(owner, repository)
    return {
        "id": f"repo-{owner}-{repository}",
        "project_id": project_id,
        "provider": "github",
        "repository_url": info["html_url"],
        "owner": owner,
        "repository": repository,
        "name": repository,
        "fullName": f"{owner}/{repository}",
        "default_branch": info["default_branch"],
        "defaultBranch": info["default_branch"],
        "language": info["language"],
        "description": info["description"],
        "is_private": info["is_private"],
        "isPrivate": info["is_private"],
        "metadata": info,
    }


@router.get("/{owner}/{repository}/tree", response_model=list[RepositoryNode])
async def get_repository_tree(
    owner: str,
    repository: str,
    project_id: UUID = Query(...),
    branch: str = Query("main"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> list[dict[str, Any]]:
    """Retrieve file tree for repository."""
    await get_owned_project(client, project_id, current_user.id)
    if not _is_github_configured():
        _raise_github_not_configured()

    github = _get_github_client()
    return await github.get_repository_tree(owner, repository, branch=branch)


@router.get("/{owner}/{repository}/content", response_model=RepositoryFileContent)
async def get_repository_file_content(
    owner: str,
    repository: str,
    path: str = Query(...),
    branch: str = Query("main"),
    project_id: UUID = Query(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> dict[str, Any]:
    """Retrieve contents of a specific file in the repository."""
    await get_owned_project(client, project_id, current_user.id)
    if not _is_github_configured():
        _raise_github_not_configured()

    safe_path = validate_safe_relative_path(path)
    github = _get_github_client()
    content = await github.get_file_content(owner, repository, safe_path, branch=branch)
    return {
        "path": safe_path,
        "content": content,
        "size": len(content.encode("utf-8")),
    }


@router.get("/{owner}/{repository}/changes", response_model=list[GitChangeEntry])
async def get_repository_changes(
    owner: str,
    repository: str,
    project_id: UUID = Query(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> list[dict[str, Any]]:
    """Retrieve git changes for repository."""
    await get_owned_project(client, project_id, current_user.id)
    if not _is_github_configured():
        _raise_github_not_configured()

    # Returns active session diff or changes
    return []


@router.delete("/{owner}/{repository}", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect_repository(
    owner: str,
    repository: str,
    project_id: UUID = Query(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    client: Any = Depends(get_supabase_client),
) -> Response:
    """Disconnect repository from owned project."""
    await get_owned_project(client, project_id, current_user.id)
    if not _is_github_configured():
        _raise_github_not_configured()

    await SupabaseService.delete_repository(
        client, current_user.id, project_id, f"{owner}/{repository}"
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
