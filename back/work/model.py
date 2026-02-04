from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Text, Float, JSON, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from back.database import Base


# ---------------------------------------------------------------------------
# 장비/장구류 마스터 (물리적 물건 - 정규화)
# ---------------------------------------------------------------------------
class SafetyResource(Base):
    """
    장비/장구류 마스터 테이블 (원천 데이터)
    - PPE: 장구류(안전모, 안전대 등), HEAVY: 중장비, TOOL: 공구
    - 추후 image_url 등 확장 가능
    """
    __tablename__ = "safety_resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, comment="명칭 (예: 그네형 안전대, 15톤 덤프, A형 사다리)")
    type = Column(String, nullable=False, index=True, comment="PPE(장구류), HEAVY(중장비), TOOL(공구)")
    icon = Column(String, nullable=True, comment="아이콘 이름 (프론트 렌더링용)")
    description = Column(String, nullable=True, comment="기본 설명")
    safety_rules = Column(JSON, nullable=True, comment="해당 장비 사용 시 필수 안전 수칙 (JSON 리스트)")

    # 관계: 어떤 공정(작업 템플릿)에서 이 장비가 필요한지 (N:M)
    template_assocs = relationship("TemplateResourceMap", back_populates="resource", cascade="all, delete-orphan")


class TemplateResourceMap(Base):
    """
    공정(작업 템플릿) ↔ 장비/장구류 N:M 연결 테이블 (데이터 무결성)
    """
    __tablename__ = "template_resource_map"
    __table_args__ = (UniqueConstraint("template_id", "resource_id", name="uq_template_resource"),)

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("work_templates.id", ondelete="CASCADE"), nullable=False)
    resource_id = Column(Integer, ForeignKey("safety_resources.id", ondelete="CASCADE"), nullable=False)

    template = relationship("WorkTemplate", back_populates="required_resource_assocs")
    resource = relationship("SafetyResource", back_populates="template_assocs")


class WorkTemplate(Base):
    """3.4 WorkTemplate: 작업 라이브러리"""
    __tablename__ = "work_templates"

    id = Column(Integer, primary_key=True, index=True)
    work_type = Column(String, nullable=False, unique=True, comment="작업 유형 (예: 고소작업, 용접)")
    
    base_risk_score = Column(Integer, default=10, comment="기본 위험도 점수")
    required_ppe = Column(JSON, nullable=True, comment="[레거시] 필수 보호구 목록 JSON - 정규화 후 required_resource_assocs 우선")
    required_qualifications = Column(JSON, nullable=True, comment="필수 자격 (JSON)")
    checklist_items = Column(JSON, nullable=True, comment="기본 점검 항목 리스트 (JSON, 문장)")
    
    plans = relationship("DailyWorkPlan", back_populates="template")
    required_resource_assocs = relationship("TemplateResourceMap", back_populates="template", cascade="all, delete-orphan")

class DailyWorkPlan(Base):
    """3.5 DailyWorkPlan: 오늘의 작업 계획"""
    __tablename__ = "daily_work_plans"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("work_templates.id"), nullable=False)
    
    date = Column(Date, nullable=False, comment="날짜 (Date 타입)")
    
    # 작업 상세 및 위험도
    description = Column(String, nullable=True, comment="작업 내용 요약")
    equipment_flags = Column(JSON, nullable=True, comment="사용 장비 (JSON, 예: ['CRANE', 'LIFT'])")
    
    # 일일 위험 요소 (작업별 동적 위험, 예: ["화재위험", "낙하물위험"])
    daily_hazards = Column(JSON, nullable=True, comment="해당 날짜/작업의 추가 위험 요소")
    
    calculated_risk_score = Column(Integer, default=0, comment="계산된 위험도 점수")
    status = Column(String, default="PLANNED", comment="PLANNED, IN_PROGRESS, DONE")
    
    created_at = Column(DateTime, default=datetime.now)

    # 일정별 적용 안전공구 커스터마이징 (템플릿 기본값에 대한 예외 처리)
    excluded_resource_ids = Column(JSON, nullable=True, comment="해당 작업에서 제외된 템플릿 기본 장비 ID 리스트")
    additional_resource_ids = Column(JSON, nullable=True, comment="해당 작업에 추가로 투입된 장비 ID 리스트")

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
    worker_id = Column(Integer, ForeignKey("users.id"), nullable=False, comment="작업자(User) ID")
    
    role = Column(String, nullable=True, comment="당일 역할 (팀장, 작업자)")

    plan = relationship("DailyWorkPlan", back_populates="allocations")
    worker = relationship("User") 


class Weather(Base):
    """일일 날씨 정보"""
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False, comment="날짜 (Date 타입)")
    temperature = Column(Float, nullable=True)
    condition = Column(String, nullable=True, comment="CLEAR, CLOUDY, RAIN, SNOW")

