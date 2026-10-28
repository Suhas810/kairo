"""Tests for the existing agent task request contract."""

from uuid import UUID

import pytest
from pydantic import ValidationError

from app.schemas.agent import AgentTaskRequest


def test_agent_task_request_normalizes_task_and_defaults_mode() -> None:
    request = AgentTaskRequest(
        project_id=UUID("061f6320-e711-4074-9689-b762b63cf4f4"),
        task="  Add a health check  ",
    )

    assert request.task == "Add a health check"
    assert request.mode == "autonomous"


@pytest.mark.parametrize("task", ["", "   "])
def test_agent_task_request_rejects_blank_task(task: str) -> None:
    with pytest.raises(ValidationError):
        AgentTaskRequest(
            project_id=UUID("061f6320-e711-4074-9689-b762b63cf4f4"),
            task=task,
        )


def test_agent_task_request_rejects_unsupported_fields() -> None:
    with pytest.raises(ValidationError):
        AgentTaskRequest(
            project_id=UUID("061f6320-e711-4074-9689-b762b63cf4f4"),
            task="Add a health check",
            user_id="untrusted",
        )
