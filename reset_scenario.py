import asyncio
import random
from datetime import date, datetime, timedelta
from sqlalchemy import text
import bcrypt
from back.database import engine, Base, AsyncSessionLocal
from back.auth.model import User
from back.company.model import Company, ProjectParticipant, Site
from back.project.model import Project, ProjectMember
from back.attendance.model import Attendance, AttendanceStatus
from back.work.model import Weather, WorkTemplate, DailyWorkPlan, WorkerAllocation
from back.safety.model import Zone

async def reset_and_seed():
    print("🚀 [Step 1] 데이터베이스 초기화 중...")
    
    # 1. 테이블 전체 삭제 후 재생성 (Drop & Create)
    async with engine.begin() as conn:
        # 모든 테이블 목록 (순서 주의: 자식부터 부모 순)
        tables = [
            "attendance", "project_members", "project_participants", 
            "worker_allocations", "daily_work_plans", "safety_logs", 
            "daily_danger_zones", "zones", "sites", "projects", 
            "users", "companies", "notices", "weather", "emergency_alerts", 
            "safety_violations", "work_templates", "daily_safety_info"
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
        worker3 = User(
            username="worker3", 
            hashed_password=hashed_pw, 
            full_name="김철근", 
            role="worker", 
            job_type="철근공", 
            title="기공", 
            phone="010-9999-0000", 
            company_id=sub_corp.id,
            birth_date=date(1985, 3, 10)
        )
        worker4 = User(
            username="worker4", 
            hashed_password=hashed_pw, 
            full_name="이배관", 
            role="worker", 
            job_type="배관공", 
            title="조공", 
            phone="010-1212-3434", 
            company_id=sub_corp.id,
            birth_date=date(1990, 11, 25)
        )
        
        db.add_all([admin, manager, safety, worker, worker2, worker3, worker4])
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
        # [기획 반영] 박작업님은 현재 '승인 대기(PENDING)' 상태로 설정
        pm_worker1 = ProjectMember(project_id=project.id, user_id=worker.id, role_name="전기공", status="PENDING")
        
        # 최신입님은 '승인 완료(ACTIVE)' 상태
        pm_worker2 = ProjectMember(project_id=project.id, user_id=worker2.id, role_name="전기보조", status="ACTIVE")
        
        # [신규 추가] 김철근, 이배관님도 승인 대기(PENDING) 상태로 추가 (테스트용)
        pm_worker3 = ProjectMember(project_id=project.id, user_id=worker3.id, role_name="철근공", status="PENDING")
        pm_worker4 = ProjectMember(project_id=project.id, user_id=worker4.id, role_name="배관공", status="PENDING")
        
        pp_elec = ProjectParticipant(project_id=project.id, company_id=sub_corp.id, role="PARTNER")
        
        db.add_all([pm_manager, pm_safety, pm_worker1, pm_worker2, pm_worker3, pm_worker4, pp_elec])
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
        
        # -------------------------------------------------------------
        # [NEW] 소규모 현장 & 인테리어 공정 시딩 (Step 8 ~ 9)
        # -------------------------------------------------------------
        
        print("🏗️ [Step 8] 소규모 현장 구역(Zone) 생성 중... (단일 건물 가정)")
        
        # 먼저 Site 생성 (프로젝트와 연결)
        site = Site(
            project_id=project.id,
            name="강남 오피스 현장",
            address="서울시 강남구 테헤란로 123"
        )
        db.add(site)
        await db.flush() # ID 확보를 위해 flush
        
        # 5억~10억 규모 리모델링/인테리어 현장 가정 (1개 층 구획)
        # 보통 주출입구, 메인홀, 사무실1, 사무실2, 탕비실, 화장실, 창고, 외부
        zones = [
            Zone(site_id=site.id, level="1F", name="주출입구 및 복도", type="INDOOR"),
            Zone(site_id=site.id, level="1F", name="메인 사무공간(A)", type="INDOOR"),
            Zone(site_id=site.id, level="1F", name="회의실(B)", type="INDOOR"),
            Zone(site_id=site.id, level="1F", name="탕비실/휴게실", type="INDOOR"),
            Zone(site_id=site.id, level="1F", name="화장실(남/녀)", type="INDOOR", default_hazards=["미끄럼주의", "환기필요"]),
            Zone(site_id=site.id, level="1F", name="외부 자재반입구", type="OUTDOOR", default_hazards=["차량주의", "낙하물"]),
            Zone(site_id=site.id, level="ROOF", name="옥상", type="ROOF", default_hazards=["추락주의"])
        ]
        db.add_all(zones)
        await db.commit()
        
        print("📋 [Step 9] 작업 템플릿(WorkTemplate) 생성 중... (인테리어/리모델링 공정)")
        
        templates = [
            # 1. 철거 (초기)
            WorkTemplate(work_type="철거/해체 작업", base_risk_score=70, 
                         required_ppe=["안전모", "안전화", "방진마스크", "보안경"],
                         checklist_items=["전기/가스 차단 확인", "살수 설비 준비", "출입 통제 구획 설정"]),
            
            # 2. 조적/미장 (벽체)
            WorkTemplate(work_type="벽돌 조적 및 미장", base_risk_score=30,
                         required_ppe=["안전모", "안전화", "장갑"],
                         checklist_items=["작업 발판 안전성", "자재 적재 상태 확인"]),
            
            # 3. 전기/설비 (배관)
            WorkTemplate(work_type="전기 배선/배관", base_risk_score=50,
                         required_ppe=["절연장갑", "안전모", "안전화"],
                         checklist_items=["작업 전 전원 차단", "전동공구 상태 점검", "피복 손상 여부 확인"]),
                         
            WorkTemplate(work_type="수도 배관 설비", base_risk_score=40,
                         required_ppe=["안전모", "안전화", "용접면(필요시)"],
                         checklist_items=["용접 화재 감시자 배치", "누수 점검"]),

            # 4. 목공/타일/도배 (마감)
            WorkTemplate(work_type="목공(천장/벽체)", base_risk_score=40,
                         required_ppe=["안전모", "안전화", "방진마스크"],
                         checklist_items=["타카/톱 기계 방호장치", "작업장 정리정돈"]),
                         
            WorkTemplate(work_type="타일 시공", base_risk_score=30,
                         required_ppe=["안전모", "장갑", "무릎보호대"],
                         checklist_items=["타일 절단기 안전상태", "접착제 환기"]),
                         
            WorkTemplate(work_type="도장(페인트)", base_risk_score=60,
                         required_ppe=["방독마스크", "보안경", "화학물질용 장갑"],
                         checklist_items=["밀폐공간 환기 실시", "인화성 물질 격리", "화기 엄금"]),

            WorkTemplate(work_type="도배 및 바닥재", base_risk_score=20,
                         required_ppe=["안전화", "장갑"],
                         checklist_items=["우마(발판) 안정성", "칼날 관리 주의"])
        ]
        db.add_all(templates)
        await db.commit()

        print("\n🎉 모든 데이터 초기화 및 연동 완료! (소규모 현장 모드)")
        
        # -------------------------------------------------------------
        # [NEW] 일일 작업 계획 시딩 (Step 10 - 오늘/내일/모레 데이터)
        # -------------------------------------------------------------
        print("📅 [Step 10] 일일 작업 계획(Daily Work Plan) & 할당 생성 중... (3일치)")
        
        today = date.today()
        tomorrow = today + timedelta(days=1)
        day_after = today + timedelta(days=2)
        
        # 1. 오늘 작업: 1층 주출입구 - 조적 작업 (김철근, 이배관)
        plan_today = DailyWorkPlan(
            site_id=site.id,
            zone_id=zones[0].id, # 주출입구
            template_id=templates[1].id, # 조적/미장
            date=today,
            description="1층 로비 벽체 조적 쌓기",
            equipment_flags=["LIFT"],
            daily_hazards=["자재 낙하 주의", "보행자 통로 확보"],
            status="IN_PROGRESS",
            calculated_risk_score=40
        )
        db.add(plan_today)
        await db.flush()
        
        db.add_all([
            WorkerAllocation(plan_id=plan_today.id, worker_id=worker3.id, role="조적 반장"), # 김철근
            WorkerAllocation(plan_id=plan_today.id, worker_id=worker4.id, role="조공")      # 이배관
        ])
        
        # 2. 내일 작업: 1층 화장실 - 배관 설비 (이배관)
        plan_tmr_1 = DailyWorkPlan(
            site_id=site.id,
            zone_id=zones[4].id, # 화장실
            template_id=templates[3].id, # 수도 배관
            date=tomorrow,
            description="화장실 급배수 배관 연결",
            equipment_flags=["WELDING_MACHINE"],
            daily_hazards=["화재 주의", "밀폐 공간 환기"],
            status="PLANNED",
            calculated_risk_score=55
        )
        db.add(plan_tmr_1)
        await db.flush()
        
        db.add(WorkerAllocation(plan_id=plan_tmr_1.id, worker_id=worker4.id, role="배관팀장")) # 이배관
        
        # 3. 내일 작업: 1층 사무공간 - 전기 배선 (박작업, 최신입)
        plan_tmr_2 = DailyWorkPlan(
            site_id=site.id,
            zone_id=zones[1].id, # 사무공간A
            template_id=templates[2].id, # 전기 배선
            date=tomorrow,
            description="천장 및 벽체 전열 라인 포설",
            equipment_flags=["LIFT", "DRILL"],
            daily_hazards=["감전 주의", "고소 작업 안전대 착용"],
            status="PLANNED",
            calculated_risk_score=45
        )
        db.add(plan_tmr_2)
        await db.flush()
        
        db.add_all([
            WorkerAllocation(plan_id=plan_tmr_2.id, worker_id=worker.id, role="전기 반장"), # 박작업
            WorkerAllocation(plan_id=plan_tmr_2.id, worker_id=worker2.id, role="전기 보조") # 최신입
        ])

        # 4. 모레 작업: 옥상 - 방수/도장 (전원 투입)
        plan_next = DailyWorkPlan(
            site_id=site.id,
            zone_id=zones[6].id, # 옥상
            template_id=templates[6].id, # 도장(페인트) -> 방수 대체
            date=day_after,
            description="옥상 우레탄 방수 하도 작업",
            equipment_flags=[],
            daily_hazards=["추락 주의", "유기용제 중독 주의", "화기 엄금"],
            status="PLANNED",
            calculated_risk_score=75 # High Risk
        )
        db.add(plan_next)
        await db.flush()
        
        # 주말 특근 가정 전원 투입
        db.add_all([
            WorkerAllocation(plan_id=plan_next.id, worker_id=worker.id, role="작업 지휘"),
            WorkerAllocation(plan_id=plan_next.id, worker_id=worker3.id, role="작업원"),
            WorkerAllocation(plan_id=plan_next.id, worker_id=worker4.id, role="작업원")
        ])
        
        await db.commit()
        print("✅ 3일치 작업 계획 생성 완료!")

if __name__ == "__main__":
    asyncio.run(reset_and_seed())
