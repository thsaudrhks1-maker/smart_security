
from back.content.work_info.repository import work_info_repository

class work_info_service:
    """[CONTENT_WORK] 작업 정보 비즈니스 로직"""
    @staticmethod
    async def get_work_info_list():
        return await work_info_repository.get_all()
