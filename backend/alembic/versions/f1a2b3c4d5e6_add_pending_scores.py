"""add pending scores columns

Revision ID: f1a2b3c4d5e6
Revises: d8e4f2a7b9c1
Create Date: 2026-01-31 00:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "f1a2b3c4d5e6"
down_revision = "d8e4f2a7b9c1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("matches", sa.Column("pending_score1", sa.Integer(), nullable=True))
    op.add_column("matches", sa.Column("pending_score2", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("matches", "pending_score2")
    op.drop_column("matches", "pending_score1")
