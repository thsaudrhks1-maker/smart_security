
from back.content.work_manuals.repository import work_manuals_repository

class work_manuals_service:
    """[CONTENT_WORK] 작업 지침 비즈니스 로직"""
    @staticmethod
    async def get_manual_list():
        return await work_manuals_repository.get_all()
