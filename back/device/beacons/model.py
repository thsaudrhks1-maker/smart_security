
from sqlalchemy import Column, Integer, String, ForeignKey, Float
from back.database import Base

class device_beacons(Base):
    """[DEVICE] 비콘 장비 (IoT 하드웨어)"""
    __tablename__ = "device_beacons"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, nullable=False, index=True, comment="비콘 UUID")
    major = Column(Integer, nullable=False, comment="그룹 식별자 (Major ID)")
    minor = Column(Integer, nullable=False, comment="개별 식별자 (Minor ID)")
    
    # 설치된 구역과 1:1 매핑 (Physical Location)
    zone_id = Column(Integer, ForeignKey("project_zones.id", ondelete="SET NULL"), nullable=True, comment="설치 구역")
    
    description = Column(String, nullable=True, comment="상세 위치 설명 (예: 1-C3 기둥)")
    mac_address = Column(String, nullable=True, comment="MAC 주소 (선택)")

