
from back.database import fetch_all, fetch_one, insert_and_return
from typing import Dict, Any

class notices_repository:
    """[DAILY_NOTICES] 공지사항 및 안전정보 데이터 접근"""

    @staticmethod
    async def get_all_notices():
        """공지사항 목록 (작성자 이름 포함)"""
        sql = """
            SELECT n.*, u.full_name as author_name
            FROM daily_notices n
            LEFT JOIN sys_users u ON n.created_by = u.id
            ORDER BY n.is_important DESC, n.created_at DESC
        """
        return await fetch_all(sql)

    @staticmethod
    async def create_notice(data: Dict[str, Any]):
        sql = """
            INSERT INTO daily_notices (project_id, title, content, is_important, created_by)
            VALUES (:project_id, :title, :content, :is_important, :created_by)
            RETURNING *
        """
        return await insert_and_return(sql, data)

    @staticmethod
    async def get_safety_info_by_date(target_date: str):
        """특정 날짜의 안전 정보 조회"""
        return await fetch_one("SELECT * FROM daily_safety_info WHERE date = :d", {"d": target_date})
