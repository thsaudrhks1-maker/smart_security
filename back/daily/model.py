
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Float, JSON, Text, Boolean
from datetime import datetime
from back.database import Base

class daily_attendance(Base):
    """[DAILY] 출역 기록"""
    __tablename__ = "daily_attendance"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("sys_users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(String, default="PRESENT")

class daily_work_tasks(Base):
    """[DAILY] 오늘의 작업 계획"""
    __tablename__ = "daily_work_tasks"
    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("project_sites.id", ondelete="CASCADE"), nullable=False)
    zone_id = Column(Integer, ForeignKey("project_zones.id", ondelete="CASCADE"), nullable=False)
    template_id = Column(Integer, ForeignKey("content_work_templates.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    status = Column(String, default="PLANNED")
    calculated_risk_score = Column(Integer, default=0)

class daily_worker_allocations(Base):
    """[DAILY] 오늘의 인원 배정"""
    __tablename__ = "daily_worker_allocations"
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("daily_work_tasks.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(Integer, ForeignKey("sys_users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=True)

class daily_safety_logs(Base):
    """[DAILY] 안전 점검 로그"""
    __tablename__ = "daily_safety_logs"
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("daily_work_tasks.id", ondelete="CASCADE"), nullable=True)
    timestamp = Column(DateTime, default=datetime.now)
    log_type = Column(String, nullable=False)
    photos = Column(JSON, nullable=True)
    note = Column(Text, nullable=True)

class daily_notices(Base):
    """[DAILY] 일일 공지사항"""
    __tablename__ = "daily_notices"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_important = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

class daily_weather(Base):
    """[DAILY] 기상 정보"""
    __tablename__ = "daily_weather"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False)
    temperature = Column(Float, nullable=True)
    condition = Column(String, nullable=True)
