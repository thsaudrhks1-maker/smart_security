from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, comment="업체명")
    license_no = Column(String, nullable=True, comment="사업자등록번호")
    contact = Column(String, nullable=True, comment="현장 소장 연락처")

    # 관계 설정
    workers = relationship("Worker", back_populates="company")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, comment="시스템 로그인 계정 ID (옵션)")
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, comment="소속 업체")
    
    name = Column(String, nullable=False, comment="성명")
    job_type = Column(String, nullable=False, comment="직종 (예: 용접공, 배관공)")
    blood_type = Column(String, nullable=True, comment="혈액형 (응급시 필요)")
    years_of_experience = Column(Integer, default=0, comment="경력(년)")
    
    is_active = Column(Boolean, default=True, comment="재직 상태")
    created_at = Column(DateTime, default=datetime.now)

    # 관계 설정
    company = relationship("Company", back_populates="workers")
    user = relationship("UserModel", backref="worker_profile") # users 테이블과 연결
    attendances = relationship("Attendance", back_populates="worker")
    allocations = relationship("JobAllocation", back_populates="worker")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    
    date = Column(DateTime, nullable=False, default=datetime.now, comment="출근 기준 일자")
    check_in_time = Column(DateTime, default=datetime.now, comment="출근 시간")
    check_out_time = Column(DateTime, nullable=True, comment="퇴근 시간")
    status = Column(String, default="PRESENT", comment="PRESENT(출근), LATE(지각), EARLY_LEAVE(조퇴)")

    worker = relationship("Worker", back_populates="attendances")
