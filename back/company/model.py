from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base

class Site(Base):
    """3.2 Site: 현장 정보"""
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, comment="현장명")
    address = Column(String, nullable=True, comment="주소")
    safety_manager_id = Column(Integer, ForeignKey("users.id"), nullable=True, comment="안전관리자 User ID")
    
    # 관계
    zones = relationship("Zone", back_populates="site")
    daily_plans = relationship("DailyWorkPlan", back_populates="site")

class Company(Base):
    """협력사 정보"""
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, comment="업체명 (예: XX건설)")
    trade_type = Column(String, nullable=True, comment="주 공종 (예: 철근, 설비)")

    workers = relationship("Worker", back_populates="company")

class Worker(Base):
    """3.1 Worker: 작업자 정보"""
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    
    # 계정 연결 (필수)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, comment="로그인 계정 ID")
    
    name = Column(String, nullable=False, comment="성명")
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    trade = Column(String, nullable=False, comment="직종 (예: 용접공, 신호수)")
    qualification_tags = Column(String, nullable=True, comment="자격 태그 (콤마로 구분, 예: '고소작업,지게차')")
    
    # 신규 추가 필드 (상세 정보)
    phone_number = Column(String, nullable=True, comment="연락처")
    birth_date = Column(String, nullable=True, comment="생년월일 (YYYY-MM-DD)")
    address = Column(String, nullable=True, comment="거주지 (간략 주소)")

    status = Column(String, default="OFF_SITE", comment="상태: ON_SITE, OFF_SITE, RESTRICTED")
    
    created_at = Column(DateTime, default=datetime.now)

    # 관계
    company = relationship("Company", back_populates="workers")
    allocations = relationship("WorkerAllocation", back_populates="worker")

