
from sqlalchemy import Column, Integer, String, JSON
from back.database import Base

class work_templates(Base):
    """[CONTENT] 표준 공종별 작업 매뉴얼 (기존 content_work_templates)"""
    __tablename__ = "work_templates"
    id = Column(Integer, primary_key=True, index=True)
    work_type = Column(String, nullable=False, unique=True, comment="작업종류 (예: 고소작업)")
    base_risk_score = Column(Integer, default=10)
    checklist_items = Column(JSON, nullable=True, comment="표준 필수 점검사항")
