from alembic import command
from alembic.config import Config
from pathlib import Path
from sqlalchemy import inspect

from app.db import Base, make_engine
from app import models  # noqa: F401


def test_migration_builds_the_same_tables_as_the_models(tmp_path):
    root = Path(__file__).resolve().parents[1]
    url = f"sqlite:///{tmp_path / 'm.db'}"
    cfg = Config(str(root / "alembic.ini"))
    cfg.set_main_option("script_location", str(root / "migrations"))
    cfg.attributes["url"] = url
    command.upgrade(cfg, "head")
    migrated = inspect(make_engine(url))
    for table in Base.metadata.sorted_tables:
        assert {c["name"] for c in migrated.get_columns(table.name)} == {c.name for c in table.columns}, table.name
    command.downgrade(cfg, "base")
