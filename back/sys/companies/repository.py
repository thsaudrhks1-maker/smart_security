
from back.database import fetch_all, fetch_one, insert_and_return

class companies_repository:
    """[SYS_COMPANIES] 데이터 접근"""
    @staticmethod
    async def get_all():
        return await fetch_all("SELECT * FROM sys_companies ORDER BY name")

    @staticmethod
    async def get_by_id(cid: int):
        return await fetch_one("SELECT * FROM sys_companies WHERE id = :id", {"id": cid})
