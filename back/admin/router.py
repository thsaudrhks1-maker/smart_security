
from fastapi import APIRouter
from back.database import fetch_one, fetch_all

router = APIRouter()

@router.get("/stats")
async def get_system_stats():
    """시스템 전체 통계 (어드민용)"""
    # 1. 활성 프로젝트 수
    project_count = await fetch_one("SELECT count(*) as count FROM project_master WHERE status = 'ACTIVE'")
    
    # 2. 전체 등록 사용자 수
    user_count = await fetch_one("SELECT count(*) as count FROM sys_users")
    
    # 3. 미해결 긴급 신고 (daily_danger_zones 중 status='PENDING' 및 특정 긴급 조건일 수 있음. 여기선 임시 PENDING 수)
    emergency_count = await fetch_one("SELECT count(*) as count FROM daily_danger_zones WHERE status = 'PENDING'")
    
    return {
        "success": True,
        "data": {
            "project_count": project_count['count'],
            "user_count": user_count['count'],
            "emergency_count": emergency_count['count'],
            "system_status": "정상"
        }
    }
