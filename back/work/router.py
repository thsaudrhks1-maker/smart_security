from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from back.database import get_db
from back.auth.dependencies import get_current_user
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation
from back.work.schema import WorkTemplateRead, DailyWorkPlanCreate, DailyWorkPlanRead, WorkerAllocationRead
from back.safety.model import Zone
# from back.company.model import Worker # 삭제

router = APIRouter(tags=["work"])

# --- Work Templates ---
@router.get("/work/templates", response_model=list[WorkTemplateRead])
async def get_work_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkTemplate))
    return result.scalars().all()

# --- Daily Work Plans ---
@router.get("/work/plans", response_model=list[DailyWorkPlanRead])
async def get_daily_plans(date: str = None, site_id: int = None, db: AsyncSession = Depends(get_db)):
    query = select(DailyWorkPlan).options(
        selectinload(DailyWorkPlan.zone),
        selectinload(DailyWorkPlan.template),
        selectinload(DailyWorkPlan.allocations).selectinload(WorkerAllocation.worker)
    )
    
    if date:
        query = query.where(DailyWorkPlan.date == date)
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
    current_user = Depends(get_current_user), # User 타입 힌트 생략 (순환 참조 방지)
    db: AsyncSession = Depends(get_db)
):
    if not date:
        from datetime import date as dt_date
        date = dt_date.today().isoformat()
        
    # Query: My Allocations -> Plans
    # (Select DailyWorkPlan where id IN (select plan_id from allocations where worker_id = :me) AND date = :date)
    
    # 조인으로 한 번에 가져오기
    query = (
        select(DailyWorkPlan)
        .join(WorkerAllocation, DailyWorkPlan.id == WorkerAllocation.plan_id)
        .where(
            WorkerAllocation.worker_id == current_user.id,
            DailyWorkPlan.date == date
        )
        .options(
            selectinload(DailyWorkPlan.zone),
            selectinload(DailyWorkPlan.template),
            selectinload(DailyWorkPlan.allocations).selectinload(WorkerAllocation.worker)
        )
    )
    
    result = await db.execute(query)
    plans = result.scalars().all()

    # Response Mapping (Duplicate logic... should refactor later)
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
            
        response.append(DailyWorkPlanRead(
            id=p.id,
            site_id=p.site_id,
            zone_id=p.zone_id,
            template_id=p.template_id,
            date=p.date,
            description=p.description,
            equipment_flags=p.equipment_flags,
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
    
    # 4. Create Plan
    db_plan = DailyWorkPlan(
        site_id=plan.site_id,
        zone_id=plan.zone_id,
        template_id=plan.template_id,
        date=plan.date,
        description=plan.description,
        equipment_flags=plan.equipment_flags,
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
        status=db_plan.status,
        calculated_risk_score=db_plan.calculated_risk_score,
        created_at=db_plan.created_at,
        zone_name=zone.name if zone else "Unknown",
        work_type=template.work_type,
        required_ppe=template.required_ppe,
        checklist_items=template.checklist_items,
        allocations=[] 
    )
