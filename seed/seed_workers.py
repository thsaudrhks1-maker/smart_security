import asyncio
import sys
import os
import random

# 프로젝트 루트 경로를 sys.path에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, select
from back.database import AsyncSessionLocal, engine, Base
from back.company.model import Worker, Company

async def seed_workers():
    # 1. 스키마 업데이트를 위해 테이블 재생성 (개발용 강제 초기화)
    # 주의: 운영 환경에서는 절대 금지. Alembic을 써야 함.
    async with engine.begin() as conn:
        print("🔥 Dropping old tables (workers, companies)...")
        # 의존성 때문에 자식부터 삭제
        try:
            await conn.execute(text("DROP TABLE IF EXISTS worker_allocations CASCADE"))
            await conn.execute(text("DROP TABLE IF EXISTS workers CASCADE"))
            await conn.execute(text("DROP TABLE IF EXISTS companies CASCADE"))
        except Exception as e:
            print(f"⚠️ Drop error (ignored): {e}")

        print("🏗️ Creating new tables...")
        # Base.metadata.create_all은 동기 엔진용이므로 run_sync 사용
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        print("🌱 Seeding Companies & Workers...")

        # 1. Company 생성
        companies = [
            Company(name="삼성물산", trade_type="원청"),
            Company(name="대성설비", trade_type="설비"),
            Company(name="한일전기", trade_type="전기"),
            Company(name="강남건설", trade_type="골조"),
        ]
        
        db.add_all(companies)
        await db.commit()
        print("✅ Companies created.")
        
        # ID 조회를 위해 다시 로드 (방금 넣은 순서대로 1,2,3,4 가정)
        # 안전하게 이름으로 ID 맵핑
        company_rows = await db.execute(select(Company))
        company_map = {c.name: c.id for c in company_rows.scalars().all()}
        
        # 2. Worker 생성 (더미 데이터)
        first_names = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"]
        last_names = ["민수", "철수", "영희", "길동", "준호", "서준", "하준", "도윤", "예준", "지호"]
        addresses = ["서울 강남구", "경기 성남시", "서울 영등포구", "인천 연수구", "경기 수원시"]
        trades = ["용접공", "배관공", "전기공", "철근공", "안전감시단"]
        comp_names = ["삼성물산", "대성설비", "한일전기", "강남건설"]
        
        workers = []
        for i in range(20): 
            name = f"{random.choice(first_names)}{random.choice(last_names)}"
            phone = f"010-{random.randint(2000, 9999)}-{random.randint(1000, 9999)}"
            birth_year = random.randint(1965, 2000)
            birth = f"{birth_year}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            
            c_name = random.choice(comp_names)
            cid = company_map.get(c_name)
            
            workers.append(Worker(
                name=name,
                company_id=cid,
                trade=random.choice(trades),
                phone_number=phone,
                birth_date=birth,
                address=random.choice(addresses),
                status="OFF_SITE"
            ))
            
        db.add_all(workers)
        await db.commit()
        
        print("✅ 20 Workers seeded successfully with detailed info.")

if __name__ == "__main__":
    asyncio.run(seed_workers())
