"""GitHub API and repository integration."""

import base64
import logging
from typing import Any
import httpx
from fastapi import status

from app.core.exceptions import api_error
from app.core.security import validate_safe_relative_path

logger = logging.getLogger(__name__)


class GitHubIntegration:
    """Async client for GitHub repository operations."""

    def __init__(
        self,
        token: str | None = None,
        base_url: str = "https://api.github.com",
    ) -> None:
        self.token = token
        self.base_url = base_url.rstrip("/")

    def _headers(self) -> dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Kairo-Dev-Platform/1.0",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def get_repository_info(self, owner: str, repo: str) -> dict[str, Any]:
        """Fetch repository details from GitHub."""
        url = f"{self.base_url}/repos/{owner}/{repo}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, headers=self._headers())
            except httpx.RequestError as exc:
                raise api_error(
                    status.HTTP_503_SERVICE_UNAVAILABLE,
                    "GITHUB_NETWORK_ERROR",
                    "Could not connect to GitHub API.",
                ) from exc

        if response.status_code == 404:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "REPOSITORY_NOT_FOUND",
                f"GitHub repository {owner}/{repo} not found.",
            )
        if response.status_code == 401 or response.status_code == 403:
            if "rate limit" in response.text.lower():
                raise api_error(
                    status.HTTP_429_TOO_MANY_REQUESTS,
                    "GITHUB_RATE_LIMITED",
                    "GitHub API rate limit exceeded.",
                )
            raise api_error(
                status.HTTP_503_SERVICE_UNAVAILABLE,
                "GITHUB_AUTH_ERROR",
                "Authentication failed with GitHub API.",
            )
        if response.status_code != 200:
            raise api_error(
                status.HTTP_502_BAD_GATEWAY,
                "GITHUB_API_ERROR",
                f"GitHub API returned error: {response.status_code}",
            )

        data = response.json()
        return {
            "name": data.get("name", repo),
            "full_name": data.get("full_name", f"{owner}/{repo}"),
            "default_branch": data.get("default_branch", "main"),
            "language": data.get("language") or "TypeScript",
            "description": data.get("description") or "",
            "is_private": data.get("private", False),
            "html_url": data.get("html_url", f"https://github.com/{owner}/{repo}"),
        }

    async def get_repository_tree(
        self, owner: str, repo: str, branch: str = "main"
    ) -> list[dict[str, Any]]:
        """Fetch recursive git tree for repository."""
        url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.get(url, headers=self._headers())
            except httpx.RequestError as exc:
                raise api_error(
                    status.HTTP_503_SERVICE_UNAVAILABLE,
                    "GITHUB_NETWORK_ERROR",
                    "Could not fetch repository tree from GitHub.",
                ) from exc

        if response.status_code != 200:
            logger.warning("GitHub git tree returned %s for %s/%s", response.status_code, owner, repo)
            return []

        tree_data = response.json().get("tree", [])
        nodes: list[dict[str, Any]] = []
        for item in tree_data:
            path = item.get("path", "")
            if not path or path.startswith(".git/"):
                continue
            is_dir = item.get("type") == "tree"
            nodes.append(
                {
                    "id": path,
                    "name": path.split("/")[-1],
                    "path": path,
                    "type": "directory" if is_dir else "file",
                    "size": item.get("size", 0) if not is_dir else None,
                }
            )
        return nodes

    async def get_file_content(
        self, owner: str, repo: str, path: str, branch: str = "main"
    ) -> str:
        """Fetch raw or base64 file content."""
        clean_path = validate_safe_relative_path(path)
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{clean_path}?ref={branch}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, headers=self._headers())
            except httpx.RequestError as exc:
                raise api_error(
                    status.HTTP_503_SERVICE_UNAVAILABLE,
                    "GITHUB_NETWORK_ERROR",
                    f"Could not connect to GitHub for file {clean_path}.",
                ) from exc

        if response.status_code == 404:
            raise api_error(
                status.HTTP_404_NOT_FOUND,
                "FILE_NOT_FOUND",
                f"File {clean_path} not found in repository.",
            )
        if response.status_code != 200:
            raise api_error(
                status.HTTP_502_BAD_GATEWAY,
                "GITHUB_API_ERROR",
                f"Failed to fetch {clean_path} from GitHub.",
            )

        data = response.json()
        encoding = data.get("encoding")
        content_raw = data.get("content", "")
        if encoding == "base64":
            try:
                return base64.b64decode(content_raw).decode("utf-8")
            except UnicodeDecodeError:
                return base64.b64decode(content_raw).decode("latin-1")
        return content_raw

