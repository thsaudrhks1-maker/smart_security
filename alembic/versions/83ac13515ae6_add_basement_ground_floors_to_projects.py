"""add_basement_ground_floors_to_projects

Revision ID: 83ac13515ae6
Revises: 9fb92028d29b
Create Date: 2026-02-05 14:44:08.474801

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '83ac13515ae6'
down_revision: Union[str, Sequence[str], None] = '9fb92028d29b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add basement_floors and ground_floors to projects (if not exists)."""
    # 컬럼이 이미 존재하면 건너뛰기 (Antigravity가 추가했을 가능성)
    from sqlalchemy import inspect
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns('projects')]
    
    if 'basement_floors' not in columns:
        op.add_column('projects', sa.Column('basement_floors', sa.Integer(), nullable=True, server_default='0', comment='지하 층수 (B1~Bn)'))
    if 'ground_floors' not in columns:
        op.add_column('projects', sa.Column('ground_floors', sa.Integer(), nullable=True, server_default='3', comment='지상 층수 (1F~nF)'))
    
    # 기존 프로젝트에 기본값 세팅
    op.execute("UPDATE projects SET basement_floors = 0 WHERE basement_floors IS NULL")
    op.execute("UPDATE projects SET ground_floors = 3 WHERE ground_floors IS NULL")


def downgrade() -> None:
    """Remove basement_floors and ground_floors from projects."""
    op.drop_column('projects', 'ground_floors')
    op.drop_column('projects', 'basement_floors')
