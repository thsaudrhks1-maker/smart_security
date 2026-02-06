
from sqlalchemy import Column, Integer, String, JSON, ForeignKey, UniqueConstraint
from back.database import Base

class content_safety_gear(Base):
    """[CONTENT] 안전 보호구/장비 마스터"""
    __tablename__ = "content_safety_gear"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False, comment="PPE, HEAVY, TOOL")
    icon = Column(String, nullable=True)
    safety_rules = Column(JSON, nullable=True)

class content_work_gear_map(Base):
    """[CONTENT] 공종 ↔ 필수 장비 연결"""
    __tablename__ = "content_work_gear_map"
    __table_args__ = (UniqueConstraint("template_id", "resource_id", name="uq_content_gear"),)
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("content_work_templates.id", ondelete="CASCADE"), nullable=False)
    resource_id = Column(Integer, ForeignKey("content_safety_gear.id", ondelete="CASCADE"), nullable=False)
