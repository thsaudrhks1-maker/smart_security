from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base

class SafetyRule(Base):
    __tablename__ = "safety_rules"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False, comment="카테고리 (화재, 추락, 감전 등)")
    title = Column(String, nullable=False, comment="수칙명")
    description = Column(Text, nullable=True, comment="상세 내용/가이드")
    
    created_at = Column(DateTime, default=datetime.now)

class DangerZone(Base):
    """위험 구역 정의 (지도 표시용)"""
    __tablename__ = "danger_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, comment="구역명")
    description = Column(String, nullable=True, comment="위험 사유")
    risk_level = Column(String, default="HIGH", comment="위험 등급")
    
    # 지도 좌표 (원형 Geofence)
    latitude = Column(Float, nullable=False, comment="위도")
    longitude = Column(Float, nullable=False, comment="경도")
    radius = Column(Float, default=10.0, comment="반경 (미터)")
    
    is_active = Column(Boolean, default=True, comment="활성화 여부")
