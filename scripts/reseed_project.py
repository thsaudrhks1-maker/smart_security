
import asyncio
from datetime import date, datetime
import bcrypt
from sqlalchemy import text

# 비밀번호 해싱 (bcrypt)
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

from back.database import engine, execute
from back.auth.model import User
from back.company.model import Company, Site, ProjectParticipant
from back.project.model import Project, ProjectMember
from back.safety.model import Zone, DailyDangerZone
from back.work.model import WorkTemplate, DailyWorkPlan, WorkerAllocation
from back.safety.service import SafetyService

async def reseed():
    print("🚀 데이터 초기화 및 신규 프로젝트 시딩 시작...")
    
    # 1. 모든 테이블 삭제 (순서 고려)
    tables = [
        "worker_allocations", "daily_work_plans", "daily_danger_zones", 
        "safety_logs", "safety_violations", "emergency_alerts", 
        "attendance", "notices", "zones", "project_members", 
        "project_participants", "sites", "projects", "users", "companies"
    ]
    
    async with engine.begin() as conn:
        for table in tables:
            await conn.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
    print("✅ 기존 데이터 전부 삭제 완료.")

    # 2. 회사 생성
    # 시공사 (Manager 소속)
    await execute("""
        INSERT INTO companies (id, name, type, trade_type, created_at, updated_at)
        VALUES (1, '대한건설', 'GENERAL', '종합건설', :now, :now)
    """, {"now": datetime.now()})
    
    # 협력사 (Worker 소속)
    await execute("""
        INSERT INTO companies (id, name, type, trade_type, created_at, updated_at)
        VALUES (2, '한성설비', 'SPECIALTY', '기계설비', :now, :now)
    """, {"now": datetime.now()})
    print("✅ 회사 정보 생성 완료.")

    # 3. 사용자 생성
    pwd = hash_password("0000")
    now = datetime.now()
    
    # Admin
    await execute("""
        INSERT INTO users (id, username, hashed_password, full_name, role, created_at)
        VALUES (1, 'admin', :pwd, '최고관리자', 'admin', :now)
    """, {"pwd": pwd, "now": now})
    
    # Manager (대한건설 소속)
    await execute("""
        INSERT INTO users (id, username, hashed_password, full_name, role, company_id, created_at)
        VALUES (2, 'manager1', :pwd, '이소장', 'manager', 1, :now)
    """, {"pwd": pwd, "now": now})
    
    # Worker (한성설비 소속)
    await execute("""
        INSERT INTO users (id, username, hashed_password, full_name, role, company_id, job_type, created_at)
        VALUES (3, 'worker1', :pwd, '강공남', 'worker', 2, '배관공', :now)
    """, {"pwd": pwd, "now": now})
    print("✅ 사용자 정보(admin, manager1, worker1) 생성 완료.")

    # 4. 프로젝트 생성 (지하 1층, 지상 2층, 5x5, 5m 간격)
    project_id = 1
    await execute("""
        INSERT INTO projects (
            id, name, description, location_lat, location_lng, location_address,
            grid_spacing, grid_rows, grid_cols, basement_floors, ground_floors,
            status, created_at, updated_at
        ) VALUES (
            :id, '스마트 시큐리티 통합 프로젝트', '그리드 및 층수 테스트 프로젝트', 
            37.5665, 126.9780, '서울특별시 중구 세종대로 110',
            5.0, 5, 5, 1, 2, 'ACTIVE', :now, :now
        )
    """, {"id": project_id, "now": now})
    
    # 프로젝트 참여사 설정
    await execute("INSERT INTO project_participants (project_id, company_id, role) VALUES (1, 1, 'CONSTRUCTOR')")
    await execute("INSERT INTO project_participants (project_id, company_id, role) VALUES (1, 2, 'PARTNER')")
    
    # 프로젝트 멤버 설정
    await execute("""
        INSERT INTO project_members (project_id, user_id, role_name, status, joined_at)
        VALUES (1, 2, '현장소장', 'ACTIVE', :now)
    """, {"now": now})
    await execute("""
        INSERT INTO project_members (project_id, user_id, role_name, status, joined_at)
        VALUES (1, 3, '배관반장', 'ACTIVE', :now)
    """, {"now": now})
    print("✅ 프로젝트 및 멤버십 생성 완료.")

    # 5. 현장 생성 및 그리드 자동 생성
    # 현장(Site) 생성
    await execute("""
        INSERT INTO sites (id, project_id, name, address)
        VALUES (1, 1, '본현장', '서울특별시 중구 세종대로 110')
    """)
    
    # 그리드 생성 (B1, 1F, 2F)
    # SafetyService 로직을 직접 호출하여 프로젝트 설정값으로 Zone 생성
    print("   - 그리드 구역(Zone) 자동 생성 중 (B1, 1F, 2F)...")
    count = await SafetyService.generate_grid_for_site(1)
    print(f"✅ 그리드 생성 완료: {count}개 구역 생성됨.")

    # 6. 더미 작업 계획 및 위험 구역
    # 작업 템플릿
    await execute("""
        INSERT INTO work_templates (id, work_type, required_ppe, checklist_items, base_risk_score)
        VALUES (1, '배관 설치', '["안전모", "안전화"]', '["배관 정렬 확인", "용접 부위 점검"]', 40)
    """)
    
    # 작업 계획 (1F 중심부)
    await execute("""
        INSERT INTO daily_work_plans (
            site_id, zone_id, template_id, date, description, status, created_at
        ) VALUES (
            1, (SELECT id FROM zones WHERE level='1F' AND grid_x=2 AND grid_y=2), 
            1, :today, '1층 중앙홀 배관 설치 작업', 'IN_PROGRESS', :now
        )
    """, {"today": date.today(), "now": now})
    
    # 작업자 할당
    await execute("""
        INSERT INTO worker_allocations (plan_id, worker_id, role)
        VALUES ((SELECT id FROM daily_work_plans LIMIT 1), 3, '작업자')
    """)
    
    # 위험 구역 (B1 낙하, 2F 개구부)
    b1_zone = await conn.execute(text("SELECT id FROM zones WHERE level='B1' AND grid_x=0 AND grid_y=0"))
    b1_id = b1_zone.scalar()
    await execute("""
        INSERT INTO daily_danger_zones (zone_id, date, risk_type, description)
        VALUES (:zone_id, :today, 'FALL', 'B1 하층부 지하수 누수 및 낙하 주의')
    """, {"zone_id": b1_id, "today": date.today()})
    
    f2_zone = await conn.execute(text("SELECT id FROM zones WHERE level='2F' AND grid_x=4 AND grid_y=4"))
    f2_id = f2_zone.scalar()
    await execute("""
        INSERT INTO daily_danger_zones (zone_id, date, risk_type, description)
        VALUES (:zone_id, :today, 'ETC', '2F 코너부 개구부 주의')
    """, {"zone_id": f2_id, "today": date.today()})
    
    print("✅ 더미 작업 계획 및 위험 구역 생성 완료.")
    print("\n🚀 모든 시딩 작업이 성공적으로 완료되었습니다!")
    print("--------------------------------------------------")
    print("  - Admin: admin / 0000")
    print("  - Manager: manager1 / 0000 (대한건설)")
    print("  - Worker: worker1 / 0000 (한성설비)")
    print("  - 프로젝트: 스마트 시큐리티 통합 프로젝트 (B1 ~ 2F, 5x5)")
    print("--------------------------------------------------")

if __name__ == "__main__":
    asyncio.run(reseed())
