import asyncio
import os
import sys
from datetime import datetime

# 프로젝트 루트 경로를 파이썬 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt
from sqlalchemy import text, select
from back.database import AsyncSessionLocal, engine, Base

# --- Models Import (Current Verified Models) ---
from back.auth.model import UserModel
from back.company.model import Site, Company, Worker
from back.safety.model import Zone, SafetyLog
from back.work.model import DailyWorkPlan, WorkTemplate, WorkerAllocation

# Password Hasher
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("🧹 Cleaning up existing data...")
        # 역순 삭제 (FK 제약조건 때문)
        await db.execute(text("TRUNCATE TABLE worker_allocations, safety_logs, daily_work_plans, work_templates, zones, workers, companies, sites, users RESTART IDENTITY CASCADE"))
        await db.commit()
        print("✨ Cleaned up!")
        
        print("🌱 Seeding data started...")

        # 1. Site 생성
        site = Site(name="용산 아파트 신축 현장", address="서울시 용산구 어느곳")
        db.add(site)
        await db.flush()

        # 2. Company & Admin User 생성
        company = Company(name="지구방위 건설(주)", trade_type="건축")
        db.add(company)
        await db.flush()

        hashed_pw = hash_password("0000")
        admin_user = UserModel(
            username="admin", 
            hashed_password=hashed_pw, 
            full_name="최고관리사", 
            role="admin"
        )
        db.add(admin_user)
        await db.flush()

        # 3. Zones 생성 (현장 지도 좌표 추가)
        zones = [
            Zone(site_id=site.id, level="1F", name="B구역 용접라인", type="DANGER", lat=37.5663, lng=126.9778),
            Zone(site_id=site.id, level="B1", name="자재 창고", type="NORMAL", lat=37.5668, lng=126.9783)
        ]
        db.add_all(zones)
        await db.flush()

        # 4. Work Templates (가이드라인)
        template = WorkTemplate(
            work_type="용접",
            required_ppe=["용접마스크", "안전장화", "방진마스크"],
            checklist_items=["주변 인화물 제거", "소화기 비치", "수동 소화전 확인"]
        )
        db.add(template)
        await db.flush()

        # 5. Workers 생성
        worker_names = ["김철수", "이영희"]
        workers = []
        for i, name in enumerate(worker_names):
            u = UserModel(username=f"worker{i+1}", hashed_password=hashed_pw, full_name=name, role="worker")
            db.add(u)
            await db.flush()
            
            w = Worker(user_id=u.id, company_id=company.id, name=name, trade="용접공", birth_date="1980-01-01", status="ON_SITE")
            db.add(w)
            workers.append(w)
            await db.flush()

        # 6. Daily Work Plan (금일 작업) - 오늘 날짜
        today_date = datetime.now().strftime("%Y-%m-%d")
        plan = DailyWorkPlan(
            site_id=site.id,
            zone_id=zones[0].id,
            template_id=template.id,
            date=today_date,
            description="소방 배관 용접 및 설치",
            calculated_risk_score=85,
            status="IN_PROGRESS"
        )
        db.add(plan)
        await db.flush()

        # 7. Worker Allocation
        alloc = WorkerAllocation(plan_id=plan.id, worker_id=workers[0].id, role="반장")
        db.add(alloc)

        await db.commit()
        print("🌱 Seeding completed successfully! Login with admin / 0000")

if __name__ == "__main__":
    asyncio.run(seed_data())
