
import asyncio
import sys, os

# 프로젝트 루트 경로 추가 (back 모듈 import를 위해)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from back.database import engine, Base
from sqlalchemy import text

# **중요** 새로운 모델들을 import해야 create_all이 테이블을 인식함
from back.database import * # database.py가 모든 모델(device_beacons 등)을 참조하고 있음

async def migrate_tracking_tables():
    print("🚧 [마이그레이션] 위치 추적 테이블 추가 및 sys_emergency_alerts 삭제 중...")
    
    async with engine.begin() as conn:
        # 1. 불필요한 테이블(sys_emergency_alerts) 제거
        print("   - sys_emergency_alerts 삭제 (SQL)...")
        try:
            # SQLAlchemy 모델 레벨에선 이미 지웠으므로 SQL로 강제 Drop
            await conn.execute(text("DROP TABLE IF EXISTS emergency_alerts CASCADE"))
            await conn.execute(text("DROP TABLE IF EXISTS sys_emergency_alerts CASCADE")) 
        except Exception as e:
            print(f"⚠️ 테이블 삭제 중 오류 (무시 가능): {e}")

        # 2. 새로운 테이블 추가 (Base.metadata.create_all 사용 시 없는 테이블만 생성됨)
        # device_beacons, daily_worker_locations
        print("   - 신규 테이블(Worker Location, Device Beacons) 생성 Check...")
        await conn.run_sync(Base.metadata.create_all)
        
    print("✅ 마이그레이션 완료 (기존 데이터 보존됨)")

if __name__ == "__main__":
    asyncio.run(migrate_tracking_tables())
