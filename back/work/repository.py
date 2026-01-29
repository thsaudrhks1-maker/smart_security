from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base

class DailyJob(Base):
    __tablename__ = "daily_jobs"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.now, nullable=False, comment="작업 일자")
    title = Column(String, nullable=False, comment="작업명 (예: A구역 배관 용접)")
    description = Column(Text, nullable=True, comment="작업 상세 내용")
    location = Column(String, nullable=True, comment="작업 위치")
    risk_level = Column(String, default="LOW", comment="위험도 (LOW, MEDIUM, HIGH)")
    
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # 관계 설정
    allocations = relationship("JobAllocation", back_populates="job")

class JobAllocation(Base):
    """작업-인력 매핑 테이블 (어떤 작업에 누가 투입되었나)"""
    __tablename__ = "job_allocations"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("daily_jobs.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    
    role = Column(String, nullable=True, comment="당일 역할 (예: 작업반장, 신호수)")
    assigned_at = Column(DateTime, default=datetime.now)

    job = relationship("DailyJob", back_populates="allocations")
    worker = relationship("Worker", back_populates="allocations")

class Equipment(Base):
    __tablename__ = "equipments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, comment="장비명 (예: 1호기 크레인)")
    type = Column(String, nullable=False, comment="장비 타입 (CRANE, FORKLIFT, EXCAVATOR)")
    status = Column(String, default="IDLE", comment="상태 (IDLE, WORKING, MAINTENANCE)")
    
    last_inspection_date = Column(DateTime, nullable=True, comment="마지막 점검일")
