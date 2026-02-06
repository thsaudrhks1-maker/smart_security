
from back.database import fetch_all, fetch_one, execute, insert_and_return
from typing import List, Dict, Any
from datetime import date

class daily_repository:
    """[DAILY] 출역, 작업, 공지, 로그 통합"""

    @staticmethod
    async def get_attendance(project_id: int, target_date: date):
        sql = """
            SELECT a.*, u.full_name, c.name as company_name
            FROM daily_attendance a
            JOIN sys_users u ON a.user_id = u.id
            JOIN sys_companies c ON u.company_id = c.id
            WHERE a.project_id = :pid AND a.date = :d
        """
        return await fetch_all(sql, {"pid": project_id, "d": target_date})

    @staticmethod
    async def get_tasks(site_id: int, target_date: date):
        sql = """
            SELECT t.*, z.name as zone_name, wt.work_type
            FROM daily_work_tasks t
            JOIN project_zones z ON t.zone_id = z.id
            JOIN content_work_templates wt ON t.template_id = wt.id
            WHERE t.site_id = :sid AND t.date = :d
        """
        return await fetch_all(sql, {"sid": site_id, "d": target_date})

    @staticmethod
    async def get_notices(project_id: int):
        return await fetch_all("SELECT * FROM daily_notices WHERE project_id = :pid ORDER BY created_at DESC", {"pid": project_id})
