
from back.daily.tasks.repository import task_plans_repository
from back.daily.attendance.repository import attendance_repository
from back.daily.notices.repository import notices_repository
from datetime import date

class daily_tasks_service:
    """[DAILY_TASKS] 작업 관리 및 작업자 뷰 제공"""

    @staticmethod
    async def get_my_work_summary(user_id: int):
        today = date.today()
        # 1. 내게 할당된 작업 조회
        tasks = await task_plans_repository.get_worker_tasks(user_id, today)
        return tasks

    @staticmethod
    async def get_full_dashboard(user_id: int):
        """작업자 앱을 위한 통합 정보 팩"""
        today = date.today()
        # 이사는 했지만 조각난 데이터들을 여기서 모읍니다.
        # (원래 worker/service.py에 있던 로직을 도메인별 리포지토리 호출로 정비 예정)
        return {
            "today": today,
            "notices": await notices_repository.get_all_notices(),
            "attendance": await attendance_repository.get_today_attendance(user_id)
        }
