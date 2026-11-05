"""Request validation. Everything is bounded; there is no free text beyond a short display name."""
from __future__ import annotations

import re
import unicodedata
import uuid
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator

MIN_TIME_MS = 1_577_836_800_000  # 2020-01-01; nothing earlier can be a real round
MAX_ROUND_MS = 24 * 3600 * 1000  # time_spent_ms cap; a round may be resumed days later, so the span itself is not capped
ID_PATTERN = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
DIFFICULTIES = {"simple", "medium", "hard", "auto"}
CONTROL = re.compile(r"[\u0000-\u001f\u007f-\u009f  ]")

Token = Annotated[str, StringConstraints(pattern=r"^[A-Za-z0-9._:-]{1,80}$")]
Millis = Annotated[int, Field(ge=0, le=4_102_444_800_000)]


def valid_id(value: str) -> str:
    """Learner and result ids are lowercase UUIDs generated on the device."""
    if not isinstance(value, str) or not ID_PATTERN.match(value):
        raise ValueError("must be a lowercase UUID")
    try:
        uuid.UUID(value)
    except ValueError as exc:
        raise ValueError("must be a lowercase UUID") from exc
    return value


def clean_name(value: str) -> str:
    text = re.sub(r"\s+", " ", unicodedata.normalize("NFKC", value)).strip()
    if not text or len(text) > 40 or CONTROL.search(text):
        raise ValueError("Enter a name from 1 to 40 characters.")
    return text


def name_key(name: str) -> str:
    return name.casefold()


class LearnerIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    avatar: str | None = None
    updated_at: Millis

    @field_validator("name")
    @classmethod
    def _name(cls, value: str) -> str:
        return clean_name(value)

    @field_validator("avatar")
    @classmethod
    def _avatar(cls, value: str | None) -> str | None:
        if value is None or value == "":
            return None
        if len(value) > 8 or CONTROL.search(value) or any(c.isalnum() and c.isascii() for c in value):
            raise ValueError("avatar must be a single emoji")
        return value


class ItemIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    template_id: Token
    correct: bool
    attempts: Annotated[int, Field(ge=0, le=50)] = 0
    time_ms: Annotated[int, Field(ge=0, le=3_600_000)] | None = None


class ResultIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    learner_id: str
    grade: Annotated[int, Field(ge=1, le=10)]
    topics: Annotated[list[Annotated[str, StringConstraints(pattern=r"^[A-Za-z0-9._:-]{1,40}$")]], Field(max_length=20)] = []
    difficulty: str
    questions: Annotated[int, Field(ge=1, le=50)]
    correct: Annotated[int, Field(ge=0, le=50)]
    time_spent_ms: Annotated[int, Field(ge=0, le=MAX_ROUND_MS)]
    started_at: Millis
    finished_at: Millis
    items: Annotated[list[ItemIn], Field(min_length=1, max_length=50)]

    @field_validator("id", "learner_id")
    @classmethod
    def _ids(cls, value: str) -> str:
        return valid_id(value)

    @field_validator("difficulty")
    @classmethod
    def _difficulty(cls, value: str) -> str:
        if value not in DIFFICULTIES:
            raise ValueError("unknown difficulty")
        return value

    @model_validator(mode="after")
    def _consistent(self) -> "ResultIn":
        if len(self.items) != self.questions:
            raise ValueError("items must match the number of questions")
        if self.correct != sum(item.correct for item in self.items):
            raise ValueError("correct must match the items")
        if self.started_at < MIN_TIME_MS or self.finished_at < self.started_at:
            raise ValueError("timestamps are not plausible")
        return self


class ResultBatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    # Items are validated one by one so a single bad result cannot block the rest of a queue.
    results: Annotated[list[dict], Field(min_length=1, max_length=50)]
