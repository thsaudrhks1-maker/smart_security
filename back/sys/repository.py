
from back.database import fetch_all, fetch_one, execute, insert_and_return
from typing import List, Dict, Any
import bcrypt

class sys_repository:
    """[SYS] 사용자 및 업체 데이터 접근"""

    # --- Users ---
    @staticmethod
    async def get_user_by_username(username: str):
        return await fetch_one("SELECT * FROM sys_users WHERE username = :u", {"u": username})

    @staticmethod
    async def create_user(user_data: Dict[str, Any]):
        sql = """
            INSERT INTO sys_users (username, hashed_password, full_name, role, company_id, phone)
            VALUES (:username, :hashed_password, :full_name, :role, :company_id, :phone)
            RETURNING *
        """
        return await insert_and_return(sql, user_data)

    # --- Companies ---
    @staticmethod
    async def get_all_companies():
        return await fetch_all("SELECT * FROM sys_companies ORDER BY name")

    @staticmethod
    async def get_company_by_id(company_id: int):
        return await fetch_one("SELECT * FROM sys_companies WHERE id = :id", {"id": company_id})
