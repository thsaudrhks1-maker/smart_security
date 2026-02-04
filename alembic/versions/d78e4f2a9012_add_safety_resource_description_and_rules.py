"""Add safety_resources description and safety_rules

Revision ID: d78e4f2a9012
Revises: c67d8e3d8901
Create Date: 2026-02-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'd78e4f2a9012'
down_revision: Union[str, Sequence[str], None] = 'c67d8e3d8901'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    cols = [c["name"] for c in insp.get_columns("safety_resources")]
    if "description" not in cols:
        op.add_column('safety_resources', sa.Column('description', sa.Text(), nullable=True, comment='장비/장구류 설명 (용도·적용 상황)'))
    if "safety_rules" not in cols:
        op.add_column('safety_resources', sa.Column('safety_rules', sa.JSON(), nullable=True, comment='안전수칙 목록 (JSON 배열)'))


def downgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    cols = [c["name"] for c in insp.get_columns("safety_resources")]
    if "safety_rules" in cols:
        op.drop_column('safety_resources', 'safety_rules')
    if "description" in cols:
        op.drop_column('safety_resources', 'description')
