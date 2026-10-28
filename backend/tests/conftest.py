"""Shared deterministic fixtures for backend tests."""

from collections.abc import Iterable
from types import SimpleNamespace
from typing import Any
from uuid import UUID

import pytest

USER_ID = UUID("f3b276b8-377f-48ce-88e0-b8c93a16c86a")
OTHER_USER_ID = UUID("74a440b3-88d9-43ce-b6e4-15653fa18730")
PROJECT_ID = UUID("061f6320-e711-4074-9689-b762b63cf4f4")
OTHER_PROJECT_ID = UUID("e5433a03-3cb2-4c7b-8db3-02c5cab10925")


class ProjectQueryStub:
    """In-memory subset of the Supabase query API used by project_service."""

    def __init__(self, rows: list[dict[str, Any]]) -> None:
        self.rows = rows
        self.filters: dict[str, str] = {}
        self.operation = "select"
        self.values: dict[str, Any] = {}
        self.maximum: int | None = None
        self.ordering: tuple[str, bool] | None = None

    def select(self, *_args: Any, **_kwargs: Any) -> "ProjectQueryStub":
        return self

    def eq(self, key: str, value: str) -> "ProjectQueryStub":
        self.filters[key] = value
        return self

    def order(self, key: str, desc: bool = False) -> "ProjectQueryStub":
        self.ordering = (key, desc)
        return self

    def limit(self, maximum: int) -> "ProjectQueryStub":
        self.maximum = maximum
        return self

    def insert(self, values: dict[str, Any]) -> "ProjectQueryStub":
        self.operation = "insert"
        self.values = values
        return self

    def update(self, values: dict[str, Any]) -> "ProjectQueryStub":
        self.operation = "update"
        self.values = values
        return self

    def delete(self) -> "ProjectQueryStub":
        self.operation = "delete"
        return self

    def execute(self) -> SimpleNamespace:
        if self.operation == "insert":
            row = {
                "id": str(UUID("fc427b77-68ea-4703-9cf7-36153b2a6295")),
                **self.values,
            }
            self.rows.append(row)
            return SimpleNamespace(data=[row])

        matching = [
            row
            for row in self.rows
            if all(str(row.get(key)) == value for key, value in self.filters.items())
        ]

        if self.operation == "update":
            for row in matching:
                row.update(self.values)
        elif self.operation == "delete":
            self.rows[:] = [row for row in self.rows if row not in matching]
            matching = [{"id": row.get("id")} for row in matching]

        if self.ordering is not None:
            key, descending = self.ordering
            matching.sort(key=lambda row: row.get(key) or "", reverse=descending)
        if self.maximum is not None:
            matching = matching[: self.maximum]
        return SimpleNamespace(data=matching)


class ProjectClientStub:
    def __init__(self, rows: Iterable[dict[str, Any]]) -> None:
        self.rows = list(rows)

    def table(self, name: str) -> ProjectQueryStub:
        if name != "projects":
            raise AssertionError(f"Unexpected table: {name}")
        return ProjectQueryStub(self.rows)


@pytest.fixture
def project_ids() -> tuple[UUID, UUID, UUID, UUID]:
    return USER_ID, OTHER_USER_ID, PROJECT_ID, OTHER_PROJECT_ID


@pytest.fixture
def project_record() -> dict[str, str]:
    return {
        "id": str(PROJECT_ID),
        "user_id": str(USER_ID),
        "name": "Owned project",
    }


@pytest.fixture
def project_client(project_record: dict[str, str]) -> ProjectClientStub:
    return ProjectClientStub(
        [
            project_record,
            {
                "id": str(OTHER_PROJECT_ID),
                "user_id": str(OTHER_USER_ID),
                "name": "Another user's project",
            },
        ]
    )
