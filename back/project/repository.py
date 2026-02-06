
from back.database import fetch_all, fetch_one, execute, insert_and_return
from typing import List, Dict, Any

class project_repository:
    """[PROJECT] 마스터, 현장, 구역, 멤버 관리"""

    @staticmethod
    async def get_all_projects():
        sql = """
            SELECT p.*, 
                   (SELECT count(*) FROM project_sites WHERE project_id = p.id) as site_count
            FROM project_master p ORDER BY created_at DESC
        """
        return await fetch_all(sql)

    @staticmethod
    async def get_project_sites(project_id: int):
        return await fetch_all("SELECT * FROM project_sites WHERE project_id = :pid", {"pid": project_id})

    @staticmethod
    async def get_site_zones(site_id: int):
        return await fetch_all("SELECT * FROM project_zones WHERE site_id = :sid ORDER BY level, name", {"sid": site_id})

    @staticmethod
    async def get_project_members(project_id: int):
        sql = """
            SELECT m.*, u.full_name, u.role as sys_role
            FROM project_members m
            JOIN sys_users u ON m.user_id = u.id
            WHERE m.project_id = :pid
        """
        return await fetch_all(sql, {"pid": project_id})
