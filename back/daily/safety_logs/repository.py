
from back.database import fetch_all, insert_and_return
from datetime import date

class safety_logs_repository:
    """[DAILY_SAFETY] 위험 구역 및 점검 로그 데이터 접근"""
    @staticmethod
    async def get_hazards(zid: int, d: date):
        sql = """
            SELECT dz.*, i.image_url
            FROM daily_danger_zones dz
            LEFT JOIN daily_danger_images i ON dz.id = i.danger_zone_id
            WHERE dz.zone_id = :zid AND dz.date = :d
        """
        return await fetch_all(sql, {"zid": zid, "d": d})
