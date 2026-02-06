
from back.database import fetch_all, fetch_one, execute, insert_and_return
from typing import List, Dict, Any

class content_repository:
    """[CONTENT] 표준 공종 및 장비 마스터"""

    @staticmethod
    async def get_all_templates():
        return await fetch_all("SELECT * FROM content_work_templates ORDER BY work_type")

    @staticmethod
    async def get_all_gear():
        return await fetch_all("SELECT * FROM content_safety_gear ORDER BY name")

    @staticmethod
    async def get_template_gear(template_id: int):
        """특정 공종에 맵핑된 안전 장비 목록"""
        sql = """
            SELECT g.* FROM content_safety_gear g
            JOIN content_work_gear_map m ON g.id = m.resource_id
            WHERE m.template_id = :tid
        """
        return await fetch_all(sql, {"tid": template_id})
