
import asyncio
from back.database import engine, execute

async def init_accidents_table():
    print("🚀 [DB] content_accidents 테이블 생성 중...")
    
    # 1. 테이블 생성 (SQL 직접 실행이 가장 확실함)
    create_sql = """
    CREATE TABLE IF NOT EXISTS content_accidents (
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
        embedding JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    try:
        await execute(create_sql)
        print("✅ 테이블 생성 완료!")
        
        # 2. pgvector 익스텐션 및 벡터 타입 변환 (있으면 수행)
        print("🔍 [DB] 벡터 타입 변환 시도...")
        try:
            await execute("CREATE EXTENSION IF NOT EXISTS vector;")
            await execute("ALTER TABLE content_accidents ALTER COLUMN embedding TYPE vector(768) USING embedding::vector(768);")
            print("✅ 벡터(768) 타입 적용 완료!")
        except Exception as ve:
            print(f"⚠️ 벡터 타입 변환 건너뜀 (pgvector 미지원 가능성): {ve}")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    asyncio.run(init_accidents_table())
