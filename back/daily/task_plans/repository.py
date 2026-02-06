
from back.database import fetch_all, insert_and_return, execute
from datetime import date

class task_plans_repository:
    """[DAILY_TASKS] 일일 실무 계획 데이터 접근"""
    
    @staticmethod
    async def get_by_project(pid: int, d: date):
        sql = """
            SELECT t.*, z.name as zone_name, z.level, wt.work_type
            FROM daily_work_tasks t
            JOIN project_zones z ON t.zone_id = z.id
            JOIN content_work_templates wt ON t.template_id = wt.id
            WHERE t.project_id = :pid AND t.date = :d
        """
        return await fetch_all(sql, {"pid": pid, "d": d})

    @staticmethod
    async def get_worker_users(plan_id: int):
        # daily_worker_users 테이블 사용 (최종 명칭)
        sql = """
            SELECT u.id, u.full_name, u.role, c.name as company_name
            FROM daily_worker_users wa
            JOIN sys_users u ON wa.worker_id = u.id
            LEFT JOIN sys_companies c ON u.company_id = c.id
            WHERE wa.plan_id = :pid
        """
        return await fetch_all(sql, {"pid": plan_id})
