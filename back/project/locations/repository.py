
from back.database import fetch_all, fetch_one

class locations_repository:
    """[PROJECT_LOCATIONS] 프로젝트·구역 데이터 접근 (project_sites 미사용, project_master + project_zones만 사용)"""
    @staticmethod
    async def get_project(pid: int):
        return await fetch_one("SELECT id, name FROM project_master WHERE id = :pid", {"pid": pid})

    @staticmethod
    async def get_zones_by_project(pid: int):
        return await fetch_all(
            "SELECT * FROM project_zones WHERE project_id = :pid ORDER BY level, name",
            {"pid": pid}
        )
