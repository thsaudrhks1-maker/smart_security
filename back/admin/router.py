"""
관리자 전용 API 엔드포인트
- 전체 DB 데이터 조회
- 데이터 편집 (추후 구현)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from back.database import get_db
from back.auth.dependencies import get_current_user, require_admin
from back.auth.model import UserModel
from back.company.model import Worker, Site, Company
from back.work.model import DailyWorkPlan
from back.safety.model import Zone

router = APIRouter(prefix="/admin/db", tags=["admin-db"])


@router.get("/workers")
async def get_all_workers(
    current_user: UserModel = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    전체 작업자 데이터 조회
    """
    result = await db.execute(
        select(Worker, Company)
        .outerjoin(Company, Worker.company_id == Company.id)
    )
    workers = result.all()
    
    return [
        {
            "id": worker.id,
            "name": worker.name,
            "trade": worker.trade,
            "company": company.name if company else "-",
            "status": worker.status
        }
        for worker, company in workers
    ]


@router.get("/sites")
async def get_all_sites(
    current_user: UserModel = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    전체 현장 데이터 조회
    """
    result = await db.execute(select(Site))
    sites = result.scalars().all()
    
    return [
        {
            "id": site.id,
            "name": site.name,
            "address": site.address,
            "safety_manager_id": site.safety_manager_id or "-"
        }
        for site in sites
    ]


@router.get("/plans")
async def get_all_plans(
    current_user: UserModel = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    전체 작업 계획 데이터 조회
    """
    result = await db.execute(
        select(DailyWorkPlan, Zone)
        .join(Zone, DailyWorkPlan.zone_id == Zone.id)
    )
    plans = result.all()
    
    return [
        {
            "id": plan.id,
            "description": plan.description,
            "zone": zone.name,
            "risk_score": plan.calculated_risk_score,
            "status": plan.status
        }
        for plan, zone in plans
    ]


@router.get("/zones")
async def get_all_zones(
    current_user: UserModel = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    전체 구역 데이터 조회
    """
    result = await db.execute(select(Zone))
    zones = result.scalars().all()
    
    return [
        {
            "id": zone.id,
            "name": zone.name,
            "level": zone.level,
            "type": zone.type,
            "lat": zone.lat,
            "lng": zone.lng
        }
        for zone in zones
    ]


@router.get("/companies")
async def get_all_companies(
    current_user: UserModel = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    전체 협력사 데이터 조회
    """
    result = await db.execute(select(Company))
    companies = result.scalars().all()
    
    return [
        {
            "id": company.id,
            "name": company.name,
            "trade_type": company.trade_type
        }
        for company in companies
    ]
