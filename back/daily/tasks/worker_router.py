
from fastapi import APIRouter, Depends
from back.sys.users.service import users_service # 인증용 (추후)
from back.daily.tasks.service import daily_tasks_service

router = APIRouter()

@router.get("/today")
async def get_my_work_today(user_id: int): # Depends 사용 전 임시 ID
    """모바일 앱 용: 오늘 나의 할 일과 위험 요소"""
    return await daily_tasks_service.get_my_work_summary(user_id)

@router.get("/dashboard")
async def get_worker_dashboard(user_id: int):
    """모바일 앱 용: 대시보드 정보 (날씨, 공지, 출역합산)"""
    return await daily_tasks_service.get_full_dashboard(user_id)
