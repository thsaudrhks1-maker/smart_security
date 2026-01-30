import asyncio
import sys
import os
import aiohttp
from datetime import datetime

# 프로젝트 루트 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from back.database import AsyncSessionLocal

async def diagnose_issue():
    print("=== 1. DB 직접 조회 (SQLAlchemy) ===")
    async with AsyncSessionLocal() as session:
        # 날짜 확인
        today = datetime.now().strftime("%Y-%m-%d")
        print(f"Server Today: {today}")
        
        # Site 확인
        sites = await session.execute(text("SELECT id, name FROM sites"))
        print(f"Sites: {sites.fetchall()}")
        
        # Plan 확인
        plans = await session.execute(text("SELECT id, date, work_type, status, site_id FROM daily_work_plans"))
        rows = plans.fetchall()
        print(f"Total Plans in DB: {len(rows)}")
        for r in rows:
            print(f" - {r}")
            
    print("\n=== 2. API 호출 테스트 (Localhost) ===")
    try:
        async with aiohttp.ClientSession() as client:
            # Summary API
            async with client.get('http://localhost:8010/dashboard/summary') as resp:
                print(f"GET /dashboard/summary Status: {resp.status}")
                print(f"Response: {await resp.text()}")
                
            # Plans API
            async with client.get('http://localhost:8010/work/plans') as resp:
                print(f"GET /work/plans Status: {resp.status}")
                plans_json = await resp.json()
                print(f"Plans Count: {len(plans_json)}")
    except Exception as e:
        print(f"API Request Failed: {e}")

if __name__ == "__main__":
    asyncio.run(diagnose_issue())
