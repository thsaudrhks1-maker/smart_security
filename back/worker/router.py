"""
작업자 전용 API 엔드포인트
- Repository 패턴 적용 (Direct Function Import)
"""
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from back.database import get_db
from back.auth.dependencies import get_current_user
from back.auth.model import User
from back.attendance.schema import MyAttendanceRow
from back.worker.service import (
    get_my_work_today,
    get_my_risks_today,
    get_dashboard_info,
    get_my_attendance,
)

router = APIRouter(prefix="/worker", tags=["worker"])


@router.get("/my-work/today")
async def api_get_my_work_today(
    current_user: User = Depends(get_current_user)
):
    """
    금일 나의 작업 조회
    """
    return await get_my_work_today(current_user.id)


@router.get("/my-risks/today")
async def api_get_my_risks_today(
    current_user: User = Depends(get_current_user)
):
    """
    금일 나의 위험지역 조회
    """
    return await get_my_risks_today(current_user.id)


@router.get("/dashboard-info")
async def api_get_dashboard_info(
    current_user: User = Depends(get_current_user)
):
    """
    작업자 대시보드 추가 정보 조회
    """
    return await get_dashboard_info(current_user.id)


@router.get("/my-attendance", response_model=list[MyAttendanceRow])
async def api_get_my_attendance(
    start: date | None = None,
    end: date | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    나의 출근 내역 조회 (기간별).
    start/end 미지정 시 최근 7일.
    """
    if end is None:
        end = date.today()
    if start is None:
        start = end - timedelta(days=6)
    if start > end:
        start, end = end, start
    return await get_my_attendance(current_user.id, start, end, db)
