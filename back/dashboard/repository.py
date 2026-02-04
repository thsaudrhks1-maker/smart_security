from back.database import fetch_all, fetch_one
from datetime import datetime


def _to_date(value):
    if value is None:
        return None
    if hasattr(value, "year"):
        return value
    if isinstance(value, str):
        return datetime.strptime(value, "%Y-%m-%d").date()
    return value


class DashboardRepository:
    """
    SQL-First Repository for Dashboard
    ORM의 복잡성을 제거하고 직관적인 SQL을 사용함.
    """

    @staticmethod
    async def get_today_worker_count(site_id: int, date: str) -> int:
        """금일 투입된 작업자 수"""
        sql = """
            SELECT count(distinct wa.worker_id) as cnt
            FROM daily_work_plans dp
            JOIN worker_allocations wa ON dp.id = wa.plan_id
            WHERE dp.site_id = :site_id 
              AND dp.date = :date
        """
        result = await fetch_one(sql, {"site_id": site_id, "date": _to_date(date)})
        return result['cnt'] if result else 0

    @staticmethod
    async def get_today_plans(site_id: int, date: str):
        """금일 작업 계획 리스트"""
        sql = """
            SELECT dp.*, wt.work_type, wt.base_risk_score
            FROM daily_work_plans dp
            JOIN work_templates wt ON dp.template_id = wt.id
            WHERE dp.site_id = :site_id 
              AND dp.date = :date
        """
        return await fetch_all(sql, {"site_id": site_id, "date": _to_date(date)})

    @staticmethod
    async def get_today_worker_list_detailed(site_id: int, date: str):
        """
        전체 작업자 목록 + 금일 작업 상태 (LEFT JOIN)
        1. workers 테이블을 기준으로 
        2. 오늘자 plan에 배정된 allocation 정보를 붙임
        """
        sql = """
            SELECT 
                w.id, w.name, w.trade, u.phone_number, w.birth_date, w.address,
                c.name as company_name,
                CASE WHEN wa.id IS NOT NULL THEN 'WORKING' ELSE 'REST' END as today_status,
                wa.role as today_role,
                wt.work_type as today_work
            FROM workers w
            JOIN users u ON w.user_id = u.id
            JOIN companies c ON w.company_id = c.id
            LEFT JOIN worker_allocations wa ON w.id = wa.worker_id
            LEFT JOIN daily_work_plans dp ON wa.plan_id = dp.id AND dp.date = :date AND dp.site_id = :site_id
            LEFT JOIN work_templates wt ON dp.template_id = wt.id
            ORDER BY 
                CASE WHEN wa.id IS NOT NULL THEN 0 ELSE 1 END, -- 작업중인 사람 먼저
                w.trade, 
                w.name
        """
        return await fetch_all(sql, {"site_id": site_id, "date": _to_date(date)})
