from back.database import fetch_all, fetch_one, execute, insert_and_return
from typing import List, Dict, Any
from datetime import date

class SafetyRepository:
    """안전 관리 데이터 접근 계층 (SQL Repository Pattern)"""
    
    @staticmethod
    async def get_zones(project_id: int = None, site_id: int = None) -> List[Dict[str, Any]]:
        params = {}
        filters = []
        if project_id:
            filters.append("project_id = :project_id")
            params["project_id"] = project_id
        if site_id:
            filters.append("site_id = :site_id")
            params["site_id"] = site_id
            
        filter_clause = "WHERE " + " AND ".join(filters) if filters else ""
        sql = f"SELECT * FROM zones {filter_clause} ORDER BY id"
        return await fetch_all(sql, params)

    @staticmethod
    async def create_zone(data: Dict[str, Any]) -> Dict[str, Any]:
        sql = """
            INSERT INTO zones (
                project_id, site_id, name, level, type, lat, lng, 
                grid_x, grid_y, grid_z, default_hazards, created_at, updated_at
            ) VALUES (
                :project_id, :site_id, :name, :level, :type, :lat, :lng, 
                :grid_x, :grid_y, :grid_z, :default_hazards, :created_at, :updated_at
            ) RETURNING *
        """
        return await insert_and_return(sql, data)

    @staticmethod
    async def bulk_create_zones(zones_list: List[Dict[str, Any]]):
        """다수의 구역 한꺼번에 생성"""
        if not zones_list:
            return
            
        sql = """
            INSERT INTO zones (
                project_id, site_id, name, level, type, lat, lng, 
                grid_x, grid_y, grid_z, created_at, updated_at
            ) VALUES (
                :project_id, :site_id, :name, :level, :type, :lat, :lng, 
                :grid_x, :grid_y, :grid_z, :created_at, :updated_at
            )
        """
        # executemany 가 없어서 반복문 돌리거나 한방 쿼리로 만들어야함
        # fetch_all 등으로 다중 밸류 처리는 가능하지만 일단 루프 + execute
        # 실제로는 executemany가 성능상 좋음 (SQLAlchemy asyncpg는 지원함)
        from back.database import engine
        from sqlalchemy import text
        async with engine.begin() as conn:
            await conn.execute(text(sql), zones_list)

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
            SET {set_clause}, updated_at = :updated_at 
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
