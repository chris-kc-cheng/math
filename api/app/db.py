from __future__ import annotations

from sqlalchemy import BigInteger, Integer, create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

# SQLite (tests, local development) only auto-increments a plain INTEGER primary key.
BigId = BigInteger().with_variant(Integer(), "sqlite")


class Base(DeclarativeBase):
    pass


def make_engine(url: str):
    options: dict = {"pool_pre_ping": True}
    sqlite = url.startswith("sqlite")
    if sqlite:
        options["connect_args"] = {"check_same_thread": False}
        if url in ("sqlite://", "sqlite:///:memory:"):
            options["poolclass"] = StaticPool
    engine = create_engine(url, **options)
    if sqlite:
        @event.listens_for(engine, "connect")
        def _foreign_keys(dbapi, _record):  # cascade deletes need foreign keys switched on
            dbapi.execute("PRAGMA foreign_keys=ON")
    return engine


def make_sessions(engine):
    return sessionmaker(engine, expire_on_commit=False)
