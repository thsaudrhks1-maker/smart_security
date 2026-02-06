
from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime
from back.database import Base
from datetime import datetime

class daily_work_tasks(Base):
    """[DAILY] 오늘의 세부 작업 계획"""
    __tablename__ = "daily_work_tasks"
    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("project_sites.id", ondelete="CASCADE"), nullable=False)
    zone_id = Column(Integer, ForeignKey("project_zones.id", ondelete="CASCADE"), nullable=False)
    template_id = Column(Integer, ForeignKey("content_work_templates.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    description = Column(String, nullable=True)
    calculated_risk_score = Column(Integer, default=0)
    status = Column(String, default="PLANNED")
    created_at = Column(DateTime, default=datetime.now)

class daily_worker_allocations(Base):
    """[DAILY] 오늘의 인원 투입 현황"""
    __tablename__ = "daily_worker_allocations"
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("daily_work_tasks.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(Integer, ForeignKey("sys_users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=True)
