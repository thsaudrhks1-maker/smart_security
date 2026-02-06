
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from back.database import Base
from datetime import datetime

class sys_companies(Base):
    """[SYS] 시스템 등록 업체"""
    __tablename__ = "sys_companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=True) # GENERAL, SPECIALTY
    trade_type = Column(String, nullable=True) # 공종 (예: 전기, 토목)
    created_at = Column(DateTime, default=datetime.now)
