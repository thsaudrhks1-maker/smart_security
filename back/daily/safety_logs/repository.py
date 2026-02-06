
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
    
    @staticmethod
    async def get_by_project(pid: int, d: date):
        """프로젝트의 모든 위험 구역 조회"""
        sql = """
            SELECT 
                dz.*, 
                z.name as zone_name, 
                z.level,
                di.danger_type,
                di.icon,
                di.color,
                di.risk_level
            FROM daily_danger_zones dz
            JOIN project_zones z ON dz.zone_id = z.id
            LEFT JOIN content_danger_info di ON dz.danger_info_id = di.id
            WHERE z.project_id = :pid AND dz.date = :d
            ORDER BY z.level, z.name
        """
        return await fetch_all(sql, {"pid": pid, "d": d})
    
    @staticmethod
    async def create_danger_zone(data: dict):
        """위험 구역 생성"""
        sql = """
            INSERT INTO daily_danger_zones (zone_id, date, risk_type, description)
            VALUES (:zone_id, :date, :risk_type, :description)
            RETURNING *
        """
        return await insert_and_return(sql, data)
    
    @staticmethod
    async def delete_danger_zone(danger_id: int):
        """위험 구역 삭제"""
        from back.database import execute
        await execute("DELETE FROM daily_danger_zones WHERE id = :id", {"id": danger_id})
        return True
