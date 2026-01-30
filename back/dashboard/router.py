from fastapi import APIRouter
from datetime import datetime
from back.dashboard.repository import DashboardRepository

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard/summary")
async def get_dashboard_summary(site_id: int = 1):
    """
    대시보드 상단 요약 정보 (금일 실시간 데이터)
    """
    today = datetime.now().strftime("%Y-%m-%d")

    # 1. DB 쿼리 (병렬 처리는 나중에 필요하면 asyncio.gather 사용)
    today_worker_count = await DashboardRepository.get_today_worker_count(site_id, today)
    plans = await DashboardRepository.get_today_plans(site_id, today)
    
    # 2. 로직 계산
    total_plans = len(plans)
    active_equipment_count = 0
    
    # JSON 컬럼 파싱 필요 없이, DB Row가 이미 Dict로 옴 (하지만 equipment_flags는 문자열로 올 수도 있으니 체크)
    for p in plans:
        # asyncpg나 pymysql은 JSON 타입을 자동으로 파이썬 list/dict로 변환해줌
        flags = p.get('equipment_flags')
        if flags and isinstance(flags, list):
            active_equipment_count += len(flags)

    return {
        "site_id": site_id,
        "total_workers": today_worker_count,
        "today_plans": total_plans,
        "active_equipment": active_equipment_count, 
        "safety_accident_free_days": 1250 
    }

@router.get("/dashboard/workers/today")
async def get_today_workers(site_id: int = 1):
    """
    금일 인력 현황 상세 조회 (전체 + 출역여부)
    """
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Repository 호출 한 방으로 해결
    workers = await DashboardRepository.get_today_worker_list_detailed(site_id, today)
    
    # 프론트엔드 포맷에 맞게 키 이름 조정이 필요하면 여기서 매핑 (지금은 쿼리에서 이미 별칭 씀)
    # 쿼리 결과: id, name, trade, company_name, today_status, today_role, today_work
    
    # 필요하다면 추가 가공 (예: frontend에서 쓰는 worker_name으로 변환 등)
    result = []
    for w in workers:
        w['worker_name'] = w['name'] # 프론트 호환성 유지
        w['work_type'] = w['today_work'] or '-'
        w['status'] = w['today_status']
        w['role'] = w['today_role'] or '-'
        w['blood_type'] = 'A' # 임시 (DB에 없음)
        result.append(w)
        
    return result
