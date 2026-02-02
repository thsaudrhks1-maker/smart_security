"""
작업자 전용 API 엔드포인트
- 본인의 작업 정보만 조회
- 본인의 위험지역 정보만 조회
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import date
from typing import List

from back.database import get_db
from back.auth.dependencies import get_current_user
from back.auth.model import UserModel
from back.company.model import Worker
from back.work.model import DailyWorkPlan, WorkerAllocation
from back.safety.model import Zone

router = APIRouter(prefix="/worker", tags=["worker"])


@router.get("/my-work/today")
async def get_my_work_today(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    금일 나의 작업 조회
    """
    # 현재 사용자의 worker_id 조회
    worker_result = await db.execute(
        select(Worker).filter(Worker.user_id == current_user.id)
    )
    worker = worker_result.scalar_one_or_none()
    
    # 작업자 정보가 없으면 (admin 등) None 반환
    if not worker:
        return None
    
    # 금일 작업 배정 조회 (WorkTemplate도 함께 조인)
    from back.work.model import WorkTemplate
    
    today = date.today()
    allocation_result = await db.execute(
        select(WorkerAllocation, DailyWorkPlan, Zone, WorkTemplate)
        .join(DailyWorkPlan, WorkerAllocation.plan_id == DailyWorkPlan.id)
        .join(Zone, DailyWorkPlan.zone_id == Zone.id)
        .join(WorkTemplate, DailyWorkPlan.template_id == WorkTemplate.id)
        .filter(
            and_(
                WorkerAllocation.worker_id == worker.id,
                DailyWorkPlan.date == str(today)
            )
        )
    )
    result = allocation_result.first()
    
    if not result:
        return None
    
    allocation, plan, zone, template = result
    
    return {
        "id": plan.id,
        "description": plan.description,
        "zone_name": zone.name,
        "work_type": template.work_type,
        "calculated_risk_score": plan.calculated_risk_score,
        "required_ppe": template.required_ppe or [],
        "checklist_items": template.checklist_items or [],
        "my_role": allocation.role
    }


@router.get("/my-risks/today")
async def get_my_risks_today(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    금일 나의 위험지역 조회
    """
    # 현재 사용자의 worker_id 조회
    worker_result = await db.execute(
        select(Worker).filter(Worker.user_id == current_user.id)
    )
    worker = worker_result.scalar_one_or_none()
    
    if not worker:
        return []
    
    # 금일 작업 배정된 구역의 위험지역 조회
    today = date.today()
    risk_result = await db.execute(
        select(Zone)
        .join(DailyWorkPlan, Zone.id == DailyWorkPlan.zone_id)
        .join(WorkerAllocation, DailyWorkPlan.id == WorkerAllocation.plan_id)
        .filter(
            and_(
                WorkerAllocation.worker_id == worker.id,
                DailyWorkPlan.date == str(today),
                Zone.type == 'DANGER'
            )
        )
    )
    risks = risk_result.scalars().all()
    
    return [
        {
            "id": risk.id,
            "name": risk.name,
            "type": risk.type,
            "level": risk.level,
            "lat": risk.lat,
            "lng": risk.lng,
            "description": f"{risk.level} - 위험 구역"
        }
        for risk in risks
    ]
