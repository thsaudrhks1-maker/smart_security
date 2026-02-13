
from sqlalchemy import Column, Integer, String, DateTime, Date, Float
from back.database import Base
from datetime import datetime

class project_master(Base):
    """[PROJECT] 최상위 프로젝트 마스터"""
    __tablename__ = "project_master"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    location_address = Column(String, nullable=True)
    lat = Column(Float, default=37.5665)
    lng = Column(Float, default=126.9780)
    
    # 격자 및 층수 설정 (Digital Twin 기초)
    grid_cols = Column(Integer, default=5) # 가로 칸 수
    grid_rows = Column(Integer, default=5) # 세로 칸 수
    grid_spacing = Column(Float, default=10.0) # 격자 간격 (미터)
    grid_angle = Column(Float, default=0.0) # [NEW] 격자 회전 각도 (Degree)
    floors_above = Column(Integer, default=1) # 지상 층수
    floors_below = Column(Integer, default=0) # 지하 층수
    
    budget = Column(Integer, nullable=True)
    description = Column(String, nullable=True)
    client_company = Column(String, nullable=True)
    constructor_company = Column(String, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
