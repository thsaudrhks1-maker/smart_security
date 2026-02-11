
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
    created_by = Column(Integer, nullable=True) # created_by 컬럼이 repository에서 사용되므로 추가 (기존 코드에서 빠져있었음)
    created_at = Column(DateTime, default=datetime.now)

class daily_safety_info(Base):
    """[DAILY] 일일 안전 정보 (작업자 전용 TBM 정보 등)"""
    __tablename__ = "daily_safety_info"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    is_read_by_worker = Column(Text, nullable=True, comment="읽은 작업자 ID 목록 (CSV)")
    created_at = Column(DateTime, default=datetime.now)
