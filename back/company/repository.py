from datetime import datetime
from back.database import fetch_all, fetch_one, execute, insert_and_return
from typing import List, Dict, Any

class CompanyRepository:
    """업체 데이터 접근 계층 (SQL Repository Pattern)"""
    
    @staticmethod
    async def get_all_companies() -> List[Dict[str, Any]]:
        sql = "SELECT * FROM companies ORDER BY name"
        return await fetch_all(sql)

    @staticmethod
    async def get_company_by_id(company_id: int) -> Dict[str, Any] | None:
        sql = "SELECT * FROM companies WHERE id = :company_id"
        return await fetch_one(sql, {"company_id": company_id})

    @staticmethod
    async def get_company_by_name(name: str) -> Dict[str, Any] | None:
        sql = "SELECT * FROM companies WHERE name = :name"
        return await fetch_one(sql, {"name": name})

    @staticmethod
    async def create_company(name: str, trade_type: str = "미지정") -> Dict[str, Any]:
        sql = """
            INSERT INTO companies (name, trade_type, created_at, updated_at)
            VALUES (:name, :trade_type, :created_at, :updated_at)
            RETURNING *
        """
        now = datetime.now()
        return await insert_and_return(sql, {
            "name": name, 
            "trade_type": trade_type,
            "created_at": now,
            "updated_at": now
        })

    @staticmethod
    async def get_company_workers(company_id: int = None) -> List[Dict[str, Any]]:
        params = {}
        filter_clause = ""
        if company_id:
            filter_clause = "AND u.company_id = :company_id"
            params["company_id"] = company_id
            
        sql = f"""
            SELECT u.id, u.full_name as name, u.company_id, 
                   COALESCE(u.job_type, '미지정') as job_type,
                   c.name as company_name
            FROM users u
            LEFT JOIN companies c ON u.company_id = c.id
            WHERE u.role = 'worker' {filter_clause}
            ORDER BY u.full_name
        """
        return await fetch_all(sql, params)

    @staticmethod
    async def get_company_users_by_roles(company_id: int, roles: List[str]) -> List[Dict[str, Any]]:
        sql = """
            SELECT id, full_name, role, title
            FROM users
            WHERE company_id = :company_id AND role = ANY(:roles)
            ORDER BY full_name
        """
        return await fetch_all(sql, {"company_id": company_id, "roles": roles})
