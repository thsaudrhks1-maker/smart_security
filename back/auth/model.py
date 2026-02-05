from sqlalchemy import Column, String, Integer, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base

# DB 모델 정의 (User)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="worker") # admin, manager, safety_manager, worker
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    
    # [신규] Worker 정보 통합 (User 테이블로 이관)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, comment="소속 회사 (협력사)")
    job_type = Column(String, nullable=True, comment="직종 (예: 전기, 배관, 용접)")
    title = Column(String, nullable=True, comment="직급/직책 (예: 소장, 반장, 팀원)")
    phone = Column(String, nullable=True, comment="연락처")
    birth_date = Column(Date, nullable=True, comment="생년월일 (Date 타입)")
    
    # 관계
    company = relationship("Company", back_populates="users")
    project_members = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
