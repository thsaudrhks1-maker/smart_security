
from back.database import fetch_all, insert_and_return
from datetime import date

class task_plans_repository:
    """[DAILY_TASKS] 일일 실무 계획 데이터 접근"""
    @staticmethod
    async def get_by_site(sid: int, d: date):
        sql = """
            SELECT t.*, z.name as zone_name, wt.work_type
            FROM daily_work_tasks t
            JOIN project_zones z ON t.zone_id = z.id
            JOIN content_work_templates wt ON t.template_id = wt.id
            WHERE t.site_id = :sid AND t.date = :d
        """
        return await fetch_all(sql, {"sid": sid, "d": d})
