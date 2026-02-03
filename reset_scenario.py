import asyncio
import random
from datetime import date, datetime, timedelta
from sqlalchemy import text
import bcrypt
from back.database import engine, Base, AsyncSessionLocal
from back.auth.model import User
from back.company.model import Company, ProjectParticipant
from back.project.model import Project, ProjectMember
from back.attendance.model import Attendance, AttendanceStatus
from back.work.model import Weather
from back.safety.model import Zone # 누락된 경우를 대비

async def reset_and_seed():
    print("🚀 [Step 1] 데이터베이스 초기화 중...")
    
    # 1. 테이블 전체 삭제 후 재생성 (Drop & Create)
    async with engine.begin() as conn:
        # 모든 테이블 목록 (순서 주의: 자식부터 부모 순)
        tables = [
            "attendance", "project_members", "project_participants", 
            "worker_allocations", "daily_work_plans", "safety_logs", 
            "daily_danger_zones", "zones", "sites", "projects", 
            "users", "companies", "notices", "weather", "emergency_alerts", "safety_violations"
        ]
        for table in tables:
            await conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
        
        # 테이블 다시 생성 (Alembic 대신 모든 모델 생성)
        await conn.run_sync(Base.metadata.create_all)
        
    print("✅ 테이블 재생성 완료.")

    async with AsyncSessionLocal() as db:
        print("🌱 [Step 2] 회사(Company) 생성 중...")
        main_corp = Company(name="스마트건설(주)", type="GENERAL", trade_type="종합건설")
        sub_corp = Company(name="번개전기(주)", type="SPECIALTY", trade_type="전기공사")
        db.add_all([main_corp, sub_corp])
        await db.commit()
        await db.refresh(main_corp)
        await db.refresh(sub_corp)

        print("👤 [Step 3] 사용자(User) 생성 중...")
        pw_bytes = "0000".encode('utf-8')
        hashed_pw = bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode('utf-8')
        
        admin = User(username="admin", hashed_password=hashed_pw, full_name="시스템관리자", role="admin", phone="010-0000-0000", company_id=main_corp.id)
        manager = User(username="manager", hashed_password=hashed_pw, full_name="김소장", role="manager", job_type="현장소장", phone="010-1111-2222", company_id=main_corp.id)
        safety = User(username="safety", hashed_password=hashed_pw, full_name="이안전", role="safety_manager", job_type="안전팀장", phone="010-3333-4444", company_id=main_corp.id)
        worker = User(
            username="worker", 
            hashed_password=hashed_pw, 
            full_name="박작업", 
            role="worker", 
            job_type="전기공", 
            title="반장", 
            phone="010-5555-6666", 
            company_id=sub_corp.id,
            birth_date=date(1980, 5, 15) # date 객체 사용
        )
        worker2 = User(
            username="worker2", 
            hashed_password=hashed_pw, 
            full_name="최신입", 
            role="worker", 
            job_type="전기보조", 
            title="사원", 
            phone="010-7777-8888", 
            company_id=sub_corp.id,
            birth_date=date(1995, 8, 20) # date 객체 사용
        )
        
        db.add_all([admin, manager, safety, worker, worker2])
        await db.commit()
        await db.refresh(manager)
        await db.refresh(safety)
        await db.refresh(worker)

        print("🏗️ [Step 4] 프로젝트(Project) 생성 중...")
        project = Project(
            name="강남 스마트 오피스 신축공사",
            code="PJ-2026-001",
            location_name="서울시 강남구 테헤란로 123",
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            budget_amount=1000000000,
            status="ACTIVE",
            client_company="스마트건설(주)",
            constructor_company="스마트건설(주)"
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)

        print("🔗 [Step 5] 프로젝트 멤버 & 협력사 배정 중...")
        pm_manager = ProjectMember(project_id=project.id, user_id=manager.id, role_name="현장소장", status="ACTIVE")
        pm_safety = ProjectMember(project_id=project.id, user_id=safety.id, role_name="안전팀장", status="ACTIVE")
        pm_worker1 = ProjectMember(project_id=project.id, user_id=worker.id, role_name="전기공", status="ACTIVE")
        pm_worker2 = ProjectMember(project_id=project.id, user_id=worker2.id, role_name="전기보조", status="ACTIVE")
        pp_elec = ProjectParticipant(project_id=project.id, company_id=sub_corp.id, role="PARTNER")
        
        db.add_all([pm_manager, pm_safety, pm_worker1, pm_worker2, pp_elec])
        await db.commit()


        print("✅ [Step 6] 작업자 출퇴근 기록 생성 (Worker1: 출근)")
        att = Attendance(
            user_id=worker.id,
            project_id=project.id,
            date=date.today(), # date 객체
            check_in_time=datetime.now().replace(hour=7, minute=50), # datetime 객체
            status="PRESENT",
            check_in_method="APP"
        )
        db.add(att)
        await db.commit()
        
        print("☀️ [Step 7] 날씨(Weather) 데이터 생성 중...")
        w_today = Weather(
            date=date.today(), # date 객체
            temperature=24.5,
            condition="CLEAR"
        )
        db.add(w_today)
        await db.commit()
        
        print("\n🎉 모든 데이터 초기화 및 연동 완료!")

if __name__ == "__main__":
    asyncio.run(reset_and_seed())
