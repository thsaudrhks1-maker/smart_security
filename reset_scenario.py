import asyncio
import random
from datetime import date, datetime, timedelta
from sqlalchemy import text
import bcrypt # passlib 대신 직접 사용

from back.database import engine, Base, AsyncSessionLocal
from back.auth.model import User
from back.company.model import Company, ProjectParticipant
from back.project.model import Project, ProjectMember
from back.attendance.model import Attendance, AttendanceStatus

async def reset_and_seed():
    print("🚀 [Step 1] 데이터베이스 초기화 중...")
    
    # 1. 테이블 전체 삭제 후 재생성 (Drop & Create)
    async with engine.begin() as conn:
        # 의존성 문제로 CASCADE로 날려버림
        await conn.execute(text("DROP TABLE IF EXISTS attendance CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS project_members CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS project_participants CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS daily_work_plans CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS worker_allocations CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS projects CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS companies CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS notices CASCADE")) # 공지사항도 초기화
        
        # 테이블 다시 생성
        await conn.run_sync(Base.metadata.create_all)
        
    print("✅ 테이블 재생성 완료.")

    async with AsyncSessionLocal() as db:
        print("🌱 [Step 2] 회사(Company) 생성 중...")
        # 1. 원청사 (시공사)
        main_corp = Company(
            name="스마트건설(주)",
            type="GENERAL",
            trade_type="종합건설"
        )
        # 2. 협력사 (전기)
        sub_corp = Company(
            name="번개전기(주)",
            type="SPECIALTY",
            trade_type="전기공사"
        )
        db.add_all([main_corp, sub_corp])
        await db.commit()
        await db.refresh(main_corp)
        await db.refresh(sub_corp)

        print("👤 [Step 3] 사용자(User) 생성 중...")
        # bcrypt 해싱
        pw_bytes = "0000".encode('utf-8')
        hashed_pw = bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode('utf-8')
        
        # 1. 전체 관리자 (Admin)
        admin = User(
            username="admin",
            hashed_password=hashed_pw, # password_hash -> hashed_password
            full_name="시스템관리자",
            role="admin",
            phone="010-0000-0000",
            company_id=main_corp.id
        )
        
        # 2. 현장 소장 (Manager) - 스마트건설 소속
        manager = User(
            username="manager",
            hashed_password=hashed_pw,
            full_name="김소장",
            role="manager",
            job_type="현장소장", # position 필드 없음, job_type 사용
            phone="010-1111-2222",
            company_id=main_corp.id
        )
        
        # 3. 안전 관리자 (Safety) - 스마트건설 소속
        safety = User(
            username="safety",
            hashed_password=hashed_pw,
            full_name="이안전",
            role="safety_manager",
            job_type="안전팀장",
            phone="010-3333-4444",
            company_id=main_corp.id
        )
        
        # 4. 작업자 (Worker) - 번개전기 소속
        worker = User(
            username="worker",
            hashed_password=hashed_pw,
            full_name="박작업",
            role="worker",
            job_type="전기공",
            title="반장", # position -> title
            phone="010-5555-6666",
            company_id=sub_corp.id,
            birth_date="800515" # date 객체 -> String (YYMMDD)
        )

        # 5. 작업자2 (Worker) - 번개전기 소속 (출근 안함)
        worker2 = User(
            username="worker2",
            hashed_password=hashed_pw,
            full_name="최신입",
            role="worker",
            job_type="전기보조",
            title="사원", 
            phone="010-7777-8888",
            company_id=sub_corp.id,
            birth_date="950820" # date 객체 -> String (YYMMDD)
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

        print("🔗 [Step 5] 프로젝트 멤버 & 협력사 배정 중... (연동의 핵심!)")
        # 1. 현장 소장 배정
        pm_manager = ProjectMember(
            project_id=project.id,
            user_id=manager.id,
            role_name="현장소장",
            status="ACTIVE",
            joined_at=date(2026, 1, 1)
        )
        # 2. 안전 관리자 배정
        pm_safety = ProjectMember(
            project_id=project.id,
            user_id=safety.id,
            role_name="안전팀장",
            status="ACTIVE",
            joined_at=date(2026, 1, 5)
        )
        # 3. 협력사 투입 (번개전기)
        pp_elec = ProjectParticipant(
            project_id=project.id,
            company_id=sub_corp.id,
            role="PARTNER" # CONSTRUCTOR -> PARTNER (협력사니까)
        )
        
        db.add_all([pm_manager, pm_safety, pp_elec])
        await db.commit()

        print("✅ [Step 6] 작업자 출퇴근 기록 생성 (Worker1: 출근)")
        # worker1은 오늘 출근함
        att = Attendance(
            user_id=worker.id,
            project_id=project.id,
            date=date.today(),
            check_in_time=datetime.now().replace(hour=7, minute=50), # 7시 50분 출근
            status=AttendanceStatus.PRESENT,
            check_in_method="APP"
        )
        db.add(att)
        await db.commit()
        
        print("\n🎉 모든 데이터 초기화 및 연동 완료!")
        print(f"1. Admin: admin / 1234 (전체 조회)")
        print(f"2. Manager: manager / 1234 (강남 현장 소장 -> 대시보드 확인 가능)")
        print(f"3. Worker: worker / 1234 (강남 현장 투입 -> 출근 완료 상태)")

if __name__ == "__main__":
    asyncio.run(reset_and_seed())
