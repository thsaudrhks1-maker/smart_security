from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from back.database import Base

class Site(Base):
    """3.2 Site: 현장 정보 (물리적 구역)"""
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    
    # 프로젝트 연결
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True, comment="소속 프로젝트 ID")
    
    name = Column(String, nullable=False, comment="현장명")
    address = Column(String, nullable=True, comment="주소")
    safety_manager_id = Column(Integer, ForeignKey("users.id"), nullable=True, comment="안전관리자 User ID")
    # 1개 층 도면 (예: /static/blueprints/{uuid}.png)
    floor_plan_url = Column(String, nullable=True, comment="도면 이미지 URL (1개 층 기준)")
    
    # 관계
    project = relationship("Project")
    
    # 역참조
    zones = relationship("Zone", back_populates="site")
    daily_plans = relationship("DailyWorkPlan", back_populates="site")

class Company(Base):
    """협력사 정보 (Master Data)"""
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, comment="업체명 (예: XX건설)")
    type = Column(String, default="SPECIALTY", comment="기업 구분 (GENERAL: 종합건설/발주처, SPECIALTY: 전문건설/협력사)")
    trade_type = Column(String, nullable=True, comment="주 공종 (예: 철근, 설비, 종합)")

    # 관계
    participations = relationship("ProjectParticipant", back_populates="company")
    users = relationship("User", back_populates="company")  # UserModel -> User 변경

class ProjectParticipant(Base):
    """프로젝트 참여 기업 및 역할 (N:M 해소)"""
    __tablename__ = "project_participants"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, comment="프로젝트 ID")
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, comment="회사 ID")
    role = Column(String, nullable=False, comment="역할 (CLIENT, CONSTRUCTOR, PARTNER)")

    # 관계
    project = relationship("Project")
    company = relationship("Company", back_populates="participations")
