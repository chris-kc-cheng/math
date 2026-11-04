from alembic import context

from app import models  # noqa: F401  (registers the tables)
from app.config import Settings
from app.db import Base, make_engine

target_metadata = Base.metadata


def run() -> None:
    url = context.config.attributes.get("url") or Settings.from_env().database_url
    engine = make_engine(url)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, render_as_batch=url.startswith("sqlite"))
        with context.begin_transaction():
            context.run_migrations()


run()
