
from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from back.database import Base
from datetime import datetime

class info_beacons(Base):
    """[INFO] 블루투스 비콘 마스터 (설치 위치 매핑)"""
    __tablename__ = "info_beacons"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, nullable=False, index=True) # 예: "FDA50693-..."
    major = Column(Integer, nullable=False) # 예: 1 (층수)
    minor = Column(Integer, nullable=False) # 예: 101 (구역 ID)
    
    # 매핑된 구역 (어떤 구역에 설치되었는지) - 구역이 사라져도 비콘 정보는 남도록 SET NULL
    zone_id = Column(Integer, ForeignKey("project_zones.id", ondelete="SET NULL"), nullable=True)
    
    description = Column(String, nullable=True) # "1층 계단실 입구", "A구역 중앙 기둥" 등
    
    # 설치 좌표 (선택 사항, 지도 표시용)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

class daily_worker_locations(Base):
    """[DAILY] 작업자 위치 추적 로그 (비콘 기반)"""
    __tablename__ = "daily_worker_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("sys_users.id"), nullable=False)
    beacon_id = Column(Integer, ForeignKey("info_beacons.id"), nullable=False)
    rssi = Column(Integer, nullable=False) # 신호 강도 (-59, -80 등)
    distance = Column(Float, nullable=True) # 추정 거리 (m)
    timestamp = Column(DateTime, default=datetime.now)
