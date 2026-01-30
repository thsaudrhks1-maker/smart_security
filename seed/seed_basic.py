import asyncio
import sys
import os

# 프로젝트 루트 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from back.database import AsyncSessionLocal

async def seed_basic_data():
    zones = [
        {"name": "101동 1F", "type": "INDOOR", "site_id": 1},
        {"name": "101동 2F", "type": "INDOOR", "site_id": 1},
        {"name": "101동 옥상", "type": "ROOF", "site_id": 1},
        {"name": "지하 주차장", "type": "PIT", "site_id": 1},
        {"name": "외부 자재 야적장", "type": "OUTDOOR", "site_id": 1},
    ]

    workers = [
        {"name": "김반장", "role": "manager", "company": "현대건설", "trade": "관리"},
        {"name": "박철근", "role": "worker", "company": "대성철근", "trade": "철근"},
        {"name": "이용접", "role": "worker", "company": "제일설비", "trade": "용접"},
        {"name": "최비계", "role": "worker", "company": "안전비계", "trade": "비계"},
        {"name": "정목수", "role": "worker", "company": "형틀목공", "trade": "형틀"},
    ]

    async with AsyncSessionLocal() as session:
        print("🌱 Seeding Zones & Workers...")
        
        # 1. Sites (기본 현장 없으면 생성)
        await session.execute(text("""
            INSERT INTO sites (id, name, address) 
            VALUES (1, '스마트 아파트 건설현장', '서울시 강남구')
            ON CONFLICT (id) DO NOTHING
        """))
        
        # 2. Zones
        await session.execute(text("TRUNCATE TABLE zones RESTART IDENTITY CASCADE"))
        for z in zones:
            await session.execute(text("""
                INSERT INTO zones (name, type, site_id) VALUES (:name, :type, :site_id)
            """), z)
            
        # 3. Workers
        await session.execute(text("TRUNCATE TABLE workers RESTART IDENTITY CASCADE"))
        for w in workers:
            await session.execute(text("""
                INSERT INTO workers (name, phone_number, company_name, trade, created_at)
                VALUES (:name, '010-0000-0000', :company, :trade, now())
            """), w)
            
        await session.commit()
        print("✅ Seed Data Inserted.")

if __name__ == "__main__":
    asyncio.run(seed_basic_data())
