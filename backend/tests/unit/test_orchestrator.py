"""Unit tests for agent orchestrator, planner, coder, and reviewer."""

from uuid import UUID
import pytest

from app.agents.coding_agent import CodingAgent
from app.agents.orchestrator import AgentOrchestrator
from app.agents.planner import PlannerAgent
from app.agents.reviewer import ReviewerAgent
from app.agents.state import AgentState
from app.integrations.nvidia_ai import NvidiaAIClient


USER_ID = UUID("f3b276b8-377f-48ce-88e0-b8c93a16c86a")
PROJECT_ID = UUID("061f6320-e711-4074-9689-b762b63cf4f4")
TASK_ID = UUID("a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d")


@pytest.mark.asyncio
async def test_agent_orchestrator_full_loop_offline():
    orchestrator = AgentOrchestrator()
    state = await orchestrator.execute_task_workflow(
        user_id=USER_ID,
        project_id=PROJECT_ID,
        task_id=TASK_ID,
        task_title="Add healthcheck endpoint",
        task_description="Create a health endpoint returning 200 OK",
        initial_files={},
        supabase_client=None,
        language="python",
    )

    assert state.status in ("completed", "failed")
    assert state.progress == 100
    assert len(state.activity) >= 3
    assert any(e.stage == "planning" for e in state.activity)
    assert any(e.stage == "coding" for e in state.activity)
    assert any(e.stage == "testing" for e in state.activity)


@pytest.mark.asyncio
async def test_agent_orchestrator_cancellation():
    orchestrator = AgentOrchestrator()
    state = AgentState(
        task_id=TASK_ID,
        session_id=TASK_ID,
        project_id=PROJECT_ID,
        user_id=USER_ID,
        task_title="Test cancellation",
        task_description="Testing cancellation token",
    )
    orchestrator.active_sessions[str(TASK_ID)] = state
    assert orchestrator.cancel_task(str(TASK_ID)) is True
    assert state.status == "cancelled"
    assert state.is_cancelled is True


@pytest.mark.asyncio
async def test_agent_orchestrator_nebius_inference_workflow(monkeypatch):
    """Verify that when Nebius Token Factory is configured, the agent workflow coordinates planning, coding, and review through it."""
    from unittest.mock import AsyncMock

    orchestrator = AgentOrchestrator()
    orchestrator.ai_client.api_key = "nebius-token-factory-hackathon-key"
    assert orchestrator.ai_client.is_configured() is True
    assert "nebius" in orchestrator.ai_client.base_url

    # Mock the three Nebius inference methods
    orchestrator.planner.ai.generate_plan = AsyncMock(return_value={
        "summary": "Plan created with Nebius Token Factory",
        "steps": [{"id": "step-1", "title": "Implement feature", "stage": "coding", "description": "Write code"}],
        "target_files": ["main.py"],
        "token_usage": {"total_tokens": 120},
    })

    orchestrator.coder.ai.generate_code = AsyncMock(return_value={
        "files": {"main.py": "def test_ok():\n    return True\n"},
        "explanation": "Synthesized code via Nebius Nemotron",
        "token_usage": {"total_tokens": 250},
    })

    orchestrator.reviewer.ai.review_code = AsyncMock(return_value={
        "approved": True,
        "summary": "Approved by Nebius Reviewer",
        "issues": [],
        "recommendations": [],
        "token_usage": {"total_tokens": 80},
    })

    state = await orchestrator.execute_task_workflow(
        user_id=USER_ID,
        project_id=PROJECT_ID,
        task_id=TASK_ID,
        task_title="Build user feature",
        task_description="Implement tested feature using Nebius",
        initial_files={},
        supabase_client=None,
        language="python",
    )

    assert state.progress == 100
    assert state.plan["summary"] == "Plan created with Nebius Token Factory"
    assert "main.py" in state.current_files
    assert any(getattr(e, "toolName", "") == "nebius_nemotron_planner" for e in state.activity)
    assert any(getattr(e, "toolName", "") == "nebius_nemotron_coder" for e in state.activity)
    assert any(getattr(e, "toolName", "") == "nebius_nemotron_reviewer" for e in state.activity)


