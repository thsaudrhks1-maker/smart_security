
from back.database import fetch_all, fetch_one, insert_and_return
from typing import Dict, Any

class master_repository:
    """[PROJECT_MASTER] 데이터 접근"""
    @staticmethod
    async def get_all():
        return await fetch_all("SELECT * FROM project_master ORDER BY created_at DESC")

    @staticmethod
    async def get_by_id(pid: int):
        return await fetch_one("SELECT * FROM project_master WHERE id = :id", {"id": pid})

    @staticmethod
    async def create(data: Dict[str, Any]):
        sql = "INSERT INTO project_master (name, description, status) VALUES (:name, :description, :status) RETURNING *"
        return await insert_and_return(sql, data)
