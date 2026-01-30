"""add dashboard_show_standings column

Revision ID: d8e4f2a7b9c1
Revises: c4a7d9e2f1b3
Create Date: 2026-01-30 00:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "d8e4f2a7b9c1"
down_revision = "c4a7d9e2f1b3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "tournaments",
        sa.Column("dashboard_show_standings", sa.Boolean(), nullable=False, server_default="t"),
    )


def downgrade() -> None:
    op.drop_column("tournaments", "dashboard_show_standings")
