
import asyncio
from back.database import engine, Base
from scripts.seed_all import seed_all_data

# **중요** 모든 모델을 import해야 Base.metadata가 테이블을 인식함
from back.database import * # database.py 안에서 모든 모델을 import 하고 있음

async def reset_database():
    print("🚀 데이터베이스 초기화(Drop & Create) 시작...")
    
    async with engine.begin() as conn:
        print("   - 모든 테이블 삭제 중...")
        await conn.run_sync(Base.metadata.drop_all)
        print("   - 모든 테이블 생성 중...")
        await conn.run_sync(Base.metadata.create_all)
        
    print("✅ 테이블 재생성 완료")

async def main():
    await reset_database()
    await seed_all_data()

if __name__ == "__main__":
    asyncio.run(main())
