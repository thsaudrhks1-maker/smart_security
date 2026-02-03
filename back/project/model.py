from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Date, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from back.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, comment="프로젝트명 (예: 강남 아파트 신축)")
    code = Column(String, unique=True, index=True, nullable=True, comment="프로젝트 코드 (P2024-001)")
    
    # 위치 정보
    location_name = Column(String, nullable=True, comment="현장 위치명 (강남구 역삼동)")
    location_lat = Column(Float, nullable=True, comment="위도")
    location_lng = Column(Float, nullable=True, comment="경도")
    location_address = Column(String, nullable=True, comment="상세 주소")

    # 기간 및 상태
    start_date = Column(Date, nullable=True, comment="착공일")
    end_date = Column(Date, nullable=True, comment="준공예정일")
    status = Column(String, default="PLANNED", comment="상태 (PLANNED, ACTIVE, PAUSED, DONE)")
    
    # 규모 및 유형
    project_type = Column(String, nullable=True, comment="공사 유형 (건축, 토목, 플랜트)")
    budget_amount = Column(Integer, nullable=True, comment="도급액 (원)")
    
    # 주요 업체 (텍스트로도 관리하고, 실제 관계는 ProjectParticipant로 관리)
    client_company = Column(String, nullable=True, comment="발주처명 (표시용)")
    constructor_company = Column(String, nullable=True, comment="시공사명 (표시용)")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계 (New)
    # 1. 참여 멤버 (관리자, 작업자 모두 포함)
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    
    # 2. 참여 회사 (N:M)
    participations = relationship("ProjectParticipant", back_populates="project", cascade="all, delete-orphan")


# [신규] 통합 프로젝트 멤버 테이블 (User <-> Project N:M)
class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # 현장 내 역할 (System Role과 다름)
    # 예: 현장소장, 안전팀장, 공사과장, 전기반장, 용접공
    role_name = Column(String, nullable=False, comment="현장 직책")
    
    # 상태
    status = Column(String, default="PENDING", comment="상태 (PENDING:승인대기, ACTIVE:근무중, LEAVE:퇴사)")
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), comment="투입일")
    
    # 관계
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_members")
