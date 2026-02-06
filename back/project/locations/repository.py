
from back.database import fetch_all, fetch_one, insert_and_return

class locations_repository:
    """[PROJECT_LOCATIONS] 사이트 및 구역 데이터 접근"""
    @staticmethod
    async def get_sites_by_project(pid: int):
        return await fetch_all("SELECT * FROM project_sites WHERE project_id = :pid", {"pid": pid})

    @staticmethod
    async def get_zones_by_site(sid: int):
        return await fetch_all("SELECT * FROM project_zones WHERE site_id = :sid ORDER BY level, name", {"sid": sid})
