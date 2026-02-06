
from back.project.locations.repository import locations_repository

class locations_service:
    """[PROJECT_LOCATIONS] 비즈니스 로직"""
    @staticmethod
    async def get_project_layout(pid: int):
        sites = await locations_repository.get_sites_by_project(pid)
        return sites
