from fastapi import APIRouter, Depends, HTTPException
from back.auth.dependencies import get_current_user
from back.auth.model import User
from back.work.schema import WorkTemplateRead, WorkTemplateContentRead, SafetyResourceRead, DailyWorkPlanCreate, DailyWorkPlanRead, DailyWorkPlanUpdate
from back.work.service import WorkService
from typing import List

router = APIRouter(prefix="/work", tags=["work"])

@router.get("/templates", response_model=List[WorkTemplateRead])
async def get_work_templates():
    from back.work.repository import WorkRepository
    return await WorkRepository.get_templates()

@router.get("/templates/contents", response_model=List[WorkTemplateContentRead])
async def get_work_templates_contents():
    """공정 목록 + 공정별 필요 장구류"""
    return await WorkService.get_templates_contents()

@router.get("/safety-resources", response_model=List[SafetyResourceRead])
async def get_safety_resources_all():
    """전체 장구류 마스터 목록"""
    return await WorkService.get_all_resources()

@router.get("/plans", response_model=List[DailyWorkPlanRead])
async def get_daily_plans(date: str = None, site_id: int = None):
    """일일 작업 계획 목록 조회"""
    return await WorkService.get_daily_plans(date, site_id)

@router.get("/plans/{plan_id}", response_model=DailyWorkPlanRead)
async def get_work_plan(plan_id: int):
    """일일 작업 단건 조회"""
    plan = await WorkService.get_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="작업 계획을 찾을 수 없습니다.")
    return plan

@router.post("/plans", response_model=DailyWorkPlanRead)
async def create_work_plan(plan: DailyWorkPlanCreate):
    """신규 작업 계획 생성"""
    return await WorkService.create_plan(plan)

@router.patch("/plans/{plan_id}", response_model=DailyWorkPlanRead)
async def update_work_plan(plan_id: int, body: DailyWorkPlanUpdate):
    """작업 계획 수정"""
    return await WorkService.update_plan(plan_id, body)

@router.delete("/plans/{plan_id}", status_code=204)
async def delete_work_plan(plan_id: int):
    """작업 계획 삭제"""
    success = await WorkService.delete_plan(plan_id)
    if not success:
        raise HTTPException(status_code=404, detail="작업 계획을 찾을 수 없습니다.")
    return None

@router.get("/my-plans", response_model=List[DailyWorkPlanRead])
async def get_my_today_plans(
    date: str = None,
    current_user: User = Depends(get_current_user)
):
    """금일 나의 작업 계획 조회 (작업자용)"""
    return await WorkService.get_my_plans(current_user.id, date)
