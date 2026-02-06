
import asyncio
import os
import sys
import json
import random
import bcrypt
from datetime import date, datetime, timedelta
from sqlalchemy import text

# 프로젝트 루트를 path에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import engine, Base, execute, insert_and_return

async def final_atomic_reset():
    print("🧨 [System Nuke & Rebuild] 모든 장애물 제거 및 새 아키텍처 구축 시작...")
    
    async with engine.begin() as conn:
        # 1. 모든 기존 테이블 강제 삭제 (CASCADE)
        print("🧹 기존의 모든 유령 테이블 및 제약조건 강제 삭제 중...")
        # PostgreSQL용 모든 테이블 삭제 SQL
        drop_all_sql = """
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        """
        await conn.execute(text(drop_all_sql))
        
        # 2. 새 아키텍처 테이블 생성
        print("🏗️  새로운 도메인 테이블 생성 중 (New Schema: sys_, project_, content_, daily_)...")
        await conn.run_sync(Base.metadata.create_all)
        print("✅ 테이블 생성 완료!")

    today = date.today()
    pw_hash = bcrypt.hashpw("1234".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # 3. [SYS] 기초 정보
    print("📝 [SYS] 데이터 주입 중...")
    c1 = await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('현대건설(원청)', 'GENERAL', '종합') RETURNING id", {})
    c3 = await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('한성전력(협력)', 'SPECIALTY', '전기') RETURNING id", {})
    
    admin = await insert_and_return(
        "INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES ('admin', '김철수 소장', 'admin', :cid, :pw) RETURNING id",
        {"cid": c1["id"], "pw": pw_hash}
    )
    manager = await insert_and_return(
        "INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES ('manager1', '이관리 과장', 'manager', :cid, :pw) RETURNING id",
        {"cid": c1["id"], "pw": pw_hash}
    )
    
    worker_ids = []
    for i, name in enumerate(["강공남", "이안전", "박철수", "최건설", "정기공"]):
        res = await insert_and_return(
            "INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES (:u, :n, 'worker', :cid, :pw) RETURNING id",
            {"u": f"worker{i+1}", "n": name, "cid": c3["id"], "pw": pw_hash}
        )
        worker_ids.append(res["id"])

    # 4. [PROJECT] 물리 구조
    print("🧱 [PROJECT] 데이터 주입 중...")
    proj = await insert_and_return("INSERT INTO project_master (name, status) VALUES ('스마트 시큐리티 통합 관제 센터', 'ACTIVE') RETURNING id", {})
    pid = proj["id"]
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:pid, :cid, 'CONSTRUCTOR')", {"pid": pid, "cid": c1["id"]})
    site = await insert_and_return("INSERT INTO project_sites (project_id, name) VALUES (:pid, '강남 신축 현장') RETURNING id", {"pid": pid})
    
    # 멤버십
    for uid in [admin["id"], manager["id"]] + worker_ids:
        await execute("INSERT INTO project_members (project_id, user_id, role_name, status) VALUES (:pid, :uid, '멤버', 'ACTIVE')", {"pid": pid, "uid": uid})

    zone_ids = []
    for x in range(5):
        for y in range(5):
            z = await insert_and_return(
                "INSERT INTO project_zones (project_id, site_id, name, level) VALUES (:pid, :sid, :name, '1F') RETURNING id",
                {"pid": pid, "sid": site["id"], "name": f"1F-{x+1}열-{y+1}행"}
            )
            zone_ids.append(z["id"])

    # 5. [CONTENT] 안전 지침
    print("🛡️ [CONTENT] 데이터 주입 중...")
    gear_ids = {}
    for gear in [("안전모", "PPE"), ("안전대", "PPE"), ("안전화", "PPE")]:
        res = await insert_and_return("INSERT INTO content_safety_gear (name, type, icon) VALUES (:n, :t, 'hard-hat') RETURNING id", {"n": gear[0], "t": gear[1]})
        gear_ids[gear[0]] = res["id"]

    tmpl = await insert_and_return(
        "INSERT INTO content_work_templates (work_type, base_risk_score, checklist_items) VALUES ('고소 비계 작업', 85, :cli) RETURNING id",
        {"cli": json.dumps(["비계 발판 고정 확인", "안전난간 설치 확인"])}
    )
    for gid in gear_ids.values():
        await execute("INSERT INTO content_work_gear_map (template_id, resource_id) VALUES (:tid, :rid)", {"tid": tmpl["id"], "rid": gid})

    # 6. [DAILY] 운영 데이터 (최근 7일)
    print("📅 [DAILY] 데이터 주입 중...")
    for i in range(7):
        d = today - timedelta(days=i)
        for wid in worker_ids:
            cin = datetime.combine(d, datetime.min.time()) + timedelta(hours=7, minutes=random.randint(0, 30))
            cout = datetime.combine(d, datetime.min.time()) + timedelta(hours=17, minutes=30) if d < today else None
            await execute(
                "INSERT INTO daily_attendance (user_id, project_id, date, status, check_in_time, check_out_time) VALUES (:uid, :pid, :d, 'PRESENT', :cin, :cout)",
                {"uid": wid, "pid": pid, "d": d, "cin": cin, "cout": cout}
            )

    # 강공남 작업 배정
    task = await insert_and_return(
        "INSERT INTO daily_work_tasks (site_id, zone_id, template_id, date, description, status, calculated_risk_score) VALUES (:sid, :zid, :tid, :today, '1F 외벽 비계 설치', 'IN_PROGRESS', 85) RETURNING id",
        {"sid": site["id"], "zid": zone_ids[0], "tid": tmpl["id"], "today": today}
    )
    await execute("INSERT INTO daily_worker_allocations (plan_id, worker_id, role) VALUES (:tid, :wid, '작업리더')", {"tid": task["id"], "wid": worker_ids[0]})

    print("\n✅ [SUCCESS] 도메인 리팩토링 및 신규 데이터 환경 구축 완료!")
    print("---------------------------------------")
    print("🚀 접속 정보:")
    print(" - 아이디: manager1 / 패스워드: 1234")
    print("---------------------------------------")

if __name__ == "__main__":
    asyncio.run(final_atomic_reset())
