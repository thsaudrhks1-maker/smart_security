import asyncio
import os
import sys

# 프로젝트 루트 경로 추가
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from passlib.context import CryptContext

from back.database import Base
from back.login.model import UserModel
from back.company.model import Site, Company, Worker, Site
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation
from back.safety.model import Zone

# 환경 변수 로드
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL is missing!")
    sys.exit(1)

# 비밀번호 해시 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_data():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        print("🌱 Seeding Safe-On Lite Data...")

        # 1. Users (Admin/Safety Manager)
        manager = UserModel(
            username="admin",
            hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWrn3ILAWOi/KkS8.Z.2D1m.1/j2.i", # "secret"
            full_name="김안전",
            role="manager"
        )
        session.add(manager)
        await session.flush() # ID 생성을 위해 flush

        # 2. Site
        site = Site(
            name="강남 데이터센터 리모델링 현장",
            address="서울시 강남구 테헤란로 123",
            safety_manager_id=manager.id
        )
        session.add(site)
        await session.flush()

        # 3. Companies & Workers
        co1 = Company(name="태영건설", trade_type="골조/철근")
        co2 = Company(name="일렉스", trade_type="전기/설비")
        session.add_all([co1, co2])
        await session.flush()

        workers = [
            Worker(name="이철수", company_id=co1.id, trade="철근공", qualification_tags="비계기능사,신호수", status="ON_SITE"),
            Worker(name="박영희", company_id=co1.id, trade="형틀목공", qualification_tags="", status="ON_SITE"),
            Worker(name="정민수", company_id=co2.id, trade="전기공", qualification_tags="고소작업", status="ON_SITE"),
            Worker(name="최경석", company_id=co2.id, trade="용접공", qualification_tags="용접기능사,화기감시", status="RESTRICTED"),
            Worker(name="김반장", company_id=co1.id, trade="작업반장", qualification_tags="안전관리자", status="ON_SITE"),
        ]
        session.add_all(workers)
        await session.flush()

        # 4. Zones (도면 없이 층/구역으로 구분)
        zones = [
            Zone(site_id=site.id, level="1F", name="A구역 (자재반입구)", type="OUTDOOR", lat=37.5665, lng=126.9780),
            Zone(site_id=site.id, level="1F", name="B구역 (로비)", type="INDOOR", lat=37.5666, lng=126.9782),
            Zone(site_id=site.id, level="B1", name="기계실/전기실", type="PIT", lat=37.5664, lng=126.9779),
            Zone(site_id=site.id, level="RF", name="옥상 공조실", type="ROOF", lat=37.5667, lng=126.9781),
        ]
        session.add_all(zones)
        await session.flush()

        # 5. Work Templates (라이브러리)
        templates = [
            WorkTemplate(
                work_type="고소 작업",
                base_risk_score=20,
                required_ppe=["안전모", "안전대", "안전화"],
                checklist_items=["안전대 체결 확인", "비계 고정 상태 확인", "하부 통제 실시"],
                required_qualifications=["고소작업"]
            ),
            WorkTemplate(
                work_type="용접/절단",
                base_risk_score=25,
                required_ppe=["용접가면", "가죽장갑", "앞치마"],
                checklist_items=["소화기 비치", "불티 비산 방지망", "가연물 제거"],
                required_qualifications=["화기감시자"]
            ),
            WorkTemplate(
                work_type="양중/인양",
                base_risk_score=30,
                required_ppe=["안전모", "안전화"],
                checklist_items=["줄걸이 상태 확인", "신호수 배치", "작업반경 통제"],
                required_qualifications=["신호수"]
            ),
            WorkTemplate(
                work_type="배관 설치",
                base_risk_score=10,
                required_ppe=["안전모", "안전장갑"],
                checklist_items=["공구 점검", "자재 정리정돈"],
                required_qualifications=[]
            ),
        ]
        session.add_all(templates)
        await session.flush()

        # 6. Daily Work Plan (오늘의 작업)
        today = "2026-01-30" # 예시 날짜
        
        plan1 = DailyWorkPlan(
            site_id=site.id,
            zone_id=zones[2].id, # B1 기계실
            template_id=templates[1].id, # 용접
            date=today,
            description="B1 기계실 배관 용접 작업",
            equipment_flags=["WELDING_MACHINE"],
            calculated_risk_score=55, # (기본25 + 밀폐20 + 장비10)
            status="IN_PROGRESS"
        )
        
        plan2 = DailyWorkPlan(
            site_id=site.id,
            zone_id=zones[3].id, # 옥상
            template_id=templates[0].id, # 고소
            date=today,
            description="옥상 휀 설치 작업",
            equipment_flags=["CRANE"],
            calculated_risk_score=45, # (기본20 + 고소15 + 크레인10)
            status="PLANNED"
        )

        session.add_all([plan1, plan2])
        await session.flush()

        # 작업자 할당
        allocations = [
            WorkerAllocation(plan_id=plan1.id, worker_id=workers[3].id, role="용접공"), # 최경석
            WorkerAllocation(plan_id=plan1.id, worker_id=workers[4].id, role="화기감시"), # 김반장
            WorkerAllocation(plan_id=plan2.id, worker_id=workers[0].id, role="작업자"), # 이철수
            WorkerAllocation(plan_id=plan2.id, worker_id=workers[1].id, role="보조"),   # 박영희
        ]
        session.add_all(allocations)

        await session.commit()
        print("✅ Seeding Complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
