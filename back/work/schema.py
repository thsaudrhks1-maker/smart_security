from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, date

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
    work_type: Optional[str] = None
    required_ppe: Optional[List[str]] = []
    checklist_items: Optional[List[str]] = []
    allocations: List[WorkerAllocationRead] = []
    daily_hazards: Optional[List[str]] = None

    class Config:
        from_attributes = True
