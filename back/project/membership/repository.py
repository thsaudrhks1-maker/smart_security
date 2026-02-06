
from back.database import fetch_all, fetch_one, execute

class membership_repository:
    """[PROJECT_MEMBERSHIP] 소속 및 참여업체 데이터 접근"""
    
    @staticmethod
    async def get_project_members(pid: int):
        # project_users 테이블 사용 (최종 명칭)
        sql = """
            SELECT m.*, u.full_name, u.role, c.name as company_name
            FROM project_users m
            JOIN sys_users u ON m.user_id = u.id
            LEFT JOIN sys_companies c ON u.company_id = c.id
            WHERE m.project_id = :pid
        """
        return await fetch_all(sql, {"pid": pid})

    @staticmethod
    async def get_project_companies(pid: int):
        # project_companies 테이블 사용
        sql = """
            SELECT pc.role, c.*
            FROM project_companies pc
            JOIN sys_companies c ON pc.company_id = c.id
            WHERE pc.project_id = :pid
        """
        return await fetch_all(sql, {"pid": pid})
