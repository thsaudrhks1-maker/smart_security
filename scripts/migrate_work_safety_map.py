
import asyncio
from back.database import engine
from sqlalchemy import text

async def create_mapping_table():
    print("Creating content_work_safety_map table...")
    async with engine.begin() as conn:
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS content_work_safety_map (
                id SERIAL PRIMARY KEY,
                work_info_id INTEGER NOT NULL REFERENCES content_work_info(id) ON DELETE CASCADE,
                safety_info_id INTEGER NOT NULL REFERENCES content_safety_info(id) ON DELETE CASCADE,
                UNIQUE(work_info_id, safety_info_id)
            );
        """))
    print("Table created.")

async def insert_mappings():
    print("Inserting mappings...")
    
    # 작업명 -> 안전 항목 Category 키 매핑
    # 실제 ID는 DB 조회해야 알 수 있으므로 서브쿼리 사용
    mappings = {
        "거푸집 설치 및 해체": ["추락", "붕괴"],
        "고소작업 (3m 이상)": ["고소작업", "추락", "낙하물"],
        "용접 및 절단작업": ["화재", "고소작업", "감전"], # 용접 시 주로 고소, 화재 위험
        "중장비 운용": ["중장비", "협착", "충돌"],
        "전기배선 작업": ["감전", "화재"],
        "배관 설치": ["밀폐공간", "협착"],     
        "내장 마감": ["유해물질", "화재"]
    }
    
    async with engine.begin() as conn:
        # 기존 매핑 삭제 (초기화)
        await conn.execute(text("DELETE FROM content_work_safety_map"))
        
        for work_type, safety_categories in mappings.items():
            for cat in safety_categories:
                # 서브쿼리로 ID 찾아서 삽입 (이름이 유사하면 매핑)
                query = text("""
                    INSERT INTO content_work_safety_map (work_info_id, safety_info_id)
                    SELECT w.id, s.id
                    FROM content_work_info w, content_safety_info s
                    WHERE w.work_type = :w_type 
                    AND (s.category LIKE :s_cat OR s.title LIKE :s_cat)
                    ON CONFLICT DO NOTHING
                """)
                # LIKE 검색으로 유연하게 매핑 ("추락" -> "추락 방지")
                await conn.execute(query, {"w_type": work_type, "s_cat": f"%{cat}%"})
                
        print("Mappings inserted.")

async def main():
    await create_mapping_table()
    await insert_mappings()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
