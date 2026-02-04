from fastapi import APIRouter, Depends
from back.auth.dependencies import get_current_user
from back.auth.model import User
from back.manager.service import ManagerService

router = APIRouter(prefix="/manager", tags=["Manager"])

@router.get("/dashboard")
async def get_manager_dashboard(current_user: User = Depends(get_current_user)):
    """관리자 대시보드 데이터 조회 (내 프로젝트 정보 + 통계)"""
    return await ManagerService.get_manager_dashboard(current_user.id)

@router.get("/companies")
async def get_my_companies(current_user: User = Depends(get_current_user)):
    """내 프로젝트 참여 업체 리스트"""
    return await ManagerService.get_my_companies(current_user.id)

@router.get("/workers")
async def get_my_workers(current_user: User = Depends(get_current_user)):
    """내 프로젝트 근로자 리스트"""
    return await ManagerService.get_my_workers(current_user.id)
