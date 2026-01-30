from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

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
    date: str # YYYY-MM-DD
    description: Optional[str] = None
    equipment_flags: Optional[List[str]] = []
    status: Optional[str] = "PLANNED"

class DailyWorkPlanCreate(DailyWorkPlanBase):
    # 작업자 할당 정보 포함
    allocations: List[WorkerAllocationBase] = []

class DailyWorkPlanRead(DailyWorkPlanBase):
    id: int
    calculated_risk_score: int
    created_at: datetime
    
    # Relationships (Simplified for response)
    zone_name: Optional[str] = None
    work_type: Optional[str] = None
    required_ppe: Optional[List[str]] = []
    checklist_items: Optional[List[str]] = []
    allocations: List[WorkerAllocationRead] = []

    class Config:
        from_attributes = True
