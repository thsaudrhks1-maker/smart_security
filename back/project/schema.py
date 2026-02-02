from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProjectBase(BaseModel):
    """프로젝트 기본 스키마 (생성/수정 공통)"""
    name: str = Field(..., description="공사명")
    location_address: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    
    client_company: Optional[str] = None
    constructor_company: Optional[str] = None
    
    project_type: Optional[str] = None
    budget_amount: Optional[int] = None
    
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    
    manager_id: Optional[int] = None
    safety_manager_id: Optional[int] = None
    
    status: Optional[str] = "PLANNED"

class ProjectCreate(ProjectBase):
    """프로젝트 생성 요청"""
    pass

class ProjectUpdate(ProjectBase):
    """프로젝트 수정 요청 (부분 수정 가능)"""
    name: Optional[str] = None

class ProjectResponse(ProjectBase):
    """프로젝트 응답"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
