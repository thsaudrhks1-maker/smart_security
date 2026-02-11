import asyncio
import sys
import os
from datetime import datetime, date
import random

# 프로젝트 루트 경로 추가 (모듈 import를 위해)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import AsyncSessionLocal, engine
from back.sys.users.model import sys_users
from back.project.master.model import project_master
from back.project.locations.model import project_zones
from back.content.work_info.model import content_work_info
from back.content.danger_info.model import content_danger_info
from back.daily.task_plans.model import daily_work_plans, daily_worker_users
from back.daily.safety_logs.model import daily_danger_zones
from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError
import bcrypt
# from passlib.context import CryptContext
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    # return pwd_context.hash(password)
    # Passlib 1.7.4 vs Bcrypt 4.0.0+ 호환성 문제 회피: bcrypt 직접 사용
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def create_dummy_data():
    async with AsyncSessionLocal() as db:
        print("🚀 더미 데이터 생성 시작 (오늘 날짜 기준)...")
        
        # 1. 사용자 확인 및 생성 (Worker)
        result = await db.execute(select(sys_users).where(sys_users.username == "worker1"))
        worker = result.scalars().first()
        if not worker:
            worker = sys_users(
                username="worker1",
                hashed_password=hash_password("1234"),
                full_name="홍길동",
                role="worker",
                job_title="철근공",
                phone="010-1234-5678"
            )
            db.add(worker)
            await db.flush()
            print(f"✅ 작업자 생성: {worker.username}")
        else:
            print(f"ℹ️ 작업자 존재: {worker.username}")

        # 2. 프로젝트 확인 (없으면 생성)
        result = await db.execute(select(project_master))
        project = result.scalars().first()
        if not project:
            project = project_master(
                name="스마트 건설 안전 시범 현장",
                code="P-2026-001",
                status="ONGOING",
                start_date=date(2026, 1, 1),
                end_date=date(2026, 12, 31)
            )
            db.add(project)
            await db.flush()
            print(f"✅ 프로젝트 생성: {project.name}")
        else:
            print(f"ℹ️ 프로젝트 사용: {project.name}")

        # 3. 구역(Zone) 확인 (없으면 10x10 생성)
        result = await db.execute(select(project_zones).where(project_zones.project_id == project.id))
        zones = result.scalars().all()
        if not zones:
            print("🔧 구역 데이터 생성 중 (10x10)...")
            new_zones = []
            for r in range(10): # A-J
                for c in range(1, 11): # 1-10
                    zone_name = f"1F-{chr(65+r)}{c}"
                    new_zones.append(project_zones(
                        project_id=project.id,
                        name=zone_name,
                        level="1F",
                        row_index=r,
                        col_index=c-1,
                        zone_type="NORMAL"
                    ))
            db.add_all(new_zones)
            await db.flush()
            zones = new_zones
            print(f"✅ 구역 100개 생성 완료")
        
        # 4. 작업 정보(Content Work Info) 확인
        result = await db.execute(select(content_work_info))
        work_info = result.scalars().first()
        if not work_info:
            work_info = content_work_info(
                work_type="철근 조립 작업",
                base_risk_score=5,
                checklist_items=["안전모 착용", "안전화 착용", "장갑 착용"]
            )
            db.add(work_info)
            await db.flush()
            print(f"✅ 작업 정보 생성: {work_info.work_type}")

        # 5. 위험 정보(Content Danger Info) 확인
        result = await db.execute(select(content_danger_info))
        danger_info = result.scalars().first()
        if not danger_info:
            danger_info = content_danger_info(
                danger_type="추락 위험",
                description="개구부 덮개 미설치로 인한 추락 위험",
                risk_level=5,
                icon="fall"
            )
            db.add(danger_info)
            await db.flush()
            print(f"✅ 위험 정보 생성: {danger_info.danger_type}")

        # === 기존 오늘 날짜 데이터 삭제 (중복 방지) ===
        today = date.today()
        print(f"🧹 오늘({today})의 기존 계획/위험 데이터 정리 중...")
        await db.execute(delete(daily_work_plans).where(daily_work_plans.date == today))
        await db.execute(delete(daily_danger_zones).where(daily_danger_zones.date == today))
        await db.flush()

        # 6. 오늘 작업 계획 생성 (5개 랜덤)
        print("📅 오늘 작업 계획 생성 중...")
        for _ in range(5):
            target_zone = random.choice(zones)
            plan = daily_work_plans(
                project_id=project.id,
                zone_id=target_zone.id,
                work_info_id=work_info.id,
                date=today,
                description=f"{target_zone.name} 구역 철근 조립 및 배근 작업",
                calculated_risk_score=random.randint(1, 10),
                status="APPROVED" # 승인된 상태여야 보임
            )
            db.add(plan)
            await db.flush()
            
            # 작업자 할당
            mapping = daily_worker_users(
                plan_id=plan.id,
                worker_id=worker.id
            )
            db.add(mapping)
        print("✅ 작업 계획 5건 생성 완료")

        # 7. 오늘 위험 구역 생성 (3개 랜덤)
        print("⚠️ 오늘 위험 구역 생성 중...")
        danger_zones_sample = random.sample(zones, 3)
        for z in danger_zones_sample:
            danger = daily_danger_zones(
                zone_id=z.id,
                danger_info_id=danger_info.id,
                date=today,
                description=f"{z.name} 구역 바닥 개구부 추락 주의",
                status="APPROVED", # 승인됨
                reporter_id=worker.id
            )
            db.add(danger)
        print("✅ 위험 구역 3건 생성 완료")

        await db.commit()
        print("🎉 모든 더미 데이터 생성 완료!")

if __name__ == "__main__":
    asyncio.run(create_dummy_data())
