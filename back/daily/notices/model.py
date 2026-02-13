
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Date
from back.database import Base
from datetime import datetime

class daily_notices(Base):
    """[DAILY] 프로젝트 일일 공지사항"""
    __tablename__ = "daily_notices"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True, default=datetime.now().date)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    notice_type = Column(String(50), default="NORMAL") # NORMAL, IMPORTANT, EMERGENCY
    notice_role = Column(String(50), nullable=True)     # ADMIN, MANAGER, PARTNER
    created_by = Column(Integer, ForeignKey("sys_users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

class daily_notice_reads(Base):
    """[DAILY] 공지사항 확인 기록"""
    __tablename__ = "daily_notice_reads"
    id = Column(Integer, primary_key=True, index=True)
    notice_id = Column(Integer, ForeignKey("daily_notices.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("sys_users.id", ondelete="CASCADE"), nullable=False)
    read_at = Column(DateTime, default=datetime.now)

class daily_safety_info(Base):
    """[DAILY] 일일 안전 정보 (작업자 전용 TBM 정보 등)"""
    __tablename__ = "daily_safety_info"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    is_read_by_worker = Column(Text, nullable=True, comment="읽은 작업자 ID 목록 (CSV)")
    created_at = Column(DateTime, default=datetime.now)
