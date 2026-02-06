
from back.project.locations.repository import locations_repository

class locations_service:
    """[PROJECT_LOCATIONS] 비즈니스 로직 (프로젝트 1개 = 사이트 1개, 구역은 project_zones)"""
    @staticmethod
    async def get_project_layout(pid: int):
        project = await locations_repository.get_project(pid)
        if not project:
            return []
        zones = await locations_repository.get_zones_by_project(pid)
        return [{"id": project["id"], "name": project["name"], "zones": zones}]
