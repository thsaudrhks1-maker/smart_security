from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from back.database import get_db
from back.auth.dependencies import get_current_user
from back.auth.model import User
from datetime import datetime as dt
from back.attendance.schema import CheckInRequest, CheckOutRequest, AttendanceResponse, ProjectAttendanceResponse, MyAttendanceListItem
from back.attendance.repository import AttendanceRepository

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


def _parse_date(v):
    if v is None:
        return None
    if hasattr(v, "date"):
        return v.date() if callable(getattr(v, "date", None)) else v
    if isinstance(v, str):
        return dt.strptime(v, "%Y-%m-%d").date()
    return v


@router.get("/my", response_model=list[MyAttendanceListItem])
async def get_my_attendance(
    start: str,
    end: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """나의 출근 내역 (기간별) - 작업자 출근현황 화면용"""
    start_date = _parse_date(start)
    end_date = _parse_date(end)
    if not start_date or not end_date:
        raise HTTPException(status_code=400, detail="start, end (YYYY-MM-DD) 필요")
    if start_date > end_date:
        start_date, end_date = end_date, start_date
    rows = await AttendanceRepository.get_my_attendance_list(db, current_user.id, start_date, end_date)
    return [MyAttendanceListItem(**r) for r in rows]


@router.get("/today", response_model=AttendanceResponse | None)
async def get_my_today_attendance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """나의 오늘 출근 기록 조회"""
    return await AttendanceRepository.get_today_attendance(db, current_user.id)

@router.post("/check-in", response_model=AttendanceResponse)
async def check_in(
    req: CheckInRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """출근 하기"""
    return await AttendanceRepository.check_in(db, current_user.id, req)

@router.post("/check-out", response_model=AttendanceResponse)
async def check_out(
    req: CheckOutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """퇴근 하기"""
    att = await AttendanceRepository.check_out(db, current_user.id, req.attendance_id)
    if not att:
        raise HTTPException(status_code=404, detail="출근 기록을 찾을 수 없습니다.")
    return att

@router.get("/project/{project_id}", response_model=list[ProjectAttendanceResponse])
async def get_project_attendance(
    project_id: int,
    date: str = None, # YYYY-MM-DD
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    프로젝트별 출역 현황 조회 (관리자용)
    - date 파라미터가 없으면 오늘 날짜
    """
    # 권한 체크 (실제로는 manager 이상인지 확인 로직 필요)
    if current_user.role not in ["manager", "admin", "safety_manager"]:
        raise HTTPException(status_code=403, detail="조회 권한이 없습니다.")
        
    return await AttendanceRepository.get_project_attendance_list(db, project_id, date)
