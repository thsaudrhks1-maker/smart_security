
from back.database import fetch_one, fetch_all, insert_and_return
from typing import Dict, Any

class users_repository:
    """[SYS_USERS] 데이터 접근"""
    @staticmethod
    async def get_by_username(username: str):
        return await fetch_one("SELECT * FROM sys_users WHERE username = :u", {"u": username})

    @staticmethod
    async def get_all():
        return await fetch_all("SELECT * FROM sys_users")

    @staticmethod
    async def get_by_company(company_id: int):
        return await fetch_all("SELECT * FROM sys_users WHERE company_id = :cid", {"cid": company_id})

    @staticmethod
    async def create(data: Dict[str, Any]):
        sql = """
            INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, phone)
            VALUES (:username, :hashed_password, :full_name, :role, :company_id, :phone)
            RETURNING *
        """
        return await insert_and_return(sql, data)
    
    @staticmethod
    async def get_user_project(user_id: int):
        """사용자가 속한 프로젝트 ID 조회"""
        result = await fetch_one("""
            SELECT pu.project_id
            FROM project_users pu
            WHERE pu.user_id = :uid AND pu.status = 'ACTIVE'
            LIMIT 1
        """, {"uid": user_id})
        return result["project_id"] if result else None
