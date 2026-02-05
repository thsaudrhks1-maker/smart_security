from back.database import fetch_all, fetch_one, execute, insert_and_return
from typing import List, Dict, Any
from datetime import date

class SafetyRepository:
    """안전 관리 데이터 접근 계층 (SQL Repository Pattern)"""
    
    @staticmethod
    async def get_zones(site_id: int = None) -> List[Dict[str, Any]]:
        params = {}
        filter_clause = ""
        if site_id:
            filter_clause = "WHERE site_id = :site_id"
            params["site_id"] = site_id
            
        sql = f"SELECT * FROM zones {filter_clause} ORDER BY id"
        return await fetch_all(sql, params)

    @staticmethod
    async def create_zone(data: Dict[str, Any]) -> Dict[str, Any]:
        sql = """
            INSERT INTO zones (
                site_id, name, level, type, lat, lng, default_hazards, created_at, updated_at
            ) VALUES (
                :site_id, :name, :level, :type, :lat, :lng, :default_hazards, NOW(), NOW()
            ) RETURNING *
        """
        return await insert_and_return(sql, data)

    @staticmethod
    async def get_zone_by_id(zone_id: int) -> Dict[str, Any] | None:
        sql = "SELECT * FROM zones WHERE id = :zone_id"
        return await fetch_one(sql, {"zone_id": zone_id})

    @staticmethod
    async def update_zone(zone_id: int, data: Dict[str, Any]) -> Dict[str, Any] | None:
        if not data:
            return await SafetyRepository.get_zone_by_id(zone_id)
            
        set_clause = ", ".join([f"{k} = :{k}" for k in data.keys()])
        data["zone_id"] = zone_id
        
        sql = f"""
            UPDATE zones 
            SET {set_clause}, updated_at = NOW() 
            WHERE id = :zone_id 
            RETURNING *
        """
        return await insert_and_return(sql, data)

    @staticmethod
    async def get_daily_danger_zones(target_date: date, zone_id: int = None) -> List[Dict[str, Any]]:
        params = {"target_date": target_date}
        filter_clause = ""
        if zone_id:
            filter_clause = "AND zone_id = :zone_id"
            params["zone_id"] = zone_id
            
        sql = f"""
            SELECT * FROM daily_danger_zones 
            WHERE date = :target_date {filter_clause}
            ORDER BY zone_id, id
        """
        return await fetch_all(sql, params)

    @staticmethod
    async def create_daily_danger_zone(data: Dict[str, Any]) -> Dict[str, Any]:
        sql = """
            INSERT INTO daily_danger_zones (zone_id, date, risk_type, description)
            VALUES (:zone_id, :date, :risk_type, :description)
            RETURNING *
        """
        return await insert_and_return(sql, data)

    @staticmethod
    async def delete_daily_danger_zone(danger_zone_id: int) -> bool:
        sql = "DELETE FROM daily_danger_zones WHERE id = :danger_zone_id"
        result = await execute(sql, {"danger_zone_id": danger_zone_id})
        return result.rowcount > 0

    @staticmethod
    async def get_zones_by_project_id(project_id: int) -> List[Dict[str, Any]]:
        """프로젝트에 속한 모든 사이트의 구역 조회 (좌표 있는 것만)"""
        sql = """
            SELECT z.*
            FROM zones z
            JOIN sites s ON z.site_id = s.id
            WHERE s.project_id = :project_id
              AND z.lat IS NOT NULL
              AND z.lng IS NOT NULL
            ORDER BY z.id
        """
        return await fetch_all(sql, {"project_id": project_id})
