"""Tables. Children's data is kept to the minimum needed: no free text, no device identifiers, no IP addresses."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, BigInteger, Boolean, DateTime, ForeignKey, Index, Integer, SmallInteger, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base, BigId


class Account(Base):
    __tablename__ = "accounts"
    sub: Mapped[str] = mapped_column(String(64), primary_key=True)
    first_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class Learner(Base):
    __tablename__ = "learner_profiles"
    __table_args__ = (UniqueConstraint("owner_sub", "name_key", name="uq_learner_name"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # client-generated UUID
    owner_sub: Mapped[str] = mapped_column(ForeignKey("accounts.sub", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(40))
    name_key: Mapped[str] = mapped_column(String(40))
    avatar: Mapped[str | None] = mapped_column(String(16), nullable=True)
    updated_at: Mapped[int] = mapped_column(BigInteger)  # client clock in ms; decides last-write-wins


class DeletedLearner(Base):
    """Only the id of a deleted profile, so another device cannot silently re-create it. Holds no personal data."""
    __tablename__ = "deleted_learners"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    owner_sub: Mapped[str] = mapped_column(ForeignKey("accounts.sub", ondelete="CASCADE"), index=True)


class Result(Base):
    __tablename__ = "practice_results"
    __table_args__ = (Index("ix_result_learner_seq", "learner_id", "seq"),)
    seq: Mapped[int] = mapped_column(BigId, primary_key=True, autoincrement=True)  # server order, used as the pull cursor
    client_id: Mapped[str] = mapped_column(String(36), unique=True)
    learner_id: Mapped[str] = mapped_column(ForeignKey("learner_profiles.id", ondelete="CASCADE"))
    owner_sub: Mapped[str] = mapped_column(ForeignKey("accounts.sub", ondelete="CASCADE"), index=True)
    grade: Mapped[int] = mapped_column(SmallInteger)
    topics: Mapped[list] = mapped_column(JSON)
    difficulty: Mapped[str] = mapped_column(String(8))
    questions: Mapped[int] = mapped_column(SmallInteger)
    correct: Mapped[int] = mapped_column(SmallInteger)
    time_spent_ms: Mapped[int] = mapped_column(Integer)
    started_at: Mapped[int] = mapped_column(BigInteger)
    finished_at: Mapped[int] = mapped_column(BigInteger)
    items: Mapped[list["ResultItem"]] = relationship(cascade="all, delete-orphan", passive_deletes=True, order_by="ResultItem.position")


class ResultItem(Base):
    __tablename__ = "result_items"
    result_seq: Mapped[int] = mapped_column(ForeignKey("practice_results.seq", ondelete="CASCADE"), primary_key=True)
    position: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    template_id: Mapped[str] = mapped_column(String(80))
    correct: Mapped[bool] = mapped_column(Boolean)
    attempts: Mapped[int] = mapped_column(SmallInteger)
    time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
