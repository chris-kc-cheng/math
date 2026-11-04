"""accounts, learner profiles, practice results, result items

Revision ID: 0001
"""
import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

BigId = sa.BigInteger().with_variant(sa.Integer(), "sqlite")


def upgrade() -> None:
    op.create_table(
        "accounts",
        sa.Column("sub", sa.String(64), primary_key=True),
        sa.Column("first_seen", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "learner_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("owner_sub", sa.String(64), sa.ForeignKey("accounts.sub", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(40), nullable=False),
        sa.Column("name_key", sa.String(40), nullable=False),
        sa.Column("avatar", sa.String(16)),
        sa.Column("updated_at", sa.BigInteger, nullable=False),
        sa.UniqueConstraint("owner_sub", "name_key", name="uq_learner_name"),
    )
    op.create_index("ix_learner_profiles_owner_sub", "learner_profiles", ["owner_sub"])
    op.create_table(
        "deleted_learners",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("owner_sub", sa.String(64), sa.ForeignKey("accounts.sub", ondelete="CASCADE"), nullable=False),
    )
    op.create_index("ix_deleted_learners_owner_sub", "deleted_learners", ["owner_sub"])
    op.create_table(
        "practice_results",
        sa.Column("seq", BigId, primary_key=True, autoincrement=True),
        sa.Column("client_id", sa.String(36), nullable=False, unique=True),
        sa.Column("learner_id", sa.String(36), sa.ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("owner_sub", sa.String(64), sa.ForeignKey("accounts.sub", ondelete="CASCADE"), nullable=False),
        sa.Column("grade", sa.SmallInteger, nullable=False),
        sa.Column("topics", sa.JSON, nullable=False),
        sa.Column("difficulty", sa.String(8), nullable=False),
        sa.Column("questions", sa.SmallInteger, nullable=False),
        sa.Column("correct", sa.SmallInteger, nullable=False),
        sa.Column("time_spent_ms", sa.Integer, nullable=False),
        sa.Column("started_at", sa.BigInteger, nullable=False),
        sa.Column("finished_at", sa.BigInteger, nullable=False),
    )
    op.create_index("ix_result_learner_seq", "practice_results", ["learner_id", "seq"])
    op.create_index("ix_practice_results_owner_sub", "practice_results", ["owner_sub"])
    op.create_table(
        "result_items",
        sa.Column("result_seq", BigId, sa.ForeignKey("practice_results.seq", ondelete="CASCADE"), primary_key=True),
        sa.Column("position", sa.SmallInteger, primary_key=True),
        sa.Column("template_id", sa.String(80), nullable=False),
        sa.Column("correct", sa.Boolean, nullable=False),
        sa.Column("attempts", sa.SmallInteger, nullable=False),
        sa.Column("time_ms", sa.Integer),
    )


def downgrade() -> None:
    for table in ("result_items", "practice_results", "deleted_learners", "learner_profiles", "accounts"):
        op.drop_table(table)
