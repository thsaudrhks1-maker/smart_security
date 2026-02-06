
from sqlalchemy import Column, Integer, String, JSON, Text
from back.database import Base

class content_danger_info(Base):
    """[CONTENT] 위험 요소 정보 마스터"""
    __tablename__ = "content_danger_info"
    id = Column(Integer, primary_key=True, index=True)
    danger_type = Column(String, nullable=False, unique=True, comment="위험 유형 (중장비, 화재, 낙하물, 감전 등)")
    icon = Column(String, nullable=True, comment="아이콘 이름")
    color = Column(String, nullable=True, comment="표시 색상 (hex)")
    description = Column(Text, nullable=True, comment="위험 요소 설명")
    safety_guidelines = Column(JSON, nullable=True, comment="안전 수칙")
    risk_level = Column(Integer, default=3, comment="기본 위험도 (1-5)")
