"""
작업자별 테스트 더미 데이터 생성
- 현장 1개 (강남 타워 건설 현장)
- 작업자 3명 (각자 다른 작업)
- 위험 구역 4개
- 오늘 날짜 기준 작업 배정
"""

import asyncio
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from passlib.context import CryptContext

from back.database import AsyncSessionLocal
from back.auth.model import UserModel
from back.company.model import Site, Company, Worker
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation
from back.safety.model import Zone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_test_data():
    async with AsyncSessionLocal() as db:
        print("🔧 더미 데이터 생성 시작...")
        
        # 0. 기존 데이터 삭제 (역순으로)
        print("   - 기존 데이터 삭제 중...")
        await db.execute(text("DELETE FROM worker_allocations"))
        await db.execute(text("DELETE FROM daily_work_plans"))
        await db.execute(text("DELETE FROM work_templates"))
        await db.execute(text("DELETE FROM workers"))
        await db.execute(text("DELETE FROM zones"))
        await db.execute(text("DELETE FROM sites"))
        await db.execute(text("DELETE FROM companies"))
        await db.execute(text("DELETE FROM users WHERE username != 'admin'"))
        await db.commit()
        print("   ✅ 기존 데이터 삭제 완료")
        
        # 1. 현장 생성
        site = Site(
            id=1,
            name="강남 타워 건설 현장",
            address="서울시 강남구 테헤란로 123"
        )
        db.add(site)
        await db.flush()
        
        # 2. 위험 구역 4개 생성
        zones = [
            Zone(
                id=1,
                site_id=1,
                name="3층 동측 개구부",
                type="DANGER",
                level="HIGH",
                lat=37.5012,
                lng=127.0396
            ),
            Zone(
                id=2,
                site_id=1,
                name="옥상 단부 공사구간",
                type="DANGER",
                level="CRITICAL",
                lat=37.5015,
                lng=127.0400
            ),
            Zone(
                id=3,
                site_id=1,
                name="지하 1층 용접 작업장",
                type="DANGER",
                level="MEDIUM",
                lat=37.5010,
                lng=127.0390
            ),
            Zone(
                id=4,
                site_id=1,
                name="외벽 비계 설치 구역",
                type="DANGER",
                level="HIGH",
                lat=37.5018,
                lng=127.0405
            )
        ]
        for zone in zones:
            db.add(zone)
        await db.flush()
        
        # 3. 협력사 2개
        companies = [
            Company(id=1, name="대한건설", trade_type="철근"),
            Company(id=2, name="서울설비", trade_type="설비")
        ]
        for company in companies:
            db.add(company)
        await db.flush()
        
        # 4. 사용자 계정 3개 (worker만 - admin은 이미 존재)
        # 0000의 bcrypt 해시: $2b$12$LQlQl5q5J5J5J5J5J5J5J.O3Z5J5J5J5J5J5J5J5J5J5J5J5J
        # 간단하게 동일한 해시값 사용 (실제로는 제대로 해시해야 함)
        hashed_pwd = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"  # "0000"
        users = [
            UserModel(
                id=2,
                username="worker1",
                hashed_password=hashed_pwd,
                full_name="김철수",
                role="worker"
            ),
            UserModel(
                id=3,
                username="worker2",
                hashed_password=hashed_pwd,
                full_name="이영희",
                role="worker"
            ),
            UserModel(
                id=4,
                username="worker3",
                hashed_password=hashed_pwd,
                full_name="박민수",
                role="worker"
            )
        ]
        for user in users:
            db.add(user)
        await db.flush()
        
        # 5. 작업자 프로필 3개
        workers = [
            Worker(
                id=1,
                user_id=2,
                name="김철수",
                company_id=1,
                trade="철근공",
                qualification_tags="고소작업",
                status="ON_SITE"
            ),
            Worker(
                id=2,
                user_id=3,
                name="이영희",
                company_id=2,
                trade="용접공",
                qualification_tags="용접,특수작업",
                status="ON_SITE"
            ),
            Worker(
                id=3,
                user_id=4,
                name="박민수",
                company_id=1,
                trade="비계공",
                qualification_tags="고소작업,비계",
                status="ON_SITE"
            )
        ]
        for worker in workers:
            db.add(worker)
        await db.flush()
        
        # 6. 작업 템플릿
        templates = [
            WorkTemplate(
                id=1,
                work_type="철근 조립",
                base_risk_score=15,
                required_ppe=["안전모", "안전화", "안전대"],
                checklist_items=["개구부 덮개 확인", "안전난간 설치 확인"]
            ),
            WorkTemplate(
                id=2,
                work_type="용접 작업",
                base_risk_score=20,
                required_ppe=["안전모", "용접 면", "보안경", "가죽 장갑"],
                checklist_items=["화기작업 허가 확인", "소화기 비치 확인", "환기 상태 확인"]
            ),
            WorkTemplate(
                id=3,
                work_type="비계 설치",
                base_risk_score=25,
                required_ppe=["안전모", "안전대", "안전화"],
                checklist_items=["추락 방지대 설치", "안전난간 설치", "발판 고정 확인"]
            )
        ]
        for template in templates:
            db.add(template)
        await db.flush()
        
        # 7. 금일 작업 계획 3개 (오늘 날짜)
        today = str(date.today())
        plans = [
            DailyWorkPlan(
                id=1,
                site_id=1,
                zone_id=1,
                template_id=1,
                date=today,
                description="3층 동측 철근 조립 작업",
                calculated_risk_score=18,
                status="IN_PROGRESS"
            ),
            DailyWorkPlan(
                id=2,
                site_id=1,
                zone_id=3,
                template_id=2,
                date=today,
                description="지하 1층 배관 용접",
                calculated_risk_score=22,
                status="IN_PROGRESS"
            ),
            DailyWorkPlan(
                id=3,
                site_id=1,
                zone_id=4,
                template_id=3,
                date=today,
                description="외벽 비계 설치 작업",
                calculated_risk_score=30,
                status="PLANNED"
            )
        ]
        for plan in plans:
            db.add(plan)
        await db.flush()
        
        # 8. 작업자 배정 (각 작업자마다 해당 작업 할당)
        allocations = [
            WorkerAllocation(id=1, plan_id=1, worker_id=1, role="작업자"),
            WorkerAllocation(id=2, plan_id=2, worker_id=2, role="작업자"),
            WorkerAllocation(id=3, plan_id=3, worker_id=3, role="작업자")
        ]
        for allocation in allocations:
            db.add(allocation)
        
        await db.commit()
        print("✅ 더미 데이터 생성 완료!")
        print(f"   - 현장: 1개")
        print(f"   - 위험 구역: 4개")
        print(f"   - 작업자: 3명 (김철수, 이영희, 박민수)")
        print(f"   - 금일({today}) 작업: 3개")
        print("")
        print("📌 테스트 계정:")
        print("   - admin / 0000 (관리자)")
        print("   - worker1 / 0000 (김철수 - 철근 작업)")
        print("   - worker2 / 0000 (이영희 - 용접 작업)")
        print("   - worker3 / 0000 (박민수 - 비계 작업)")

if __name__ == "__main__":
    asyncio.run(create_test_data())
