"""add_grid_system_to_projects_and_zones

Revision ID: 9fb92028d29b
Revises: b56f8c2a7780
Create Date: 2026-02-05 12:48:25.315243

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9fb92028d29b'
down_revision: Union[str, Sequence[str], None] = 'b56f8c2a7780'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Add 3D grid system to projects and zones."""
    # 1. projects 테이블에 그리드 설정 컬럼 추가
    op.add_column('projects', sa.Column('grid_spacing', sa.Numeric(precision=10, scale=8), nullable=True, comment='그리드 간격 (한 칸 크기, 0.00025도 등)'))
    op.add_column('projects', sa.Column('grid_rows', sa.Integer(), nullable=True, server_default='10', comment='세로 격자 수'))
    op.add_column('projects', sa.Column('grid_cols', sa.Integer(), nullable=True, server_default='10', comment='가로 격자 수'))
    
    # 2. zones 테이블에 3D 그리드 좌표 추가 (x, y, z)
    op.add_column('zones', sa.Column('grid_x', sa.Integer(), nullable=True, comment='그리드 X 좌표 (0부터 시작, 가로 칸 번호)'))
    op.add_column('zones', sa.Column('grid_y', sa.Integer(), nullable=True, comment='그리드 Y 좌표 (0부터 시작, 세로 칸 번호)'))
    op.add_column('zones', sa.Column('grid_z', sa.Integer(), nullable=True, comment='그리드 Z 좌표 (층수, 0=B1, 1=1F, 2=2F)'))
    
    # 3. 기존 projects에 기본값 세팅
    op.execute("UPDATE projects SET grid_spacing = 0.00025 WHERE grid_spacing IS NULL")
    op.execute("UPDATE projects SET grid_rows = 10 WHERE grid_rows IS NULL")
    op.execute("UPDATE projects SET grid_cols = 10 WHERE grid_cols IS NULL")
    
    # 4. 기존 zones에 grid_z 기본값 세팅 (level에서 추출)
    op.execute("UPDATE zones SET grid_z = 1 WHERE grid_z IS NULL")  # 기본값 1층


def downgrade() -> None:
    """Downgrade schema: Remove 3D grid system columns."""
    # zones 테이블에서 3D 그리드 좌표 제거
    op.drop_column('zones', 'grid_z')
    op.drop_column('zones', 'grid_y')
    op.drop_column('zones', 'grid_x')
    
    # projects 테이블에서 그리드 설정 제거
    op.drop_column('projects', 'grid_cols')
    op.drop_column('projects', 'grid_rows')
    op.drop_column('projects', 'grid_spacing')
