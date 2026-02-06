
from back.database import fetch_all

class safety_gear_repository:
    """[CONTENT_GEAR] 안전 장비 데이터 접근"""
    @staticmethod
    async def get_all():
        return await fetch_all("SELECT * FROM content_safety_gear ORDER BY name")

    @staticmethod
    async def get_gear_by_template(tid: int):
        sql = """
            SELECT g.* FROM content_safety_gear g
            JOIN content_work_gear_map m ON g.id = m.resource_id
            WHERE m.template_id = :tid
        """
        return await fetch_all(sql, {"tid": tid})
