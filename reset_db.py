
import asyncio
from datetime import datetime, date
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt

from back.database import engine, Base

# Import Models
from back.auth.model import User
from back.company.model import Company, Site, ProjectParticipant
from back.project.model import Project, ProjectMember
from back.safety.model import Zone
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation # Allocation 등

async def reset_db():
    async with engine.begin() as conn:
        print("🔥 FORCE Dropping tables with CASCADE...")
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        
        print("🏗️ Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)

    # Session for Seeding
    AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        print("🌱 Seeding Full Data Set...")
        try:
            # 0. PW Hash
            pw_hash = bcrypt.hashpw("0000".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            # 1. Company (원청/협력사)
            comp_main = Company(name="스마트건설(주)", type="GENERAL", trade_type="종합건설")
            comp_sub = Company(name="번개전기(주)", type="SPECIALTY", trade_type="전기공사")
            db.add_all([comp_main, comp_sub])
            await db.flush()

            # 2. Users (a, m, w)
            # - Admin
            admin = User(username="a", hashed_password=pw_hash, full_name="관리자", role="admin")
            # - Manager (원청 소속)
            manager = User(
                username="m", hashed_password=pw_hash, full_name="김소장", role="manager",
                company_id=comp_main.id, title="현장소장", phone="010-1234-5678"
            )
            # - Worker (협력사 소속)
            worker = User(
                username="w", hashed_password=pw_hash, full_name="이반장", role="worker",
                company_id=comp_sub.id, job_type="전기공", title="반장", phone="010-9876-5432", birth_date="800101"
            )
            db.add_all([admin, manager, worker])
            await db.flush()

            # 3. Project
            today_str = date.today().isoformat()
            # 3. Project
            today_str = date.today() # Date 타입에 맞게 date 객체 사용 (또는 문자열도 보통 됨)
            project = Project(
                name="강남 스마트 오피스 신축공사",
                code="P2026-001",
                start_date=date(2026, 1, 1),
                end_date=date(2026, 12, 31),
                status="ACTIVE",
                location_address="서울시 강남구 역삼동 123-45",
                description="지상 20층/지하 5층 오피스 신축",
                # manager_name="김소장", # 삭제
                client_company="테크그룹",
                constructor_company="스마트건설",
                project_type="건축/신축"
                # current_stage="골조공사" # 삭제
            )
            db.add(project)
            await db.flush()

            # 4. Project Participants (회사-프로젝트 관계) & Members (사람-프로젝트 관계)
            # - 참여 기업
            pp_main = ProjectParticipant(project_id=project.id, company_id=comp_main.id, role="CONSTRUCTOR") # 시공사
            pp_sub = ProjectParticipant(project_id=project.id, company_id=comp_sub.id, role="PARTNER") # 협력사
            db.add_all([pp_main, pp_sub])

            # - 프로젝트 멤버
            # 김소장: ACTIVE
            pm_manager = ProjectMember(project_id=project.id, user_id=manager.id, role_name="현장소장", status="ACTIVE")
            # 이반장: PENDING (승인 대기 테스트용) -> 아니면 ACTIVE로 해서 바로 출근가능하게?
            # -> 사용자 요청: "자동 승인" 테스트 하려면 PENDING이 맞음. 하지만 "협력사 등록"부터 하려면 아예 멤버가 없는게 나을수도.
            # -> 일단 PENDING으로 둬서 "승인 대기 목록"에 뜨게 합시다.
            pm_worker = ProjectMember(project_id=project.id, user_id=worker.id, role_name="전기반장", status="PENDING")
            db.add_all([pm_manager, pm_worker])
            await db.flush()

            # 5. Site & Zones
            site = Site(project_id=project.id, name="제1공구 (본관)", address="서울시 강남구 테헤란로", safety_manager_id=manager.id)
            db.add(site)
            await db.flush()

            z1 = Zone(site_id=site.id, name="1F 로비", level="1F", type="INDOOR")
            z2 = Zone(site_id=site.id, name="옥상 슬라브", level="ROOF", type="ROOF", default_hazards=["추락위험"])
            db.add_all([z1, z2])
            await db.flush()

            # 6. Work Templates
            wt1 = WorkTemplate(work_type="일반작업", base_risk_score=10)
            wt2 = WorkTemplate(work_type="고소작업", base_risk_score=30, required_ppe=["안전모", "안전대"])
            db.add_all([wt1, wt2])

            await db.commit()
            print("✅ Full Seed Data Created!")
            print(f"   Project: {project.name}")
            print(f"   Users: a(admin), m(manager), w(worker, Pending)")

        except Exception as e:
            print(f"❌ Seed Failed: {e}")
            await db.rollback()
            raise e # 에러 확인을 위해 raise

if __name__ == "__main__":
    asyncio.run(reset_db())
