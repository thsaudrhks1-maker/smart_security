"""
작업자 전용 API 엔드포인트
- Repository 패턴 적용 (Direct Function Import)
"""
from fastapi import APIRouter, Depends
from back.auth.dependencies import get_current_user
from back.auth.model import User
from back.worker.service import (
    get_my_work_today,
    get_my_risks_today,
    get_all_project_risks_today,
    get_dashboard_info
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
    [DEPRECATED] 금일 나의 위험지역 조회 (내가 배정된 구역만)
    """
    return await get_my_risks_today(current_user.id)


@router.get("/all-project-risks/today")
async def api_get_all_project_risks_today(
    current_user: User = Depends(get_current_user)
):
    """
    [NEW] 금일 현장 전체 위험지역 조회
    - 작업자가 속한 프로젝트의 모든 사이트의 모든 위험 구역 반환
    """
    return await get_all_project_risks_today(current_user.id)


@router.get("/dashboard-info")
async def api_get_dashboard_info(
    current_user: User = Depends(get_current_user)
):
    """
    작업자 대시보드 추가 정보 조회
    """
    return await get_dashboard_info(current_user.id)
