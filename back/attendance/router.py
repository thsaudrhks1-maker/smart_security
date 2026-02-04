from fastapi import APIRouter, Depends, HTTPException
from back.auth.dependencies import get_current_user
from back.auth.model import User
from back.attendance.schema import CheckInRequest, CheckOutRequest, AttendanceResponse, ProjectAttendanceResponse, MyAttendanceListItem
from back.attendance.service import AttendanceService
from typing import List

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.get("/my", response_model=List[MyAttendanceListItem])
async def get_my_attendance(
    start: str,
    end: str,
    current_user: User = Depends(get_current_user),
):
    """나의 출근 내역 (기간별)"""
    return await AttendanceService.get_my_attendance(current_user.id, start, end)

@router.get("/today", response_model=AttendanceResponse | None)
async def get_my_today_attendance(
    current_user: User = Depends(get_current_user)
):
    """나의 오늘 출근 기록 조회"""
    from back.attendance.repository import AttendanceRepository
    return await AttendanceRepository.get_today_attendance(current_user.id)

@router.post("/check-in", response_model=AttendanceResponse)
async def check_in(
    req: CheckInRequest,
    current_user: User = Depends(get_current_user)
):
    """출근 하기"""
    return await AttendanceService.process_check_in(current_user.id, req)

@router.post("/check-out", response_model=AttendanceResponse)
async def check_out(
    req: CheckOutRequest,
    current_user: User = Depends(get_current_user)
):
    """퇴근 하기"""
    att = await AttendanceService.process_check_out(current_user.id, req.attendance_id)
    if not att:
        raise HTTPException(status_code=404, detail="출근 기록을 찾을 수 없습니다.")
    return att

@router.get("/project/{project_id}", response_model=List[ProjectAttendanceResponse])
async def get_project_attendance(
    project_id: int,
    date: str = None, 
    current_user: User = Depends(get_current_user)
):
    """프로젝트별 출역 현황 조회 (관리자용)"""
    if current_user.role.lower() not in ["manager", "admin", "safety_manager"]:
        raise HTTPException(status_code=403, detail="조회 권한이 없습니다.")
    return await AttendanceService.get_project_attendance(project_id, date)
