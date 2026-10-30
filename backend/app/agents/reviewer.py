"""Reviewer agent computing git diffs and validating code quality."""

import logging
from typing import Any

from app.agents.state import AgentState
from app.integrations.nvidia_ai import NvidiaAIClient
from app.services.sandbox_service import generate_unified_diff

logger = logging.getLogger(__name__)


class ReviewerAgent:
    """Computes unified diffs and evaluates pull request readiness."""

    def __init__(self, ai_client: NvidiaAIClient) -> None:
        self.ai = ai_client

    async def review(
        self, state: AgentState, test_output: str
    ) -> dict[str, Any]:
        """Review diff and test execution output."""
        state.progress = 85
        diff = generate_unified_diff(state.initial_files, state.current_files)
        state.diff = diff

        state.record_activity(
            "diff",
            "coding",
            f"Synthesized git diff across modified files ({len(diff.splitlines())} lines).",
            diff=diff,
        )

        if self.ai.is_configured():
            try:
                state.record_activity(
                    "tool",
                    "coding",
                    f"Requesting Nebius Token Factory code review ({self.ai.model}) of unified diff and test output.",
                    tool_name="nebius_nemotron_reviewer",
                )
                review_res = await self.ai.review_code(
                    state.task_description, diff, test_output
                )
                approved = review_res.get("approved", True)
                summary = review_res.get("summary", "Review complete.")
                state.record_activity(
                    "message",
                    "completed" if approved else "failed",
                    f"Nebius Token Factory review verdict: {'APPROVED' if approved else 'CHANGES_REQUESTED'} — {summary}",
                )
                return review_res
            except Exception as exc:
                logger.error("Nebius Token Factory review failed: %s. Failing closed without secondary provider fallback.", exc)
                state.record_activity(
                    "error",
                    "coding",
                    f"Nebius Token Factory code review failed ({exc}). Failing closed without secondary AI provider fallback.",
                )
                raise

        # Fallback review based on diff and tests
        has_tests_passed = all(t.get("status") == "passed" for t in state.test_results)
        approved = has_tests_passed and bool(diff)
        summary = (
            "Automated checks and test verification passed successfully."
            if approved
            else "Review detected failing tests or empty diff."
        )
        state.record_activity(
            "message",
            "completed" if approved else "failed",
            f"Review completed: {summary}",
        )
        return {
            "approved": approved,
            "summary": summary,
            "issues": [] if approved else ["Tests failed or changes were empty"],
        }

