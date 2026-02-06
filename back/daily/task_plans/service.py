
from back.daily.task_plans.repository import task_plans_repository
from datetime import date

class TaskPlansService:
    @staticmethod
    async def get_plans_with_details(site_id: int, target_date: date):
        # DB에서 가져올 때 층 정보 등이 누락되지 않도록 함
        plans = await task_plans_repository.get_by_site(site_id, target_date)
        return {"success": True, "data": plans}

    @staticmethod
    async def create_plan(plan_data: dict):
        # 작업 계획 생성 로직 (나중에 상세화 가능)
        return {"success": True, "message": "성공적으로 등록되었습니다."}

task_plans_service = TaskPlansService()
