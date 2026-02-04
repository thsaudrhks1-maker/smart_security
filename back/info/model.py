"""
작업자 정보 관련 모델
- 일일 안전정보 전용
(다른 모델들(Notice, EmergencyAlert 등)은 각 도메인 폴더의 model.py에 정의되어 있음)
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from back.database import Base


class DailySafetyInfo(Base):
    """일일 안전정보"""
    __tablename__ = "daily_safety_info"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    title = Column(String, nullable=False)
    content = Column(String)
    is_read_by_worker = Column(String)  # user_id 목록 (JSON 또는 쉼표 구분)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
