from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime as dt, date as dt_date

from back.database import get_db
from back.auth.dependencies import get_current_user
from sqlalchemy import delete as sql_delete

from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation
from back.work.schema import WorkTemplateRead, DailyWorkPlanCreate, DailyWorkPlanRead, WorkerAllocationRead
from back.safety.model import Zone
from back.worker.repository import get_daily_danger_zones

router = APIRouter(tags=["work"])

# --- Work Templates ---
@router.get("/work/templates", response_model=list[WorkTemplateRead])
async def get_work_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkTemplate))
    return result.scalars().all()

def _parse_date(value):
    """str 'YYYY-MM-DD' -> date. PostgreSQL DATE 컬럼 비교용."""
    if value is None:
        return None
    if isinstance(value, dt_date):
        return value
    if isinstance(value, str):
        return dt.strptime(value, "%Y-%m-%d").date()
    return value


# --- Daily Work Plans ---
@router.get("/work/plans", response_model=list[DailyWorkPlanRead])
async def get_daily_plans(date: str = None, site_id: int = None, db: AsyncSession = Depends(get_db)):
    query = select(DailyWorkPlan).options(
        selectinload(DailyWorkPlan.zone),
        selectinload(DailyWorkPlan.template),
        selectinload(DailyWorkPlan.allocations).selectinload(WorkerAllocation.worker)
    )
    
    if date:
        query = query.where(DailyWorkPlan.date == _parse_date(date))
    if site_id:
        query = query.where(DailyWorkPlan.site_id == site_id)
        
    result = await db.execute(query)
    plans = result.scalars().all()
    
    response = []
    for p in plans:
        alloc_list = []
        for a in p.allocations:
            # Worker name 조회
            worker_name_str = a.worker.full_name if a.worker else "Unknown"
            
            alloc_list.append(WorkerAllocationRead(
                id=a.id, 
                worker_id=a.worker_id, 
                role=a.role,
                worker_name=worker_name_str
            ))
            
        response.append(DailyWorkPlanRead(
            id=p.id,
            site_id=p.site_id,
            zone_id=p.zone_id,
            template_id=p.template_id,
            date=p.date,
            description=p.description,
            equipment_flags=p.equipment_flags,
            daily_hazards=p.daily_hazards or [],
            status=p.status,
            calculated_risk_score=p.calculated_risk_score if p.calculated_risk_score else 0,
            created_at=p.created_at,
            zone_name=p.zone.name if p.zone else "Unknown",
            work_type=p.template.work_type if p.template else "Unknown",
            required_ppe=p.template.required_ppe if p.template else [],
            checklist_items=p.template.checklist_items if p.template else [],
            allocations=alloc_list
        ))
    return response

@router.get("/work/my-plans", response_model=list[DailyWorkPlanRead])
async def get_my_today_plans(
    date: str = None,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plan_date = dt_date.today() if not date else _parse_date(date)

    query = (
        select(DailyWorkPlan)
        .join(WorkerAllocation, DailyWorkPlan.id == WorkerAllocation.plan_id)
        .where(
            WorkerAllocation.worker_id == current_user.id,
            DailyWorkPlan.date == plan_date
        )
        .options(
            selectinload(DailyWorkPlan.zone),
            selectinload(DailyWorkPlan.template),
            selectinload(DailyWorkPlan.allocations).selectinload(WorkerAllocation.worker)
        )
    )
    
    result = await db.execute(query)
    plans = result.scalars().all()

    # Response Mapping + 일일 위험구역(DailyDangerZone) 병합
    response = []
    for p in plans:
        alloc_list = []
        for a in p.allocations:
            worker_name_str = a.worker.full_name if a.worker else "Unknown"
            alloc_list.append(WorkerAllocationRead(
                id=a.id,
                worker_id=a.worker_id,
                role=a.role,
                worker_name=worker_name_str
            ))

        # 해당 구역·날짜의 데일리 위험존을 조회해 daily_hazards에 병합
        daily_hazards = list(p.daily_hazards or [])
        try:
            danger_zones = await get_daily_danger_zones(p.zone_id, plan_date)
            for dz in danger_zones:
                daily_hazards.append(f"🚧 {dz.get('risk_type', '')}: {dz.get('description', '')}")
        except Exception:
            pass

        zone = p.zone
        response.append(DailyWorkPlanRead(
            id=p.id,
            site_id=p.site_id,
            zone_id=p.zone_id,
            template_id=p.template_id,
            date=p.date,
            description=p.description,
            equipment_flags=p.equipment_flags,
            daily_hazards=daily_hazards,
            status=p.status,
            calculated_risk_score=p.calculated_risk_score if p.calculated_risk_score else 0,
            created_at=p.created_at,
            zone_name=zone.name if zone else "Unknown",
            zone_lat=float(zone.lat) if zone and zone.lat is not None else None,
            zone_lng=float(zone.lng) if zone and zone.lng is not None else None,
            work_type=p.template.work_type if p.template else "Unknown",
            required_ppe=p.template.required_ppe if p.template else [],
            checklist_items=p.template.checklist_items if p.template else [],
            allocations=alloc_list
        ))
    return response

@router.post("/work/plans", response_model=DailyWorkPlanRead)
async def create_work_plan(plan: DailyWorkPlanCreate, db: AsyncSession = Depends(get_db)):
    # 1. Get Template for Risk Score
    tmpl_res = await db.execute(select(WorkTemplate).where(WorkTemplate.id == plan.template_id))
    template = tmpl_res.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    # 2. Get Zone (for risk factor)
    zone_res = await db.execute(select(Zone).where(Zone.id == plan.zone_id))
    zone = zone_res.scalar_one_or_none()
    
    # 3. Calculate Risk (Simple Rule)
    risk = template.base_risk_score
    if zone:
        if zone.type == "ROOF": risk += 15
        elif zone.type == "PIT": risk += 20
        elif zone.type == "OUTDOOR": risk += 5
        
    for eq in plan.equipment_flags:
        if eq in ["CRANE", "EXCAVATOR"]: risk += 15
        elif eq in ["LIFT", "WELDING_MACHINE"]: risk += 10
        
    # Cap at 100
    risk = min(risk, 100)
    
    # 4. Create Plan (date는 DB DATE 타입이므로 date 객체로 변환)
    plan_date = _parse_date(plan.date)
    db_plan = DailyWorkPlan(
        site_id=plan.site_id,
        zone_id=plan.zone_id,
        template_id=plan.template_id,
        date=plan_date,
        description=plan.description,
        equipment_flags=plan.equipment_flags,
        daily_hazards=plan.daily_hazards if getattr(plan, "daily_hazards", None) else None,
        status=plan.status,
        calculated_risk_score=risk
    )
    db.add(db_plan)
    await db.flush()
    
    # 5. Create Allocations
    for alloc in plan.allocations:
        db_alloc = WorkerAllocation(
            plan_id=db_plan.id,
            worker_id=alloc.worker_id,
            role=alloc.role
        )
        db.add(db_alloc)
        
    await db.commit()
    await db.refresh(db_plan)
    
    return DailyWorkPlanRead(
        id=db_plan.id,
        site_id=db_plan.site_id,
        zone_id=db_plan.zone_id,
        template_id=db_plan.template_id,
        date=db_plan.date,
        description=db_plan.description,
        equipment_flags=db_plan.equipment_flags,
        daily_hazards=db_plan.daily_hazards or [],
        status=db_plan.status,
        calculated_risk_score=db_plan.calculated_risk_score,
        created_at=db_plan.created_at,
        zone_name=zone.name if zone else "Unknown",
        work_type=template.work_type,
        required_ppe=template.required_ppe,
        checklist_items=template.checklist_items,
        allocations=[] 
    )


@router.delete("/work/plans/{plan_id}", status_code=204)
async def delete_work_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    """일일 작업 계획 삭제 (배정(WorkerAllocation) 먼저 삭제 후 계획 삭제)"""
    result = await db.execute(select(DailyWorkPlan).where(DailyWorkPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="작업 계획을 찾을 수 없습니다.")
    await db.execute(sql_delete(WorkerAllocation).where(WorkerAllocation.plan_id == plan_id))
    await db.execute(sql_delete(DailyWorkPlan).where(DailyWorkPlan.id == plan_id))
    await db.commit()
    return None
