
from sqlalchemy import Column, Integer, String, JSON
from back.database import Base

class content_work_info(Base):
    """[CONTENT] 표준 공종별 작업 정보"""
    __tablename__ = "content_work_info"
    id = Column(Integer, primary_key=True, index=True)
    work_type = Column(String, nullable=False, unique=True, comment="작업종류 (예: 고소작업)")
    base_risk_score = Column(Integer, default=10)
    checklist_items = Column(JSON, nullable=True, comment="표준 필수 점검사항")
