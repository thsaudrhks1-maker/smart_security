from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from back.notice.schema import NoticeCreate, NoticeUpdate
from back.database import execute, fetch_all, fetch_one

class NoticeRepository:
    @staticmethod
    async def create(db: AsyncSession, author_id: int, notice: NoticeCreate):
        query = """
            INSERT INTO notices (project_id, author_id, title, content, is_important, image_url, created_at)
            VALUES (:project_id, :author_id, :title, :content, :is_important, :image_url, NOW())
            RETURNING id, project_id, author_id, title, content, is_important, image_url, created_at
        """
        params = {
            "project_id": notice.project_id,
            "author_id": author_id,
            "title": notice.title,
            "content": notice.content,
            "is_important": notice.is_important,
            "image_url": notice.image_url
        }
        return await fetch_one(db, query, params)

    @staticmethod
    async def get_project_notices(db: AsyncSession, project_id: int, limit: int = 20):
        query = """
            SELECT n.*, u.full_name as author_name
            FROM notices n
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.project_id = :project_id
            ORDER BY n.is_important DESC, n.created_at DESC
            LIMIT :limit
        """
        return await fetch_all(db, query, {"project_id": project_id, "limit": limit})

    @staticmethod
    async def get_by_id(db: AsyncSession, notice_id: int):
        query = """
            SELECT n.*, u.full_name as author_name
            FROM notices n
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.id = :notice_id
        """
        return await fetch_one(db, query, {"notice_id": notice_id})

    @staticmethod
    async def update(db: AsyncSession, notice_id: int, notice: NoticeUpdate):
        query = """
            UPDATE notices 
            SET title = COALESCE(:title, title),
                content = COALESCE(:content, content),
                is_important = COALESCE(:is_important, is_important),
                image_url = COALESCE(:image_url, image_url),
                updated_at = NOW()
            WHERE id = :notice_id
            RETURNING *
        """
        params = notice.model_dump()
        params["notice_id"] = notice_id
        return await fetch_one(db, query, params)

    @staticmethod
    async def delete(db: AsyncSession, notice_id: int):
        query = "DELETE FROM notices WHERE id = :notice_id"
        await execute(db, query, {"notice_id": notice_id})
        return True
