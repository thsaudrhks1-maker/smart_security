
from back.database import fetch_all, insert_and_return, execute
from typing import List, Dict, Any

class AccidentRepository:
    """[REPOSITORY] 사고 사례 데이터 접근"""
    
    async def upsert_accident(self, data: Dict[str, Any]):
        """이미 존재하는 사고(external_id 기준)는 업데이트, 없으면 삽입"""
        
        # [수정] json.dumps를 사용하여 세련되게 문자열로 변환
        if "emb" in data and isinstance(data["emb"], list):
            import json
            data["emb"] = json.dumps(data["emb"])

        sql = """
            INSERT INTO content_accidents 
            (data_source, external_id, category, title, description, cause, location, occurred_at, summary, embedding)
            VALUES (:source, :ext_id, :cat, :title, :desc, :cause, :loc, :date, :summary, CAST(:emb AS vector))
            ON CONFLICT (external_id) DO UPDATE 
            SET category = EXCLUDED.category,
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                cause = EXCLUDED.cause,
                summary = EXCLUDED.summary,
                embedding = EXCLUDED.embedding
            RETURNING id
        """
        try:
            return await insert_and_return(sql, data)
        except Exception as e:
            print(f"❌ [DB ERROR] {str(e)}")
            raise e

    async def search_accidents(self, vector: List[float], limit: int = 5):
        """[AI] 벡터 유사도 기반 사고 사례 검색"""
        sql = """
            SELECT *, (1 - (embedding <=> :vec::vector)) as similarity
            FROM content_accidents
            ORDER BY embedding <=> :vec::vector
            LIMIT :limit
        """
        return await fetch_all(sql, {"vec": vector, "limit": limit})

    async def get_recent_accidents(self, limit: int = 10):
        """가장 최신 사고 사례 목록 조회"""
        sql = "SELECT * FROM content_accidents ORDER BY occurred_at DESC, id DESC LIMIT :limit"
        return await fetch_all(sql, {"limit": limit})

accident_repo = AccidentRepository()
