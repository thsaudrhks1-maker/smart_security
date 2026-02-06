
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import date
from back.daily.task_plans.service import task_plans_service

router = APIRouter()

@router.get("")
async def list_task_plans(project_id: int = 1, d: Optional[date] = None):
    # 오늘 날짜를 기본값으로 설정
    target_date = d or date.today()
    return await task_plans_service.get_plans_with_details(project_id, target_date)

@router.post("")
async def create_task_plan(data: dict):
    return await task_plans_service.create_plan(data)
