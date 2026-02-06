
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, Date
from back.database import Base
from datetime import datetime

class daily_safety_logs(Base):
    """[DAILY] 안전 점검 기록"""
    __tablename__ = "daily_safety_logs"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("sys_users.id", ondelete="CASCADE"), nullable=False)
    log_type = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

class daily_danger_zones(Base):
    """[DAILY] 일일 동적 위험 구역"""
    __tablename__ = "daily_danger_zones"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("project_zones.id", ondelete="CASCADE"), nullable=False)
    danger_info_id = Column(Integer, ForeignKey("content_danger_info.id", ondelete="SET NULL"), nullable=True, comment="위험 요소 템플릿")
    date = Column(Date, nullable=False)
    risk_type = Column(String, nullable=True, comment="커스텀 위험 유형 (danger_info_id 없을 시)")
    description = Column(String, nullable=True)

class daily_danger_images(Base):
    """[DAILY] 위험 구역 현장 사진"""
    __tablename__ = "daily_danger_images"
    id = Column(Integer, primary_key=True, index=True)
    danger_zone_id = Column(Integer, ForeignKey("daily_danger_zones.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
