from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date

class ProjectBase(BaseModel):
    """프로젝트 기본 스키마 (생성/수정 공통)"""
    name: str = Field(..., description="공사명")
    description: Optional[str] = None
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
    partners: Optional[list[str]] = [] # 협력사 이름 목록 (직접 입력용)
    partner_ids: Optional[list[int]] = [] # 협력사 ID 목록 (DB 연동용)
    client_id: Optional[int] = None # 발주처 회사 ID
    constructor_id: Optional[int] = None # 시공사 회사 ID

class ProjectUpdate(ProjectBase):
    """프로젝트 수정 요청 (부분 수정 가능)"""
    name: Optional[str] = None

class ProjectResponse(ProjectBase):
    """프로젝트 응답"""
    id: int
    created_at: datetime
    start_date: Optional[date] = None # str 뿐만 아니라 date 객체도 허용 (Pydantic이 자동 변환)
    end_date: Optional[date] = None
    
    # 추가: 참여 업체 목록 (Role: CLIENT, CONSTRUCTOR, PARTNER)
    participants: Optional[list[dict]] = []
    # 추가: 주요 담당자 (현장소장, 안전관리자)
    key_members: Optional[list[dict]] = []
    
    class Config:
        from_attributes = True

class ProjectMemberResponse(BaseModel):
    """프로젝트 멤버 응답"""
    id: int
    user_id: int
    username: str
    full_name: str
    role_name: str
    status: str
    joined_at: datetime
    company_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class MemberApprovalRequest(BaseModel):
    """멤버 승인/거절 요청"""
    user_ids: list[int]
    action: str = "APPROVE" # APPROVE | REJECT

class ProjectParticipantResponse(BaseModel):
    """프로젝트 참여 기업 응답"""
    id: int
    project_id: int
    company_id: int
    company_name: str
    role: str
    trade_type: str
    
    class Config:
        from_attributes = True

class ProjectWorkerResponse(BaseModel):
    """프로젝트 관련 작업자 응답"""
    id: int
    full_name: str
    username: str
    company_name: str
    phone: Optional[str] = None
    role_in_system: str
    
    class Config:
        from_attributes = True
