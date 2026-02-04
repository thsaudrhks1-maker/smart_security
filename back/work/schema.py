from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, date

# --- SafetyResource (콘텐츠/장구류 조회용) ---
class SafetyResourceRead(BaseModel):
    id: int
    name: str
    type: str
    icon: Optional[str] = None
    description: Optional[str] = None
    safety_rules: Optional[List[str]] = []

    class Config:
        from_attributes = True


# --- WorkTemplate ---
class WorkTemplateBase(BaseModel):
    work_type: str
    base_risk_score: int
    required_ppe: Optional[List[str]] = []
    required_qualifications: Optional[List[str]] = []
    checklist_items: Optional[List[str]] = []

class WorkTemplateRead(WorkTemplateBase):
    id: int
    class Config:
        from_attributes = True


class WorkTemplateContentRead(BaseModel):
    """공정(템플릿) + 연결된 장구류(설명·안전수칙 포함) - 콘텐츠 관리/열람용"""
    id: int
    work_type: str
    base_risk_score: int
    checklist_items: Optional[List[str]] = []
    required_resources: List[SafetyResourceRead] = []

    class Config:
        from_attributes = True


# --- Worker Allocation ---
class WorkerAllocationBase(BaseModel):
    worker_id: int
    role: Optional[str] = "작업자"

class WorkerAllocationRead(WorkerAllocationBase):
    id: int
    worker_name: Optional[str] = None # For display convenience
    
    class Config:
        from_attributes = True

# --- DailyWorkPlan ---
class DailyWorkPlanBase(BaseModel):
    site_id: int
    zone_id: int
    template_id: int
    date: str  # YYYY-MM-DD
    description: Optional[str] = None
    equipment_flags: Optional[List[str]] = []
    daily_hazards: Optional[List[str]] = None  # 그날 해당 작업의 위험요소 (예: 화재위험, 낙하물 주의)
    status: Optional[str] = "PLANNED"

class DailyWorkPlanCreate(DailyWorkPlanBase):
    allocations: List[WorkerAllocationBase] = []

class DailyWorkPlanRead(DailyWorkPlanBase):
    id: int
    calculated_risk_score: int
    created_at: datetime
    date: date  # 응답은 date 객체 → JSON 직렬화 시 "YYYY-MM-DD"로 내려감
    zone_name: Optional[str] = None
    zone_lat: Optional[float] = None  # 지도 표시용
    zone_lng: Optional[float] = None
    work_type: Optional[str] = None
    required_ppe: Optional[List[str]] = []
    checklist_items: Optional[List[str]] = []
    allocations: List[WorkerAllocationRead] = []
    daily_hazards: Optional[List[str]] = None
    # 일정별 적용 안전공구 (템플릿 기본 − 제외 + 추가)
    required_resources: Optional[List[SafetyResourceRead]] = []
    excluded_resource_ids: Optional[List[int]] = []
    additional_resource_ids: Optional[List[int]] = []

    class Config:
        from_attributes = True


class DailyWorkPlanUpdate(BaseModel):
    """일일 작업 수정 (안전공구 추가/제외 등)"""
    description: Optional[str] = None
    daily_hazards: Optional[List[str]] = None
    status: Optional[str] = None
    excluded_resource_ids: Optional[List[int]] = None
    additional_resource_ids: Optional[List[int]] = None
    allocations: Optional[List[WorkerAllocationBase]] = None
