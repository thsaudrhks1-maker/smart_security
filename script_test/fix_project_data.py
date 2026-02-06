
import asyncio
import os
import sys
from sqlalchemy import text

# 프로젝트 루트를 path에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import engine, Base, execute

async def force_sync_projects():
    print("🚀 프로젝트 데이터 강제 동기화 시작...")
    
    async with engine.begin() as conn:
        # 1. 기존 프로젝트 삭제 (깨끗한 상태를 위해)
        await conn.execute(text("TRUNCATE TABLE project_master RESTART IDENTITY CASCADE"))
        
        # 2. 신규 프로젝트 삽입
        sql = """
            INSERT INTO project_master (name, location_address, start_date, end_date, status)
            VALUES ('스마트 시큐리티 통합 관제 센터', '서울시 강남구 테헤란로 123', '2026-02-06', '2026-08-06', 'ACTIVE')
        """
        await conn.execute(text(sql))
        print("✅ 프로젝트 '스마트 시큐리티 통합 관제 센터' 생성 완료 (ID: 1)")

if __name__ == "__main__":
    asyncio.run(force_sync_projects())
