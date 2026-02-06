
from back.database import fetch_all, fetch_one

class work_info_repository:
    """[CONTENT_WORK] 표준 작업 정보 데이터 접근"""
    @staticmethod
    async def get_all():
        return await fetch_all("SELECT * FROM content_work_info ORDER BY work_type")

    @staticmethod
    async def get_by_id(tid: int):
        return await fetch_one("SELECT * FROM content_work_info WHERE id = :id", {"id": tid})
