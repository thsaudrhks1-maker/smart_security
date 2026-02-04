"""Add site floor_plan_url

Revision ID: b56f8c2a7780
Revises: a45e9c1b766f
Create Date: 2026-01-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b56f8c2a7780'
down_revision: Union[str, Sequence[str], None] = 'a45e9c1b766f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('sites', sa.Column('floor_plan_url', sa.String(), nullable=True, comment='도면 이미지 URL (1개 층 기준)'))


def downgrade() -> None:
    op.drop_column('sites', 'floor_plan_url')
