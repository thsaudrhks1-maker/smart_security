import asyncio
import sys
import os

# 현재 경로를 sys.path에 추가 (모듈 인식을 위해)
sys.path.append(os.getcwd())

from back.database import AsyncSessionLocal
from sqlalchemy import text

async def check_data():
    print("🔍 DB 데이터 검증 시작...")
    async with AsyncSessionLocal() as db:
        # DB 연결 정보 확인
        print(f"Connected to: {db.bind.url}")
        
        # 데이터 조회
        result = await db.execute(text("SELECT id, zone_id, date, risk_type, description FROM daily_danger_zones"))
        rows = result.mappings().all()
        
        print(f"\n✅ 'daily_danger_zones' 테이블 조회 결과: 총 {len(rows)}건")
        print("-" * 60)
        if not rows:
            print("❌ 데이터가 없습니다!")
        else:
            for row in rows:
                print(f"[{row['id']}] {row['date']} | Zone {row['zone_id']} | {row['risk_type']} | {row['description']}")
        print("-" * 60)

if __name__ == "__main__":
    asyncio.run(check_data())
