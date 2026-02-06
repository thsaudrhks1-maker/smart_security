
from back.project.master.repository import master_repository

class master_service:
    """[PROJECT_MASTER] 비즈니스 로직"""
    @staticmethod
    async def list_all():
        return await master_repository.get_all()
