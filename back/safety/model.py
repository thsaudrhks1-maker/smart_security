from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base

class Zone(Base):
    """3.3 Zone: 작업 구역"""
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    
    level = Column(String, nullable=False, comment="층/구역 (예: 1F, B1, ROOF)")
    name = Column(String, nullable=False, comment="상세 구역명 (예: A구역, E/V홀)")
    type = Column(String, nullable=False, default="INDOOR", comment="타입: INDOOR, OUTDOOR, ROOF, PIT, DANGER")
    
    # 좌표 (옵션, 지도 표시용)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    
    # 구역별 고정 위험 요소 (예: ["추락위험", "환기불량"])
    default_hazards = Column(JSON, nullable=True, comment="해당 구역의 고정 위험 요소 목록")
    
    site = relationship("Site", back_populates="zones")
    daily_plans = relationship("DailyWorkPlan", back_populates="zone")

class SafetyLog(Base):
    """3.6 SafetyLog: 안전 활동/사고 로그 (증빙)"""
    __tablename__ = "safety_logs"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("daily_work_plans.id"), nullable=True, comment="관련 작업 계획 ID")
    
    log_type = Column(String, nullable=False, comment="TRAINING(교육), INSPECTION(점검), INCIDENT(사고), NEAR_MISS(아차사고), VIOLATION(위반)")
    
    timestamp = Column(DateTime, default=datetime.now)
    photos = Column(JSON, nullable=True, comment="사진 URL 리스트 (JSON)")
    note = Column(Text, nullable=True, comment="내용/비고")
    
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    plan = relationship("DailyWorkPlan", back_populates="logs")

class DailyDangerZone(Base):
    """일일 변동 위험 구역 (Daily Active Danger Zone) - 중장비, 화재 등 일시적 위험"""
    __tablename__ = "daily_danger_zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    
    date = Column(String, nullable=False, index=True, comment="YYYY-MM-DD")
    
    risk_type = Column(String, nullable=False, comment="HEAVY_EQUIPMENT(중장비), FIRE(화재), FALL(낙하물), ETC")
    description = Column(String, nullable=False, comment="위험 상세 (예: 이동식 크레인 작업 중)")
    
    # 상세 좌표 (옵션)
    x = Column(Float, nullable=True)
    y = Column(Float, nullable=True)
    z = Column(Float, nullable=True)
    
    zone = relationship("Zone")
