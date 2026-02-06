
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from back.database import Base
from datetime import datetime

class project_users(Base):
    """[PROJECT] 프로젝트 멤버 (사용자)"""
    __tablename__ = "project_users"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("sys_users.id", ondelete="CASCADE"), nullable=False)
    role_name = Column(String, default="멤버")
    status = Column(String, default="ACTIVE")
    joined_at = Column(DateTime, default=datetime.now)

class project_companies(Base):
    """[PROJECT] 프로젝트 참여 업체"""
    __tablename__ = "project_companies"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("sys_companies.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=True) # CLIENT, CONSTRUCTOR, PARTNER
