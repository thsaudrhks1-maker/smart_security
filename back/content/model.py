
from sqlalchemy import Column, Integer, String, ForeignKey, JSON, UniqueConstraint
from back.database import Base

class content_work_templates(Base):
    """[CONTENT] 표준 공종 템플릿"""
    __tablename__ = "content_work_templates"
    id = Column(Integer, primary_key=True, index=True)
    work_type = Column(String, nullable=False, unique=True)
    base_risk_score = Column(Integer, default=10)
    checklist_items = Column(JSON, nullable=True) # 표준 체크리스트

class content_safety_gear(Base):
    """[CONTENT] 안전 장비 마스터"""
    __tablename__ = "content_safety_gear"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # PPE, HEAVY
    icon = Column(String, nullable=True)
    safety_rules = Column(JSON, nullable=True)

class content_work_gear_map(Base):
    """[CONTENT] 공종별 필수 장비 매핑"""
    __tablename__ = "content_work_gear_map"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("content_work_templates.id", ondelete="CASCADE"), nullable=False)
    resource_id = Column(Integer, ForeignKey("content_safety_gear.id", ondelete="CASCADE"), nullable=False)
