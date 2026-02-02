from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base

class WorkTemplate(Base):
    """3.4 WorkTemplate: 작업 라이브러리"""
    __tablename__ = "work_templates"

    id = Column(Integer, primary_key=True, index=True)
    work_type = Column(String, nullable=False, unique=True, comment="작업 유형 (예: 고소작업, 용접)")
    
    base_risk_score = Column(Integer, default=10, comment="기본 위험도 점수")
    required_ppe = Column(JSON, nullable=True, comment="필수 보호구 목록 (JSON, 예: ['안전모', '안전대'])")
    required_qualifications = Column(JSON, nullable=True, comment="필수 자격 (JSON)")
    checklist_items = Column(JSON, nullable=True, comment="기본 점검 항목 리스트 (JSON)")
    
    plans = relationship("DailyWorkPlan", back_populates="template")

class DailyWorkPlan(Base):
    """3.5 DailyWorkPlan: 오늘의 작업 계획"""
    __tablename__ = "daily_work_plans"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("work_templates.id"), nullable=False)
    
    date = Column(String, nullable=False, comment="YYYY-MM-DD")
    
    # 작업 상세 및 위험도
    description = Column(String, nullable=True, comment="작업 내용 요약")
    equipment_flags = Column(JSON, nullable=True, comment="사용 장비 (JSON, 예: ['CRANE', 'LIFT'])")
    
    # 일일 위험 요소 (작업별 동적 위험, 예: ["화재위험", "낙하물위험"])
    daily_hazards = Column(JSON, nullable=True, comment="해당 날짜/작업의 추가 위험 요소")
    
    calculated_risk_score = Column(Integer, default=0, comment="계산된 위험도 점수")
    status = Column(String, default="PLANNED", comment="PLANNED, IN_PROGRESS, DONE")
    
    created_at = Column(DateTime, default=datetime.now)

    # 관계
    site = relationship("Site", back_populates="daily_plans")
    zone = relationship("Zone", back_populates="daily_plans")
    template = relationship("WorkTemplate", back_populates="plans")
    
    allocations = relationship("WorkerAllocation", back_populates="plan")
    logs = relationship("SafetyLog", back_populates="plan")

class WorkerAllocation(Base):
    """작업-작업자 매핑"""
    __tablename__ = "worker_allocations"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("daily_work_plans.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    
    role = Column(String, nullable=True, comment="당일 역할 (팀장, 작업자)")

    plan = relationship("DailyWorkPlan", back_populates="allocations")
    worker = relationship("Worker", back_populates="allocations")
