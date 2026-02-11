
import asyncio
from back.database import execute

async def init_accidents_table():
    print("🚀 [DB] content_accidents 테이블 재성성 시작...")
    
    try:
        # 1. pgvector 확장 활성화
        await execute("CREATE EXTENSION IF NOT EXISTS vector;")
        
        # 2. 기존 테이블 삭제 (완전 초기화)
        await execute("DROP TABLE IF EXISTS content_accidents CASCADE;")
        
        # 3. 테이블 생성 (768차원 벡터 명시)
        create_sql = """
        CREATE TABLE content_accidents (
            id SERIAL PRIMARY KEY,
            data_source VARCHAR NOT NULL,
            external_id VARCHAR UNIQUE,
            category VARCHAR,
            title VARCHAR NOT NULL,
            description TEXT,
            cause TEXT,
            location VARCHAR,
            occurred_at DATE,
            summary TEXT,
            embedding vector(768),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        await execute(create_sql)
        print("✅ content_accidents 테이블 (768차원) 생성 완료!")
        
    except Exception as e:
        print(f"❌ 테이블 생성 중 오류 발생: {e}")

if __name__ == "__main__":
    asyncio.run(init_accidents_table())
