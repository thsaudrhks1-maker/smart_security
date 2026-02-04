from back.notice.repository import NoticeRepository
from back.notice.schema import NoticeCreate, NoticeUpdate
from typing import List, Dict, Any

class NoticeService:
    """공지사항 비즈니스 로직 계층 (Service Pattern)"""

    @staticmethod
    async def create_notice(author_id: int, notice_data: NoticeCreate):
        return await NoticeRepository.create(author_id, notice_data)

    @staticmethod
    async def get_project_notices(project_id: int, limit: int = 20):
        return await NoticeRepository.get_project_notices(project_id, limit)

    @staticmethod
    async def get_notice(notice_id: int):
        return await NoticeRepository.get_by_id(notice_id)

    @staticmethod
    async def update_notice(notice_id: int, notice_data: NoticeUpdate):
        return await NoticeRepository.update(notice_id, notice_data)

    @staticmethod
    async def delete_notice(notice_id: int):
        return await NoticeRepository.delete(notice_id)
