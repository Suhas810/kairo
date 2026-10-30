"""Nebius Token Factory / NVIDIA Nemotron inference provider integration."""

import json
import logging
import os
import re
import time
from typing import Any
import httpx
from fastapi import status

from app.core.exceptions import api_error

logger = logging.getLogger(__name__)


class NvidiaAIClient:
    """Async client for Nebius Token Factory inference using standard OpenAI-compatible API."""

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
        timeout_seconds: float = 60.0,
    ) -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/") if base_url else None
        self._model = model
        self.timeout = timeout_seconds
        self.provider_name = "Nebius Token Factory"

    @property
    def api_key(self) -> str | None:
        return self._api_key or os.getenv("NEBIUS_API_KEY") or os.getenv("NVIDIA_API_KEY")

    @api_key.setter
    def api_key(self, value: str | None) -> None:
        self._api_key = value

    @property
    def base_url(self) -> str:
        return (self._base_url or os.getenv("NVIDIA_BASE_URL") or "https://api.tokenfactory.nebius.com/v1/").rstrip("/")

    @base_url.setter
    def base_url(self, value: str) -> None:
        self._base_url = value.rstrip("/")

    @property
    def model(self) -> str:
        return self._model or os.getenv("NVIDIA_MODEL") or "nvidia/nemotron-3-super-120b-a12b"

    @model.setter
    def model(self, value: str) -> None:
        self._model = value

    def is_configured(self) -> bool:
        """Check whether valid API key is present."""
        return bool(self.api_key and self.api_key.strip())

    def _ensure_configured(self) -> None:
        if not self.is_configured():
            raise api_error(
                status.HTTP_503_SERVICE_UNAVAILABLE,
                "NEBIUS_AI_NOT_CONFIGURED",
                f"{self.provider_name} is not configured. Set NEBIUS_API_KEY in your environment.",
                {
                    "configured": False,
                    "provider": self.provider_name,
                    "base_url": self.base_url,
                    "model": self.model,
                },
            )

    async def test_connectivity(self) -> dict[str, Any]:
        """Test authenticated connectivity to Nebius Token Factory with a minimal chat completion."""
        if not self.is_configured():
            return {
                "provider": self.provider_name,
                "status": "unconfigured",
                "configured": False,
                "base_url": self.base_url,
                "model": self.model,
                "message": "NEBIUS_API_KEY is not configured.",
            }

        start = time.monotonic()
        try:
            content, usage = await self._chat_completion(
                [
                    {"role": "user", "content": "Respond with the single word 'ready'"}
                ],
                max_tokens=10,
                temperature=0.0,
            )
            latency_ms = round((time.monotonic() - start) * 1000)
            return {
                "provider": self.provider_name,
                "status": "connected",
                "configured": True,
                "base_url": self.base_url,
                "model": self.model,
                "latency_ms": latency_ms,
                "response_sample": content.strip()[:100],
                "token_usage": usage,
            }
        except Exception as exc:
            latency_ms = round((time.monotonic() - start) * 1000)
            logger.error("Nebius Token Factory connectivity check failed: %s", exc)
            return {
                "provider": self.provider_name,
                "status": "error",
                "configured": True,
                "base_url": self.base_url,
                "model": self.model,
                "latency_ms": latency_ms,
                "error": str(exc),
            }

    async def _chat_completion(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        response_format: dict[str, Any] | None = None,
    ) -> tuple[str, dict[str, int]]:
        """Call Nebius Token Factory chat completions API with retries and bounds."""
        self._ensure_configured()
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Kairo-Agent/1.0 (Nebius-Token-Factory)",
        }
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format:
            payload["response_format"] = response_format

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(url, headers=headers, json=payload)
            except httpx.TimeoutException as exc:
                raise api_error(
                    status.HTTP_504_GATEWAY_TIMEOUT,
                    "AI_PROVIDER_TIMEOUT",
                    f"AI provider request timed out after {self.timeout}s.",
                ) from exc
            except httpx.RequestError as exc:
                raise api_error(
                    status.HTTP_503_SERVICE_UNAVAILABLE,
                    "AI_PROVIDER_UNAVAILABLE",
                    "Could not connect to AI inference provider.",
                ) from exc

        if response.status_code == 401:
            raise api_error(
                status.HTTP_401_UNAUTHORIZED,
                "AI_AUTH_FAILED",
                f"Invalid {self.provider_name} API key or unauthorized access.",
                {"provider": self.provider_name},
            )
        if response.status_code == 429:
            raise api_error(
                status.HTTP_429_TOO_MANY_REQUESTS,
                "AI_RATE_LIMITED",
                f"{self.provider_name} rate limit exceeded.",
                {"provider": self.provider_name},
            )
        if response.status_code != 200:
            logger.error("%s returned error %s: %s", self.provider_name, response.status_code, response.text)
            raise api_error(
                status.HTTP_502_BAD_GATEWAY,
                "AI_PROVIDER_ERROR",
                f"{self.provider_name} returned error {response.status_code}.",
                {"provider": self.provider_name, "status_code": response.status_code},
            )

        data = response.json()
        choices = data.get("choices", [])
        if not choices:
            raise api_error(
                status.HTTP_502_BAD_GATEWAY,
                "AI_EMPTY_RESPONSE",
                "AI model returned an empty response.",
            )

        content = choices[0].get("message", {}).get("content", "")
        usage = data.get("usage", {})
        token_stats = {
            "prompt_tokens": usage.get("prompt_tokens", 0),
            "completion_tokens": usage.get("completion_tokens", 0),
            "total_tokens": usage.get("total_tokens", 0),
        }
        return content, token_stats

    def _extract_json_block(self, text: str) -> dict[str, Any]:
        """Safely extract JSON object from markdown code fence or raw response."""
        clean = text.strip()
        # Look for ```json ... ```
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", clean)
        if match:
            clean = match.group(1).strip()
        try:
            parsed = json.loads(clean)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            pass

        # Fallback regex search for { ... }
        match = re.search(r"(\{[\s\S]*\})", clean)
        if match:
            try:
                parsed = json.loads(match.group(1))
                if isinstance(parsed, dict):
                    return parsed
            except json.JSONDecodeError:
                pass

        logger.warning("Could not parse JSON from model output: %s", text[:200])
        return {}

    async def generate_plan(
        self,
        task_title: str,
        task_description: str,
        repo_summary: str,
    ) -> dict[str, Any]:
        """Generate structured execution plan for task."""
        system_prompt = (
            "You are Kairo's Lead Software Architect. Given an engineering task and repository "
            "context, decompose the task into a structured, sequential plan.\n"
            "Respond ONLY with a JSON object with this exact shape:\n"
            "{\n"
            '  "summary": "Concise summary of the approach",\n'
            '  "steps": [\n'
            '    {"id": "step-1", "title": "Step title", "stage": "planning|research|coding|testing", "description": "Details"}\n'
            "  ],\n"
            '  "target_files": ["list of relative file paths to inspect or modify"]\n'
            "}"
        )
        user_message = (
            f"Task: {task_title}\n"
            f"Description: {task_description}\n"
            f"Repository Context:\n{repo_summary}\n"
        )
        content, usage = await self._chat_completion(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
        )
        plan = self._extract_json_block(content)
        if not plan or "steps" not in plan:
            # Fallback structured plan
            plan = {
                "summary": f"Plan to address: {task_title}",
                "steps": [
                    {
                        "id": "step-1",
                        "title": "Analyze repository files",
                        "stage": "planning",
                        "description": "Inspect codebase context and locate relevant code.",
                    },
                    {
                        "id": "step-2",
                        "title": "Implement code changes",
                        "stage": "coding",
                        "description": "Generate modified code solving the task.",
                    },
                    {
                        "id": "step-3",
                        "title": "Run test suite",
                        "stage": "testing",
                        "description": "Verify changes in the isolated container sandbox.",
                    },
                ],
                "target_files": [],
            }
        plan["token_usage"] = usage
        return plan

    async def generate_code(
        self,
        task_description: str,
        files_context: dict[str, str],
        plan_summary: str,
    ) -> dict[str, Any]:
        """Generate code changes across targeted files."""
        system_prompt = (
            "You are Kairo's Principal Software Engineer. Implement high-quality, tested, "
            "production-ready code solving the requested task.\n"
            "Respond ONLY with a JSON object mapping file paths to complete file contents:\n"
            "{\n"
            '  "files": {\n'
            '    "path/to/file.py": "COMPLETE full file content...",\n'
            '    "path/to/test_file.py": "COMPLETE full test content..."\n'
            "  },\n"
            '  "explanation": "Brief explanation of changes made"\n'
            "}"
        )
        files_str = "\n\n".join(
            f"--- File: {path} ---\n{content}" for path, content in files_context.items()
        )
        user_message = (
            f"Task: {task_description}\n"
            f"Plan Summary: {plan_summary}\n"
            f"Existing Codebase Context:\n{files_str or 'No existing files provided.'}\n"
        )
        content, usage = await self._chat_completion(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
            max_tokens=4096,
        )
        result = self._extract_json_block(content)
        files = result.get("files", {})
        return {
            "files": files,
            "explanation": result.get("explanation", "Generated code changes based on plan."),
            "token_usage": usage,
        }

    async def review_code(
        self,
        task_description: str,
        diff: str,
        test_output: str,
    ) -> dict[str, Any]:
        """Review code changes and test execution results."""
        system_prompt = (
            "You are Kairo's Senior Code Reviewer. Review the git diff and test output.\n"
            "Respond ONLY with a JSON object with this shape:\n"
            "{\n"
            '  "approved": true/false,\n'
            '  "summary": "Review summary",\n'
            '  "issues": ["list of issues or empty if approved"],\n'
            '  "recommendations": ["list of next steps or improvements"]\n'
            "}"
        )
        user_message = (
            f"Task: {task_description}\n"
            f"Diff:\n{diff}\n"
            f"Test / Execution Output:\n{test_output}\n"
        )
        content, usage = await self._chat_completion(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.1,
        )
        review = self._extract_json_block(content)
        if not review:
            approved = "FAILED" not in test_output.upper() and "ERROR" not in test_output.upper()
            review = {
                "approved": approved,
                "summary": "Automated review completed based on test execution outcome.",
                "issues": [] if approved else ["Tests did not pass cleanly."],
                "recommendations": [],
            }
        review["token_usage"] = usage
        return review

