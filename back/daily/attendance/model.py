
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from back.database import Base
from datetime import datetime

class daily_attendance(Base):
    __tablename__ = "daily_attendance"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("sys_users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("project_master.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(String, default="PRESENT")
