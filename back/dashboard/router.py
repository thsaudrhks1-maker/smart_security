from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from back.database import get_db
from back.dashboard.repository import DashboardRepository

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard/summary")
async def get_dashboard_summary(site_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    대시보드 상단 요약 정보 (금일 실시간 데이터)
    """
    repo = DashboardRepository(db)
    today = datetime.now().strftime("%Y-%m-%d")

    # 1. 금일 실제 출역 인원 (작업에 투입된 인원)
    today_worker_count = await repo.get_today_worker_count(site_id, today)
    
    # 2. 금일 작업 현황
    plans = await repo.get_today_plans(site_id, today)
    total_plans = len(plans)

    # 3. 가동 장비 (Plan의 equipment_flags 파싱)
    active_equipment_count = 0
    for p in plans:
        if p.equipment_flags:
            active_equipment_count += len(p.equipment_flags)

    return {
        "site_id": site_id,
        "total_workers": today_worker_count,  # 실제 오늘 출근한(작업 배정된) 인원
        "today_plans": total_plans,
        "active_equipment": active_equipment_count, 
        "safety_accident_free_days": 1250 # (임시) 나중에 Global Config 테이블에서 조회
    }

@router.get("/dashboard/workers/today")
async def get_today_workers(site_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    금일 출역 작업자 상세 명단 조회
    """
    repo = DashboardRepository(db)
    today = datetime.now().strftime("%Y-%m-%d")
    
    allocations = await repo.get_today_worker_list(site_id, today)
    
    # 프론트엔드용 데이터 가공 (Flatten)
    result = []
    for alloc in allocations:
        result.append({
            "worker_name": alloc.worker.name,
            "work_type": alloc.plan.template.work_type,
            "role": alloc.role,
            "blood_type": alloc.worker.blood_type,
            "status": "투입중" # 나중에 실시간 위치 기반 상태 로직 추가 가능
        })
    
    return result
