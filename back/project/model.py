
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base

class project_master(Base):
    """[PROJECT] 프로젝트 최상위 마스터"""
    __tablename__ = "project_master"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.now)

class project_sites(Base):
    """[PROJECT] 프로젝트 하위 현장 (1공구, 2공구 등)"""
    __tablename__ = "project_sites"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)

class project_zones(Base):
    """[PROJECT] 현장 내 세부 구역 (3D 그리드)"""
    __tablename__ = "project_zones"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    site_id = Column(Integer, ForeignKey("project_sites.id", ondelete="CASCADE"), nullable=False)
    level = Column(String, nullable=False) # 1F, B1 등
    name = Column(String, nullable=False)
    grid_x = Column(Integer, nullable=True)
    grid_y = Column(Integer, nullable=True)

class project_members(Base):
    """[PROJECT] 프로젝트 소속 인원 (N:M)"""
    __tablename__ = "project_members"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("sys_users.id", ondelete="CASCADE"), nullable=False)
    role_name = Column(String, nullable=True) # 현지 역할

class project_companies(Base):
    """[PROJECT] 참여 업체 (N:M)"""
    __tablename__ = "project_companies"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("sys_companies.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False) # CONSTRUCTOR, PARTNER 등
