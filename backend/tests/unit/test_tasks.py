"""Unit tests for task lifecycle and validation."""

from uuid import UUID
import pytest
from pydantic import ValidationError

from app.schemas.task import TaskCreate, TaskUpdate


PROJECT_ID = UUID("061f6320-e711-4074-9689-b762b63cf4f4")


def test_task_create_validation():
    valid = TaskCreate(
        project_id=PROJECT_ID,
        title="  Fix login redirect bug  ",
        description="Fix edge case in redirect loop",
        priority="urgent",
        task_type="bug_fix",
    )
    assert valid.title == "Fix login redirect bug"
    assert valid.priority == "urgent"
    assert valid.task_type == "bug_fix"


def test_task_create_rejects_blank_title():
    with pytest.raises(ValidationError):
        TaskCreate(
            project_id=PROJECT_ID,
            title="   ",
        )


def test_task_update_requires_at_least_one_field():
    with pytest.raises(ValidationError):
        TaskUpdate()


def test_task_update_normalizes_title():
    update = TaskUpdate(title="  Refactor auth routes  ")
    assert update.title == "Refactor auth routes"

