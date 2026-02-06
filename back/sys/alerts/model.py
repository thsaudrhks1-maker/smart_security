
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from back.database import Base
from datetime import datetime

class sys_emergency_alerts(Base):
    """[SYS] 전역 긴급 재난 알림"""
    __tablename__ = "sys_emergency_alerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, default="INFO") # INFO, WARNING, CRITICAL
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
