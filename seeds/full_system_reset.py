
import asyncio
import os
import sys
import bcrypt
from sqlalchemy import text
from datetime import date, datetime

# 프로젝트 루트를 path에 추가 (back 모듈 찾기 위함)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import engine, execute, Base

async def full_reset(reset_schema=False):
    print(f"=== 시스템 통합 초기화 (SCHEMA_RESET: {reset_schema}) ===")
    
    password = "0000".encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(password, salt).decode('utf-8')

    if reset_schema:
        async with engine.begin() as conn:
            print("--- [WARNING] DB 전체 스키마 파괴 및 재생성 중 (CASCADE) ---")
            await conn.execute(text("DROP SCHEMA public CASCADE;"))
            await conn.execute(text("CREATE SCHEMA public;"))
            await conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
            await conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
            
            print("--- pgvector 확장 활성화 중 ---")
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            
            print("--- 새 테이블 스키마 생성 중... ---")
            await conn.run_sync(Base.metadata.create_all)
    else:
        print("--- 기존 테이블 데이터 비우기 (TRUNCATE) ---")
        # 외래키 제약조건 때문에 순서대로 지우거나 CASCADE 사용
        tables = [
            "daily_worker_users", "daily_work_plans", "daily_danger_images", "daily_danger_zones",
            "daily_attendance", "daily_notices", "daily_violations", "daily_safety_logs",
            "project_users", "project_companies", "project_zones", "project_master",
            "sys_users", "sys_companies", "content_work_info", "content_safety_info",
            "content_danger_info", "content_accidents"
        ]
        async with engine.begin() as conn:
            for table in tables:
                await conn.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;"))

    print("--- 기초 데이터(Seeding) 입력 시작 ---")

    # 1. 업체 (발주처 1, 시공사 1, 협력업체 5개)
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('서울특별시청', 'CLIENT', '공공기관')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('(주)대한건설', 'CONSTRUCTOR', '종합건설')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('(주)삼보목공', 'PARTNER', '목공/창호')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('대진경량', 'PARTNER', '내장/수납')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('현대토건', 'PARTNER', '토목골조')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('한국전기', 'PARTNER', '전기/통신')")
    await execute("INSERT INTO sys_companies (name, type, trade_type) VALUES ('세종설비', 'PARTNER', '설비/배관')")

    # 1.1 작업 정보 (다양한 공종)
    await execute("INSERT INTO content_work_info (work_type, base_risk_score) VALUES ('거푸집 설치 및 해체', 60)")
    await execute("INSERT INTO content_work_info (work_type, base_risk_score) VALUES ('고소작업 (3m 이상)', 75)")
    await execute("INSERT INTO content_work_info (work_type, base_risk_score) VALUES ('용접 및 절단작업', 65)")
    await execute("INSERT INTO content_work_info (work_type, base_risk_score) VALUES ('중장비 운용', 70)")
    await execute("INSERT INTO content_work_info (work_type, base_risk_score) VALUES ('전기배선 작업', 55)")
    await execute("INSERT INTO content_work_info (work_type, base_risk_score) VALUES ('배관 설치', 50)")
    await execute("INSERT INTO content_work_info (work_type, base_risk_score) VALUES ('내장 마감', 40)")
    
    # 1.2 안전 정보
    await execute("""
        INSERT INTO content_safety_info (category, title, description, checklist, risk_factors, safety_measures, required_ppe)
        VALUES ('고소작업', '고소작업 안전 표준', '3m 이상 높이에서의 작업 시 준수사항',
                '["안전대 착용 확인", "작업발판 견고성 점검", "추락방지망 설치", "작업구역 통제"]'::json,
                '["추락", "낙하물", "작업발판 붕괴"]'::json,
                '["안전난간 설치", "안전대 부착설비 설치", "작업 전 TBM 실시"]'::json,
                '["안전모", "안전대", "안전화"]'::json)
    """)
    await execute("""
        INSERT INTO content_safety_info (category, title, description, checklist, risk_factors, safety_measures, required_ppe)
        VALUES ('밀폐공간', '밀폐공간 작업 안전 표준', '산소농도 18% 미만 공간 작업 시 준수사항',
                '["산소농도 측정", "환기설비 가동", "감시인 배치", "비상연락체계 확립"]'::json,
                '["질식", "유해가스 중독", "산소결핍"]'::json,
                '["강제환기 실시", "산소농도 측정기 사용", "구조장비 비치"]'::json,
                '["송기마스크", "안전모", "안전화", "안전대"]'::json)
    """)
    await execute("""
        INSERT INTO content_safety_info (category, title, description, checklist, risk_factors, safety_measures, required_ppe)
        VALUES ('중장비', '중장비 작업 안전 표준', '굴삭기, 크레인 등 중장비 운용 시 준수사항',
                '["작업반경 내 인원 통제", "신호수 배치", "장비 점검", "지반 안정성 확인"]'::json,
                '["협착", "전도", "충돌"]'::json,
                '["작업구역 펜스 설치", "유도신호 체계 확립", "장비 일일점검"]'::json,
                '["안전모", "안전화", "형광조끼"]'::json)
    """)
    
    # 1.3 위험 요소 정보 (아이콘과 색상 포함)
    await execute("INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level) VALUES ('중장비', 'truck', '#f59e0b', '굴삭기, 크레인 등 중장비 운용 구역', 4)")
    await execute("INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level) VALUES ('낙하물', 'arrow-down', '#ef4444', '상부 작업으로 인한 낙하물 위험', 5)")
    await execute("INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level) VALUES ('감전', 'zap', '#dc2626', '전기 작업 중 고압선 노출', 5)")
    await execute("INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level) VALUES ('화재', 'flame', '#dc2626', '용접/절단 작업으로 인한 화재 위험', 4)")
    await execute("INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level) VALUES ('추락', 'alert-triangle', '#f97316', '고소 작업으로 인한 추락 위험', 5)")
    await execute("INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level) VALUES ('질식', 'wind', '#b91c1c', '밀폐공간 산소 부족', 5)")
    await execute("INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level) VALUES ('붕괴', 'alert-circle', '#ea580c', '구조물 붕괴 위험', 4)")

    # 2. 프로젝트
    await execute("""
        INSERT INTO project_master (name, status, location_address, lat, lng, grid_cols, grid_rows, grid_spacing, floors_above, floors_below)
        VALUES ('세종대로 스마트 신축현장', 'ACTIVE', '서울특별시 중구 세종대로 110 (태평로1가)', 37.5665, 126.9780, 5, 5, 20.0, 2, 1)
    """)

    # 3. 프로젝트-업체 관계 (발주처 1, 시공사 1, 협력업체 5개 모두 배정)
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 1, 'CLIENT')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 2, 'CONSTRUCTOR')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 3, 'PARTNER')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 4, 'PARTNER')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 5, 'PARTNER')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 6, 'PARTNER')")
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (1, 7, 'PARTNER')")

    # 4. 시공사 관리자 및 안전관리자 (프로젝트 자동 승인)
    await execute("INSERT INTO sys_users (username, hashed_password, role, full_name, job_title, company_id) VALUES ('admin', :p, 'admin', '시스템 관리자', '관리자', 2)", {"p": hashed_pw})
    await execute("INSERT INTO sys_users (username, hashed_password, role, full_name, job_title, company_id) VALUES ('manager1', :p, 'manager', '김소장', '현장소장', 2)", {"p": hashed_pw})
    await execute("INSERT INTO sys_users (username, hashed_password, role, full_name, job_title, company_id) VALUES ('safety1', :p, 'manager', '박안전', '안전관리자', 2)", {"p": hashed_pw})
    
    # 관리자는 자동 승인 (project_users에 바로 추가)
    await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (1, 1, 'admin', 'ACTIVE')")
    await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (1, 2, 'manager', 'ACTIVE')")
    await execute("INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (1, 3, 'safety_manager', 'ACTIVE')")

    # 5. 협력업체 소속 작업자들 (sys_users에만 등록, project_users 승인 대기)
    # (username, full_name, job_title, company_id)
    workers = [
        ("worker_mok1", "이목수", "목수", 3),  # 삼보목공
        ("worker_mok2", "최창호", "목수", 3),
        ("worker_mok3", "강기초", "목수", 3),
        ("worker_gyung1", "박내장", "내장공", 4),  # 대진경량
        ("worker_gyung2", "정마감", "마감공", 4),
        ("worker_to1", "김토목", "토목공", 5),  # 현대토건
        ("worker_to2", "이골조", "철근공", 5),
        ("worker_to3", "박철근", "철근공", 5),
        ("worker_elec1", "최전기", "전기공", 6),  # 한국전기
        ("worker_elec2", "정배선", "전기공", 6),
        ("worker_pipe1", "한배관", "배관공", 7),  # 세종설비
        ("worker_pipe2", "송설비", "배관공", 7),
    ]
    
    uid_counter = 4  # admin(1), manager1(2), safety1(3) 다음부터
    for username, full_name, job_title, company_id in workers:
        await execute(
            "INSERT INTO sys_users (username, hashed_password, role, full_name, job_title, company_id) VALUES (:u, :p, 'worker', :f, :j, :cid)",
            {"u": username, "p": hashed_pw, "f": full_name, "j": job_title, "cid": company_id}
        )
        uid_counter += 1
    
    # 6. 일부 작업자만 관리자 승인 (project_users에 추가)
    # 삼보목공 3명 중 2명 승인, 대진경량 2명 중 1명 승인, 현대토건 3명 모두 승인
    approved_workers = [4, 5, 7, 9, 10, 11]  # user_id
    for uid in approved_workers:
        await execute(
            "INSERT INTO project_users (project_id, user_id, role_name, status) VALUES (1, :uid, 'worker', 'ACTIVE')",
            {"uid": uid}
        )

    # 7. 구역 생성
    for level in ["B1", "1F", "2F"]:
        for r in range(5):
            for c in range(5):
                zone_name = f"{level}-{chr(65+c)}{r+1}"
                await execute("INSERT INTO project_zones (project_id, level, name, row_index, col_index) VALUES (1, :l, :n, :r, :c)", {"l": level, "n": zone_name, "r": r, "c": c})

    # 8. 출퇴근 기록 (승인된 작업자 중 3명 출근)
    today = date.today()
    now = datetime.now()
    morning = now.replace(hour=8, minute=30, second=0)
    
    # 출근 처리 (이목수, 최창호, 김토목)
    await execute("INSERT INTO daily_attendance (user_id, project_id, date, check_in_time, status) VALUES (4, 1, :d, :t, 'IN')", {"d": today, "t": morning})
    await execute("INSERT INTO daily_attendance (user_id, project_id, date, check_in_time, status) VALUES (5, 1, :d, :t, 'IN')", {"d": today, "t": morning})
    await execute("INSERT INTO daily_attendance (user_id, project_id, date, check_in_time, status) VALUES (9, 1, :d, :t, 'IN')", {"d": today, "t": morning})

    # 9. 일일 작업 계획 (각 층별 작업 배정)
    # B1층: 토목 작업 (zone_id 1~25 중 13번 = B1-C3)
    await execute("""
        INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, calculated_risk_score, status) 
        VALUES (1, 13, 3, :d, 'B1층 기초 배관 용접 작업', 65, 'IN_PROGRESS')
    """, {"d": today})
    await execute("INSERT INTO daily_worker_users (plan_id, worker_id) VALUES (1, 9)")  # 김토목
    await execute("INSERT INTO daily_worker_users (plan_id, worker_id) VALUES (1, 10)")  # 이골조

    # 1F층: 거푸집 작업 (zone_id 26~50 중 38번 = 1F-C3)
    await execute("""
        INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, calculated_risk_score, status) 
        VALUES (1, 38, 1, :d, '1층 로비 거푸집 설치 및 해체', 60, 'IN_PROGRESS')
    """, {"d": today})
    await execute("INSERT INTO daily_worker_users (plan_id, worker_id) VALUES (2, 4)")  # 이목수
    await execute("INSERT INTO daily_worker_users (plan_id, worker_id) VALUES (2, 5)")  # 최창호

    # 2F층: 전기 배선 (zone_id 51~75 중 63번 = 2F-C3)
    await execute("""
        INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, calculated_risk_score, status) 
        VALUES (1, 63, 5, :d, '2층 전기 배선 및 조명 설치', 55, 'PLANNED')
    """, {"d": today})

    # 10. 위험 구역 설정 (각 층별 2개씩, danger_info_id 사용)
    # B1층: zone 8 (B1-A3), zone 15 (B1-C5)
    await execute("""
        INSERT INTO daily_danger_zones (zone_id, danger_info_id, date, description) 
        VALUES (8, 2, :d, 'B1층 천장 작업으로 인한 낙하물 위험')
    """, {"d": today})  # danger_info_id=2: 낙하물
    
    await execute("""
        INSERT INTO daily_danger_zones (zone_id, danger_info_id, date, description) 
        VALUES (15, 6, :d, 'B1층 밀폐공간 환기 불량')
    """, {"d": today})  # danger_info_id=6: 질식

    # 1F층: zone 32 (1F-B2), zone 40 (1F-D5)
    await execute("""
        INSERT INTO daily_danger_zones (zone_id, danger_info_id, date, description) 
        VALUES (32, 1, :d, '1층 크레인 작업 구역')
    """, {"d": today})  # danger_info_id=1: 중장비
    
    await execute("""
        INSERT INTO daily_danger_zones (zone_id, danger_info_id, date, description) 
        VALUES (40, 4, :d, '1층 용접 작업으로 인한 화재 위험')
    """, {"d": today})  # danger_info_id=4: 화재

    # 2F층: zone 58 (2F-B3), zone 70 (2F-E5)
    await execute("""
        INSERT INTO daily_danger_zones (zone_id, danger_info_id, date, description) 
        VALUES (58, 3, :d, '2층 전기 작업 중 고압선 노출')
    """, {"d": today})  # danger_info_id=3: 감전
    
    await execute("""
        INSERT INTO daily_danger_zones (zone_id, danger_info_id, date, description) 
        VALUES (70, 5, :d, '2층 외벽 작업 추락 위험')
    """, {"d": today})  # danger_info_id=5: 추락

    print("\n=== System Reset Complete! ===")
    print("[OK] Client: 1 (Seoul City)")
    print("[OK] Constructor: 1 (Daehan Construction) - 2 managers auto-approved")
    print("[OK] Partners: 5 companies")
    print("[OK] Work Info: 7 types")
    print("[OK] Danger Info: 7 types")
    print("[OK] Partner Workers: 12 registered (6 approved, 6 pending)")
    print("[OK] Daily Attendance: 3 workers checked in")
    print("[OK] Daily Work Plans: 3 tasks (B1, 1F, 2F)")
    print("[OK] Danger Zones: 6 zones (B1:2, 1F:2, 2F:2)")
    print("\n[Login Info]")
    print("   - admin / 0000")
    print("   - manager1 / 0000")
    print("   - safety1 / 0000")

if __name__ == "__main__":
    # True로 설정하면 DB 스키마부터 완전히 새로 만듭니다. (pgvector 등 초기 설정 필요 시)
    # False로 설정하면 테이블 구조는 유지하고 데이터만 깔끔하게 비운 뒤 다시 채웁니다. (일반적인 데이터 수정 시)
    asyncio.run(full_reset(reset_schema=False))
