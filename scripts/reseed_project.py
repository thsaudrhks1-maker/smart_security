
import asyncio
from datetime import date, datetime
import bcrypt
from sqlalchemy import text

# 비밀번호 해싱 (bcrypt)
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

from back.database import engine
from back.safety.service import SafetyService

async def reseed():
    print("[START] 데이터 초기화 및 신규 프로젝트 시딩 시작...")
    
    now = datetime.now()
    today = date.today()
    pwd = hash_password("0000")

    async with engine.begin() as conn:
        # 1. 모든 테이블 삭제
        tables = [
            "worker_allocations", "daily_work_plans", "daily_danger_zones", 
            "safety_logs", "safety_violations", "emergency_alerts", 
            "attendance", "notices", "zones", "project_members", 
            "project_participants", "sites", "projects", "users", "companies",
            "work_templates"
        ]
        
        for table in tables:
            await conn.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
        print("[OK] 기존 데이터 전부 삭제 완료.")

        # 2. 회사 생성
        await conn.execute(text("""
            INSERT INTO companies (id, name, type, trade_type, created_at, updated_at)
            VALUES (1, '대한건설', 'GENERAL', '종합건설', :now, :now),
                   (2, '한성설비', 'SPECIALTY', '기계설비', :now, :now)
        """), {"now": now})
        
        # 3. 사용자 생성
        await conn.execute(text("""
            INSERT INTO users (id, username, hashed_password, full_name, role, company_id, job_type, title, phone, created_at)
            VALUES (1, 'admin', :pwd, '최고관리자', 'admin', NULL, NULL, '시스템관리자', '010-0000-0000', :now),
                   (2, 'manager1', :pwd, '이소장', 'manager', 1, NULL, '현장소장', '010-1111-1111', :now),
                   (3, 'worker1', :pwd, '박작업', 'worker', 2, '배관공', '반장', '010-2222-2222', :now),
                   (4, 'worker2', :pwd, '강공남', 'worker', 2, '배관공', '작업자', '010-3333-3333', :now),
                   (5, 'worker3', :pwd, '김철근', 'worker', 1, '철근공', '작업자', '010-4444-4444', :now),
                   (6, 'safety1', :pwd, '김안전', 'manager', 1, NULL, '안전과장', '010-5555-5555', :now),
                   (7, 'manager2', :pwd, '박팀장', 'manager', 2, '설비', '팀장', '010-6666-6666', :now)
        """), {"pwd": pwd, "now": now})

        # 4. 프로젝트 생성
        await conn.execute(text("""
            INSERT INTO projects (
                id, name, description, location_lat, location_lng, location_address,
                grid_spacing, grid_rows, grid_cols, basement_floors, ground_floors,
                status, created_at, updated_at
            ) VALUES (
                1, '스마트 시큐리티 통합 프로젝트', '그리드 및 층수 테스트 프로젝트', 
                37.5665, 126.9780, '서울특별시 중구 세종대로 110',
                5.0, 5, 5, 1, 2, 'ACTIVE', :now, :now
            )
        """), {"now": now})
        
        await conn.execute(text("INSERT INTO project_participants (project_id, company_id, role) VALUES (1, 1, 'CONSTRUCTOR'), (1, 2, 'PARTNER')"))
        
        await conn.execute(text("""
            INSERT INTO project_members (project_id, user_id, role_name, status, joined_at)
            VALUES (1, 2, '현장소장', 'ACTIVE', :now),
                   (1, 3, '배관반장', 'ACTIVE', :now),
                   (1, 4, '배관공', 'ACTIVE', :now),
                   (1, 5, '철근공', 'ACTIVE', :now)
        """), {"now": now})

        # 5. 현장 생성
        await conn.execute(text("INSERT INTO sites (id, project_id, name, address) VALUES (1, 1, '본현장', '서울특별시 중구 세종대로 110')"))
        
        # 6. 작업 템플릿
        await conn.execute(text("""
            INSERT INTO work_templates (id, work_type, required_ppe, checklist_items, base_risk_score)
            VALUES (1, '배관 설치', '["안전모", "안전화", "안전장갑"]', '["배관 정렬 확인", "용접 부위 점검", "누수 테스트"]', 40),
                   (2, '철근 조립', '["안전모", "안전화", "안전장갑", "안전대"]', '["철근 간격 확인", "결속선 체결", "낙하물 방지망 설치"]', 50),
                   (3, '콘크리트 타설', '["안전모", "안전화", "안전장갑"]', '["거푸집 고정 확인", "펌프카 안전거리", "양생 준비"]', 35)
        """))

    # 트랜잭션 종료 후 그리드 생성 호출 (함수 내부에서 별도 커넥션 사용하므로)
    print("   - 그리드 구역(Zone) 자동 생성 중 (B1, 1F, 2F)...")
    count = await SafetyService.generate_grid_for_site(1)
    print(f"[OK] 그리드 생성 완료: {count}개 구역 생성됨.")

    async with engine.begin() as conn:
        # 7. 더미 작업 계획 및 위험 구역
        # 작업 계획 1: 박작업 - 1F 중심부 배관 설치
        plan1_result = await conn.execute(text("""
            INSERT INTO daily_work_plans (
                site_id, zone_id, template_id, date, description, status, calculated_risk_score, 
                equipment_flags, daily_hazards, created_at
            ) VALUES (
                1, (SELECT id FROM zones WHERE level='1F' AND grid_x=2 AND grid_y=2 LIMIT 1), 
                1, :today, '1층 중앙홀 급수 배관 설치 작업', 'IN_PROGRESS', 40,
                '[]', '["좁은 공간 작업", "용접 화기 주의"]', :now
            ) RETURNING id
        """), {"today": today, "now": now})
        plan1_id = plan1_result.scalar()
        
        # 작업 계획 2: 강공남 - 1F 우측 배관 설치
        plan2_result = await conn.execute(text("""
            INSERT INTO daily_work_plans (
                site_id, zone_id, template_id, date, description, status, calculated_risk_score,
                equipment_flags, daily_hazards, created_at
            ) VALUES (
                1, (SELECT id FROM zones WHERE level='1F' AND grid_x=3 AND grid_y=1 LIMIT 1),
                1, :today, '1층 동측 배수 배관 연결 작업', 'PLANNED', 35,
                '[]', '["배관 무게 주의"]', :now
            ) RETURNING id
        """), {"today": today, "now": now})
        plan2_id = plan2_result.scalar()
        
        # 작업 계획 3: 김철근 - 2F 철근 조립
        plan3_result = await conn.execute(text("""
            INSERT INTO daily_work_plans (
                site_id, zone_id, template_id, date, description, status, calculated_risk_score,
                equipment_flags, daily_hazards, created_at
            ) VALUES (
                1, (SELECT id FROM zones WHERE level='2F' AND grid_x=1 AND grid_y=1 LIMIT 1),
                2, :today, '2층 바닥 철근 배근 작업', 'IN_PROGRESS', 55,
                '["CRANE"]', '["고소작업", "중량물 취급", "낙하물 위험"]', :now
            ) RETURNING id
        """), {"today": today, "now": now})
        plan3_id = plan3_result.scalar()
        
        # 작업자 할당
        await conn.execute(text("""
            INSERT INTO worker_allocations (plan_id, worker_id, role)
            VALUES (:plan1_id, 3, '반장'),
                   (:plan2_id, 4, '작업자'),
                   (:plan3_id, 5, '작업자')
        """), {"plan1_id": plan1_id, "plan2_id": plan2_id, "plan3_id": plan3_id})
        
        # 위험 구역 (B1 낙하, 2F 개구부, 1F 중장비)
        b1_zone = await conn.execute(text("SELECT id FROM zones WHERE level='B1' AND grid_x=0 AND grid_y=0 LIMIT 1"))
        b1_id = b1_zone.scalar()
        if b1_id:
            await conn.execute(text("""
                INSERT INTO daily_danger_zones (zone_id, date, risk_type, description)
                VALUES (:zone_id, :today, 'FALL', 'B1 하층부 지하수 누수 및 낙하 주의')
            """), {"zone_id": b1_id, "today": today})
        
        f2_zone = await conn.execute(text("SELECT id FROM zones WHERE level='2F' AND grid_x=4 AND grid_y=4 LIMIT 1"))
        f2_id = f2_zone.scalar()
        if f2_id:
            await conn.execute(text("""
                INSERT INTO daily_danger_zones (zone_id, date, risk_type, description)
                VALUES (:zone_id, :today, 'ETC', '2F 코너부 개구부 미설치 - 추락 주의')
            """), {"zone_id": f2_id, "today": today})
        
        f1_zone = await conn.execute(text("SELECT id FROM zones WHERE level='1F' AND grid_x=4 AND grid_y=2 LIMIT 1"))
        f1_id = f1_zone.scalar()
        if f1_id:
            await conn.execute(text("""
                INSERT INTO daily_danger_zones (zone_id, date, risk_type, description)
                VALUES (:zone_id, :today, 'HEAVY_EQUIPMENT', '1F 동측 타워크레인 운행 중')
            """), {"zone_id": f1_id, "today": today})
        
        # 8. 출석 데이터 (attendance)
        await conn.execute(text("""
            INSERT INTO attendance (user_id, date, check_in_time, check_out_time, status, site_id)
            VALUES (3, :today, '07:30:00', NULL, 'PRESENT', 1),
                   (4, :today, '08:15:00', NULL, 'LATE', 1),
                   (5, :today, '07:45:00', NULL, 'PRESENT', 1)
        """), {"today": today})
        
    print("[OK] 더미 작업 계획, 위험 구역, 출석 데이터 생성 완료.")
    print("\n[DONE] 모든 시딩 작업이 성공적으로 완료되었습니다!")
    print("--------------------------------------------------")
    print("  계정 정보 (비밀번호: 0000)")
    print("  - Admin: admin / 0000")
    print("  - Manager: manager1 / 0000 (현장소장, 대한건설)")
    print("  - Worker: worker1 (박작업) / 0000 (배관공 반장, 한성설비)")
    print("  - Worker: worker2 (강공남) / 0000 (배관공, 한성설비)")
    print("  - Worker: worker3 (김철근) / 0000 (철근공, 대한건설)")
    print("")
    print("  프로젝트: 스마트 시큐리티 통합 프로젝트")
    print("  - 위치: 서울특별시 중구 세종대로 110")
    print("  - 층수: B1 ~ 2F (총 3개 층)")
    print("  - 그리드: 5x5 (총 75개 구역)")
    print("")
    print("  작업 배정:")
    print("  - 박작업(worker1): 1F 중앙 배관 설치 (진행중)")
    print("  - 강공남(worker2): 1F 동측 배관 연결 (계획)")
    print("  - 김철근(worker3): 2F 철근 배근 (진행중)")
    print("--------------------------------------------------")

if __name__ == "__main__":
    asyncio.run(reseed())
