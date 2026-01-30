from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from back.database import get_db
from back.company.model import Worker
from back.work.model import DailyWorkPlan

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard/summary")
async def get_dashboard_summary(site_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    대시보드 상단/하단에 들어갈 요약 정보 조회
    """
    
    # 1. Total Workers (출역 예정/확정 포함)
    # 실제로는 출역 테이블과 조인해야 하지만, MVP에서는 전체 Worker 수로 대체하거나 status 컬럼 추가 필요.
    # 일단 전체 등록 작업자 수로 표시
    worker_res = await db.execute(select(func.count(Worker.id)))
    total_workers = worker_res.scalar() or 0
    
    # 2. Today's Plans
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    
    plan_query = select(DailyWorkPlan).where(
        DailyWorkPlan.site_id == site_id,
        DailyWorkPlan.date == today
    )
    plan_res = await db.execute(plan_query)
    plans = plan_res.scalars().all()
    
    total_plans = len(plans)
    
    # 3. Active Equipment (Plan의 equipment_flags 파싱)
    # equipment_flags는 JSON 리스트 (예: ['CRANE', 'LIFT'])
    active_equipment_count = 0
    for p in plans:
        if p.equipment_flags:
            active_equipment_count += len(p.equipment_flags)
            
    # 4. Status Counts
    # Mock data for now if needed, or derived from plans
    
    return {
        "site_id": site_id,
        "total_workers": total_workers, # 출역 인원 (등록된 전체)
        "today_plans": total_plans,     # 금일 작업 수
        "active_equipment": active_equipment_count, # 가동 장비
        "safety_accident_free_days": 1250 # 무재해 일수 (임시 하드코딩)
    }
