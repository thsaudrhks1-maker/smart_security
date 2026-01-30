from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct
from sqlalchemy.orm import selectinload

from back.work.model import DailyWorkPlan, WorkerAllocation
from back.company.model import Worker
from back.work.model import WorkTemplate

class DashboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_today_worker_count(self, site_id: int, date: str) -> int:
        """
        금일 실제 작업에 투입된 작업자 수 (중복 제거)
        WorkerAllocation JOIN DailyWorkPlan
        """
        query = (
            select(func.count(distinct(WorkerAllocation.worker_id)))
            .join(DailyWorkPlan, WorkerAllocation.plan_id == DailyWorkPlan.id)
            .where(
                DailyWorkPlan.site_id == site_id,
                DailyWorkPlan.date == date
            )
        )
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_today_plans(self, site_id: int, date: str):
        """
        금일 작업 계획 리스트 조회 (Template 정보 포함)
        """
        query = (
            select(DailyWorkPlan)
            .options(selectinload(DailyWorkPlan.template))
            .where(
                DailyWorkPlan.site_id == site_id,
                DailyWorkPlan.date == date
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_today_worker_list(self, site_id: int, date: str):
        """
        금일 투입된 작업자 상세 명단 조회
        Worker 정보 + 어떤 작업(Plan)에 투입되었는지 + 역할
        """
        query = (
            select(WorkerAllocation)
            .join(DailyWorkPlan, WorkerAllocation.plan_id == DailyWorkPlan.id)
            .options(
                selectinload(WorkerAllocation.worker),
                selectinload(WorkerAllocation.plan).selectinload(DailyWorkPlan.template)
            )
            .where(
                DailyWorkPlan.site_id == site_id,
                DailyWorkPlan.date == date
            )
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_total_registered_workers(self):
        """
        (참고용) 시스템에 등록된 전체 작업자 수
        """
        query = select(func.count(Worker.id))
        result = await self.db.execute(query)
        return result.scalar() or 0
