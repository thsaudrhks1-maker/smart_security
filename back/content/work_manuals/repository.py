
from back.database import fetch_all, fetch_one

class work_manuals_repository:
    """[CONTENT_WORK] 표준 매뉴얼 데이터 접근"""
    @staticmethod
    async def get_all():
        return await fetch_all("SELECT * FROM content_work_templates ORDER BY work_type")

    @staticmethod
    async def get_by_id(tid: int):
        return await fetch_one("SELECT * FROM content_work_templates WHERE id = :id", {"id": tid})
