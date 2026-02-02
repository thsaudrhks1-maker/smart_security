"""
작업자 정보 관련 모델
- 공지사항, 일일 안전정보, 긴급알림, 출역현황, 안전위반
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from back.database import Base


class Notice(Base):
    """공지사항"""
    __tablename__ = "notices"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String)
    priority = Column(String, default="NORMAL")  # URGENT, NORMAL
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DailySafetyInfo(Base):
    """일일 안전정보"""
    __tablename__ = "daily_safety_info"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    title = Column(String, nullable=False)
    content = Column(String)
    is_read_by_worker = Column(String)  # worker_id 목록 (JSON 또는 쉼표 구분)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class EmergencyAlert(Base):
    """긴급알림"""
    __tablename__ = "emergency_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, default="HIGH")  # CRITICAL, HIGH, MEDIUM
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Attendance(Base):
    """출역현황"""
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    check_in_time = Column(String)  # HH:MM
    check_out_time = Column(String)  # HH:MM
    status = Column(String, default="PRESENT")  # PRESENT, ABSENT, LATE


class SafetyViolation(Base):
    """안전위반"""
    __tablename__ = "safety_violations"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    date = Column(String, nullable=False)
    violation_type = Column(String, nullable=False)  # 안전모 미착용, 안전대 미착용 등
    description = Column(String)
    severity = Column(String, default="MEDIUM")  # HIGH, MEDIUM, LOW
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Weather(Base):
    """날씨 정보"""
    __tablename__ = "weather"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    temperature = Column(String)  # 예: "2.7°C"
    condition = Column(String)  # 맑음, 흐림, 비, 눈
    humidity = Column(String)
    wind_speed = Column(String)
