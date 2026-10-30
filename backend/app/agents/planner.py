"""Agent planner for requirement analysis and task decomposition."""

import logging
from typing import Any

from app.agents.state import AgentState
from app.integrations.nvidia_ai import NvidiaAIClient

logger = logging.getLogger(__name__)


class PlannerAgent:
    """Decomposes a developer task into structured executable steps."""

    def __init__(self, ai_client: NvidiaAIClient) -> None:
        self.ai = ai_client

    async def create_plan(
        self, state: AgentState, repo_summary: str
    ) -> dict[str, Any]:
        """Create structured plan using configured AI provider or fallback."""
        state.stage = "planning"
        state.progress = 15
        state.record_activity(
            "status",
            "planning",
            f"Analyzing task requirements and repository context: {state.task_title}",
        )

        if self.ai.is_configured():
            try:
                state.record_activity(
                    "tool",
                    "planning",
                    f"Querying Nebius Token Factory model ({self.ai.model}) for task decomposition.",
                    tool_name="nebius_nemotron_planner",
                    tool_input=state.task_title,
                )
                plan = await self.ai.generate_plan(
                    state.task_title, state.task_description, repo_summary
                )
                state.plan = plan
                state.record_activity(
                    "message",
                    "planning",
                    f"Plan formulated with {len(plan.get('steps', []))} steps via Nebius Token Factory: {plan.get('summary', '')}",
                )
                return plan
            except Exception as exc:
                logger.error("Nebius Token Factory planning failed: %s. Failing closed without secondary provider fallback.", exc)
                state.record_activity(
                    "error",
                    "planning",
                    f"Nebius Token Factory inference failed ({exc}). Failing closed without secondary AI provider fallback.",
                )
                raise

        # Deterministic structured planning fallback
        plan = {
            "summary": f"Decomposed workflow to execute: {state.task_title}",
            "steps": [
                {
                    "id": "step-1",
                    "title": "Inspect codebase context",
                    "stage": "planning",
                    "description": "Examine relevant source files and module exports.",
                },
                {
                    "id": "step-2",
                    "title": "Synthesize candidate implementation",
                    "stage": "coding",
                    "description": "Generate modified code solving the task specifications.",
                },
                {
                    "id": "step-3",
                    "title": "Execute test suite in isolated runner",
                    "stage": "testing",
                    "description": "Run sandbox tests to verify functionality.",
                },
            ],
            "target_files": list(state.initial_files.keys()),
        }
        state.plan = plan
        state.record_activity(
            "message",
            "planning",
            f"Formulated execution plan: {plan['summary']}",
        )
        return plan

