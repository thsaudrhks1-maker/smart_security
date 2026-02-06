
from back.database import fetch_all, fetch_one

class membership_repository:
    """[PROJECT_MEMBERSHIP] 소속 및 참여업체 데이터 접근"""
    @staticmethod
    async def get_project_members(pid: int):
        sql = """
            SELECT m.*, u.full_name, u.role, c.name as company_name
            FROM project_members m
            JOIN sys_users u ON m.user_id = u.id
            JOIN sys_companies c ON u.company_id = c.id
            WHERE m.project_id = :pid
        """
        return await fetch_all(sql, {"pid": pid})
