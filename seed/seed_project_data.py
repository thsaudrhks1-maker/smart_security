import asyncio
import os
import sys
from datetime import datetime, timedelta

# 프로젝트 루트 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt
from sqlalchemy import text
from back.database import AsyncSessionLocal
from back.auth.model import UserModel
from back.project.model import Project
from back.company.model import Site, Company, Worker
from back.safety.model import Zone
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation

# 비밀번호 해싱 헬퍼
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

async def seed_project_data():
    async with AsyncSessionLocal() as db:
        print("🧹 기존 데이터 정리 중 (TRUNCATE)...")
        # 모든 테이블 초기화 (순서 중요)
        try:
            await db.execute(text("TRUNCATE TABLE worker_allocations, daily_work_plans, daily_danger_zones, safety_logs, work_templates, zones, workers, companies, sites, projects, users RESTART IDENTITY CASCADE"))
            await db.commit()
            print("✨ 데이터 초기화 완료!")
        except Exception as e:
            print(f"⚠️ 초기화 중 경고 (테이블이 없을 수 있음): {e}")
            await db.rollback()

        print("🌱 프로젝트 중심 더미 데이터 생성 시작...")
        hashed_pw = hash_password("0000")

        # ---------------------------------------------------------
        # 1. 관리자 및 공통 계정 생성
        # ---------------------------------------------------------
        admin_user = UserModel(username="admin", hashed_password=hashed_pw, full_name="통합관리자", role="manager")
        safety_user = UserModel(username="safety", hashed_password=hashed_pw, full_name="박안전", role="safety_manager")
        db.add_all([admin_user, safety_user])
        await db.flush()

        # ---------------------------------------------------------
        # 2. 프로젝트 A: 강남 스마트 아파트 (Active) - 데이터 풍부함
        # ---------------------------------------------------------
        project_a = Project(
            name="강남 스마트 아파트 신축공사",
            location_address="서울시 강남구 역삼동 123-45",
            location_lat=37.4979,
            location_lng=127.0276,
            client_company="대한건설",
            constructor_company="스마트건설(주)",
            project_type="신축(주거)",
            budget_amount=560000000, # 5.6억 (Integer 범위 고려)
            start_date=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
            end_date=(datetime.now() + timedelta(days=300)).strftime("%Y-%m-%d"),
            manager_id=admin_user.id,
            safety_manager_id=safety_user.id,
            status="ACTIVE"
        )
        db.add(project_a)
        await db.flush()

        # 2-1. 현장 (Sites)
        site_a1 = Site(project_id=project_a.id, name="101동", address="정문 좌측")
        site_a2 = Site(project_id=project_a.id, name="지하주차장", address="B1-B2 구간")
        db.add_all([site_a1, site_a2])
        await db.flush()

        # 2-2. 협력사 (Companies)
        comp_a1 = Company(project_id=project_a.id, name="튼튼구조(주)", trade_type="철근/콘크리트")
        comp_a2 = Company(project_id=project_a.id, name="번개전력", trade_type="전기/설비")
        db.add_all([comp_a1, comp_a2])
        await db.flush()

        # 2-3. 작업자 (Workers) & User 계정
        workers_data = [
            ("김철수", "반장", comp_a1),
            ("이영희", "용접공", comp_a1),
            ("박민수", "전공", comp_a2),
            ("최성실", "보조", comp_a2),
            ("정안전", "신호수", comp_a1)
        ]
        
        created_workers = []
        for name, trade, comp in workers_data:
            u = UserModel(username=f"worker_{name}", hashed_password=hashed_pw, full_name=name, role="worker")
            db.add(u)
            await db.flush()
            
            w = Worker(
                user_id=u.id, 
                project_id=project_a.id, 
                company_id=comp.id, 
                name=name, 
                trade=trade, 
                status="ON_SITE"
            )
            db.add(w)
            created_workers.append(w)
        
        await db.flush()

        # 2-4. 공정 템플릿
        tpl_concrete = WorkTemplate(work_type="콘크리트 타설", required_ppe=["안전모", "장화"], checklist_items=["거푸집 동바리 확인", "신호수 배치"])
        tpl_electric = WorkTemplate(work_type="배선 작업", required_ppe=["절연장갑"], checklist_items=["전원 차단 확인", "접지 확인"])
        db.add_all([tpl_concrete, tpl_electric])
        await db.flush()

        # 2-5. 구역 (Zones)
        zone_1f = Zone(site_id=site_a1.id, name="1층 로비", type="NORMAL", level="1F")
        zone_roof = Zone(site_id=site_a1.id, name="옥상", type="DANGER", level="ROOF")
        db.add_all([zone_1f, zone_roof])
        await db.flush()

        # 2-6. 일일 작업 (Work Plans)
        plan_day = DailyWorkPlan(
            site_id=site_a1.id,
            zone_id=zone_1f.id,
            template_id=tpl_concrete.id,
            date=datetime.now().strftime("%Y-%m-%d"),
            description="101동 1층 바닥 콘크리트 타설",
            calculated_risk_score=75,
            status="IN_PROGRESS"
        )
        db.add(plan_day)
        await db.flush()

        # 작업자 배정
        db.add(WorkerAllocation(plan_id=plan_day.id, worker_id=created_workers[0].id, role="작업지휘")) # 김철수
        db.add(WorkerAllocation(plan_id=plan_day.id, worker_id=created_workers[1].id, role="작업원")) # 이영희

        # ---------------------------------------------------------
        # 3. 프로젝트 B: 판교 오피스 타워 (Planned) - 기본 정보만
        # ---------------------------------------------------------
        project_b = Project(
            name="판교 오피스 타워 리모델링",
            location_address="경기도 성남시 분당구 판교역로 1",
            location_lat=37.3947,
            location_lng=127.1112,
            client_company="네오테크",
            constructor_company="미래건설",
            project_type="리모델링",
            budget_amount=2000000000, # 20억
            start_date=(datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d"),
            end_date=(datetime.now() + timedelta(days=150)).strftime("%Y-%m-%d"),
            status="PLANNED"
        )
        db.add(project_b)
        
        await db.commit()
        print("✅ 더미 데이터 생성 완료!")
        print(f"👉 Project A: {project_a.name} (ID: {project_a.id}) - 작업자 5명, 현장 2개")
        print(f"👉 Project B: {project_b.name} (ID: {project_b.id}) - 초기 상태")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_project_data())
