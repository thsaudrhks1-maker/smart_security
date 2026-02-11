
from back.database import execute, fetch_all, insert_and_return
from back.content.safety_info.model import content_safety_info

class SafetyInfoRepository:
    async def get_all(self, category: str = None):
        where = ""
        params = {}
        if category:
            where = "WHERE category = :cat"
            params = {"cat": category}
            
        sql = f"SELECT * FROM content_safety_info {where} ORDER BY id DESC"
        return await fetch_all(sql, params)

    async def upsert_from_api(self, data: dict):
        """
        [NEW] 외부 API 데이터를 DB에 반영 (제목 기준 중복 방지)
        """
        sql = """
            INSERT INTO content_safety_info 
            (category, title, description, safety_measures, summary, embedding)
            VALUES (:cat, :title, :desc, :meas, :summary, :emb)
            ON CONFLICT (title) DO UPDATE 
            SET embedding = EXCLUDED.embedding, 
                description = EXCLUDED.description,
                safety_measures = EXCLUDED.safety_measures,
                summary = EXCLUDED.summary
            RETURNING id
        """
        return await insert_and_return(sql, data)

    async def search_by_vector(self, vector: list, limit: int = 3):
        """
        [AI] 벡터 유사도 기반 검색
        """
        sql = """
            SELECT id, category, title, description, 
                   (1 - (embedding <=> :vec::vector)) as similarity
            FROM content_safety_info
            ORDER BY embedding <=> :vec::vector
            LIMIT :limit
        """
        return await fetch_all(sql, {"vec": vector, "limit": limit})

safety_info_repo = SafetyInfoRepository()
