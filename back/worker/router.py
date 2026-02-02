"""
작업자 전용 API 엔드포인트
- Repository 패턴 적용 (Direct Function Import)
"""
from fastapi import APIRouter, Depends
from back.auth.dependencies import get_current_user
from back.auth.model import UserModel
from back.worker.service import (
    get_my_work_today,
    get_my_risks_today,
    get_dashboard_info
)

router = APIRouter(prefix="/worker", tags=["worker"])


@router.get("/my-work/today")
async def api_get_my_work_today(
    current_user: UserModel = Depends(get_current_user)
):
    """
    금일 나의 작업 조회
    """
    return await get_my_work_today(current_user.id)


@router.get("/my-risks/today")
async def api_get_my_risks_today(
    current_user: UserModel = Depends(get_current_user)
):
    """
    금일 나의 위험지역 조회
    """
    return await get_my_risks_today(current_user.id)


@router.get("/dashboard-info")
async def api_get_dashboard_info(
    current_user: UserModel = Depends(get_current_user)
):
    """
    작업자 대시보드 추가 정보 조회
    """
    return await get_dashboard_info(current_user.id)
