
from back.daily.task_plans.repository import task_plans_repository
from datetime import date

class TaskPlansService:
    @staticmethod
    async def get_plans_with_details(project_id: int, target_date: date):
        # 1. 작업 계획 목록 조회 (프로젝트 기준)
        plans = await task_plans_repository.get_by_project(project_id, target_date)
        
        # 2. 각 계획별 투입 인원 상세 정보 매핑
        for plan in plans:
            plan['workers'] = await task_plans_repository.get_worker_users(plan['id'])
            
        return {"success": True, "data": plans}

    @staticmethod
    async def create_plan(plan_data: dict):
        # 작업 계획 생성 로직 (나중에 상세화 가능)
        return {"success": True, "message": "성공적으로 등록되었습니다."}

task_plans_service = TaskPlansService()
