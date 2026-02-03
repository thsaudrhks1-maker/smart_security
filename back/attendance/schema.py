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
