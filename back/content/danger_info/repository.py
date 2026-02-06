
from back.database import fetch_all, fetch_one, insert_and_return

class danger_info_repository:
    """[CONTENT_DANGER] 위험 요소 정보 데이터 접근"""
    @staticmethod
    async def get_all():
        return await fetch_all("SELECT * FROM content_danger_info ORDER BY danger_type")

    @staticmethod
    async def get_by_id(did: int):
        return await fetch_one("SELECT * FROM content_danger_info WHERE id = :id", {"id": did})
    
    @staticmethod
    async def create(data: dict):
        """새로운 위험 요소 정보 생성"""
        sql = """
            INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level)
            VALUES (:danger_type, :icon, :color, :description, :risk_level)
            RETURNING *
        """
        return await insert_and_return(sql, data)
