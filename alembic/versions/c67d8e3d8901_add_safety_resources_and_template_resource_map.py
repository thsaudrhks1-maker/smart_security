"""Add safety_resources and template_resource_map

Revision ID: c67d8e3d8901
Revises: b56f8c2a7780
Create Date: 2026-02-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'c67d8e3d8901'
down_revision: Union[str, Sequence[str], None] = 'b56f8c2a7780'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'safety_resources',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False, comment='명칭 (예: 그네형 안전대, 15톤 덤프)'),
        sa.Column('type', sa.String(), nullable=False, comment='PPE(장구류), HEAVY(중장비), TOOL(공구)'),
        sa.Column('icon', sa.String(), nullable=True, comment='아이콘 이름 (프론트 렌더링용)'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_safety_resources_id'), 'safety_resources', ['id'], unique=False)
    op.create_index(op.f('ix_safety_resources_type'), 'safety_resources', ['type'], unique=False)

    op.create_table(
        'template_resource_map',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('template_id', sa.Integer(), nullable=False),
        sa.Column('resource_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['resource_id'], ['safety_resources.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['template_id'], ['work_templates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('template_id', 'resource_id', name='uq_template_resource'),
    )
    op.create_index(op.f('ix_template_resource_map_id'), 'template_resource_map', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_template_resource_map_id'), table_name='template_resource_map')
    op.drop_table('template_resource_map')
    op.drop_index(op.f('ix_safety_resources_type'), table_name='safety_resources')
    op.drop_index(op.f('ix_safety_resources_id'), table_name='safety_resources')
    op.drop_table('safety_resources')
