"""add_report_status_to_daily_danger_zones

Revision ID: 5caba27cd3b8
Revises: 83ac13515ae6
Create Date: 2026-02-05 16:16:16.489127

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5caba27cd3b8'
down_revision: Union[str, Sequence[str], None] = '83ac13515ae6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """근로자 신고 기능을 위한 daily_danger_zones 확장 + 사진 참조 테이블"""
    # 1. daily_danger_zones 테이블 확장
    op.add_column('daily_danger_zones', sa.Column('status', sa.String(), nullable=False, server_default='APPROVED', comment='PENDING(신고 대기), APPROVED(승인됨), REJECTED(반려)'))
    op.add_column('daily_danger_zones', sa.Column('reported_by', sa.Integer(), nullable=True, comment='신고자 ID (근로자)'))
    op.add_column('daily_danger_zones', sa.Column('approved_by', sa.Integer(), nullable=True, comment='승인자 ID (관리자)'))
    op.add_column('daily_danger_zones', sa.Column('approved_at', sa.DateTime(), nullable=True, comment='승인 시간'))
    op.add_column('daily_danger_zones', sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()'), comment='신고/등록 시간'))
    
    op.create_foreign_key('fk_danger_zone_reporter', 'daily_danger_zones', 'users', ['reported_by'], ['id'])
    op.create_foreign_key('fk_danger_zone_approver', 'daily_danger_zones', 'users', ['approved_by'], ['id'])
    
    # 2. danger_zone_images 테이블 생성 (사진 참조 테이블)
    op.create_table(
        'danger_zone_images',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('danger_zone_id', sa.Integer(), nullable=False, comment='위험 구역 ID'),
        sa.Column('image_name', sa.String(), nullable=False, comment='파일명 (예: danger_zone_15_1.jpg)'),
        sa.Column('uploaded_at', sa.DateTime(), server_default=sa.text('NOW()'), comment='업로드 시간'),
        sa.Column('uploaded_by', sa.Integer(), nullable=True, comment='업로드한 사용자 ID'),
        sa.ForeignKeyConstraint(['danger_zone_id'], ['daily_danger_zones.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by'], ['users.id'])
    )


def downgrade() -> None:
    """롤백"""
    # 2. danger_zone_images 테이블 삭제
    op.drop_table('danger_zone_images')
    
    # 1. daily_danger_zones 컬럼 제거
    op.drop_constraint('fk_danger_zone_approver', 'daily_danger_zones', type_='foreignkey')
    op.drop_constraint('fk_danger_zone_reporter', 'daily_danger_zones', type_='foreignkey')
    
    op.drop_column('daily_danger_zones', 'created_at')
    op.drop_column('daily_danger_zones', 'approved_at')
    op.drop_column('daily_danger_zones', 'approved_by')
    op.drop_column('daily_danger_zones', 'reported_by')
    op.drop_column('daily_danger_zones', 'status')
