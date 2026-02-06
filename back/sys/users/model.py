
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from back.database import Base
from datetime import datetime

class sys_users(Base):
    """[SYS] 시스템 전체 사용자"""
    __tablename__ = "sys_users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="worker")
    company_id = Column(Integer, ForeignKey("sys_companies.id", ondelete="CASCADE"), nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
