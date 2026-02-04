from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

class AttendanceBase(BaseModel):
    project_id: int
    work_type_id: Optional[int] = None
    check_in_method: str = "APP"

class CheckInRequest(AttendanceBase):
    """출근 요청 스키마"""
    pass

class CheckOutRequest(BaseModel):
    """퇴근 요청 스키마"""
    attendance_id: int

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    project_id: int
    date: date
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    status: str
    
    class Config:
        from_attributes = True

class ProjectAttendanceResponse(BaseModel):
    """프로젝트별 출역 현황용 (관리자 뷰)"""
    id: int
    user_id: int
    full_name: str
    company_name: str
    job_type: Optional[str]
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    status: str
    check_in_method: str


class MyAttendanceListItem(BaseModel):
    """나의 출근 내역 (기간별) - 작업자 출근현황용"""
    id: int
    date: date
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    status: str
    company_name: Optional[str] = None
    my_part: Optional[str] = None
    work_description: Optional[str] = None
