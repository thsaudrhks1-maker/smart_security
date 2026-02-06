
from sqlalchemy import Column, Integer, String, DateTime, Date
from back.database import Base
from datetime import datetime

class project_master(Base):
    """[PROJECT] 최상위 프로젝트 마스터"""
    __tablename__ = "project_master"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    description = Column(String, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
