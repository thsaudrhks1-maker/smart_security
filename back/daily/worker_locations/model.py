
from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from back.database import Base
from datetime import datetime

class daily_worker_locations(Base):
    """[DAILY] 작업자 위치 추적 로그"""
    __tablename__ = "daily_worker_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("sys_users.id"), nullable=False)
    
    # 추적 방식: GPS 또는 BLE (Bluetooth Low Energy)
    tracking_mode = Column(String, default="GPS", comment="GPS, BLE")
    
    # 1. GPS 좌표
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    
    # 2. 비콘 기반 (장비 테이블 직접 참조)
    beacon_id = Column(Integer, ForeignKey("device_beacons.id"), nullable=True, comment="감지된 비콘 ID")
    rssi = Column(Integer, nullable=True) # 신호 강도
    distance = Column(Float, nullable=True) # 추정 거리 (m)
    
    # 3. [핵심] 판별된 구역 (Calculated Zone)
    zone_id = Column(Integer, ForeignKey("project_zones.id", ondelete="SET NULL"), nullable=True, comment="최종 판별 구역")
    
    timestamp = Column(DateTime, default=datetime.now)
