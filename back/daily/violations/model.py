
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from back.database import Base
from datetime import datetime

class daily_violations(Base):
    """[DAILY] 안전 수칙 위반 기록"""
    __tablename__ = "daily_violations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("sys_users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("project_master.id"), nullable=False)
    violation_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    penalty_point = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
