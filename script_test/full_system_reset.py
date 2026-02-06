
import asyncio
import os
import sys
import json
import random
import bcrypt
from datetime import date, datetime, timedelta

# 프로젝트 루트를 path에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import execute, fetch_one, insert_and_return

async def fix_sequence(table_name: str):
    """PostgreSQL의 시퀀스를 1로 초기화합니다."""
    try:
        await execute(f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), 1, false)")
    except: pass

async def full_reset():
    print("🧨 [System Reset] 모든 데이터 파괴 및 고퀄리티 시드 주입 시작...")
    
    # 1. 원자 폭탄급 초기화
    tables_to_truncate = [
        "companies", "users", "projects", "sites", "zones", 
        "work_templates", "safety_resources", "daily_work_plans", 
        "attendance", "notices", "weather", "project_members", "project_participants", "worker_allocations"
    ]
    
    try:
        truncate_sql = f"TRUNCATE TABLE {', '.join(tables_to_truncate)} RESTART IDENTITY CASCADE"
        await execute(truncate_sql)
        print("🧹 모든 테이블 비우기 및 시퀀스 초기화 완료")
    except Exception as e:
        print(f"⚠️ 초기화 중 오류 발생: {e}")

    today = date.today()

    # 비밀번호 해시 전용 함수
    def get_hash(pw: str):
        return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    pw_hash = get_hash("1234") # 모든 계정 초기 비밀번호 1234

    # 2. 업체 생성
    c1 = await insert_and_return("INSERT INTO companies (name, type, trade_type) VALUES ('현대건설(원청)', 'GENERAL', '종합') RETURNING id", {})
    c3 = await insert_and_return("INSERT INTO companies (name, type, trade_type) VALUES ('한성전력(협력)', 'SPECIALTY', '전기') RETURNING id", {})
    
    # 3. 사용자 생성 (admin, manager1 포함)
    admin = await insert_and_return(
        "INSERT INTO users (username, full_name, role, company_id, hashed_password) VALUES ('admin', '김소장(Admin)', 'admin', :cid, :pw) RETURNING id",
        {"cid": c1["id"], "pw": pw_hash}
    )
    
    manager = await insert_and_return(
        "INSERT INTO users (username, full_name, role, company_id, hashed_password) VALUES ('manager1', '이관리(Manager)', 'admin', :cid, :pw) RETURNING id",
        {"cid": c1["id"], "pw": pw_hash}
    )
    
    workers_info = [
        {"u": "worker1", "n": "강공남"}, {"u": "worker2", "n": "이안전"},
        {"u": "worker3", "n": "박철수"}, {"u": "worker4", "n": "최건설"},
        {"u": "worker5", "n": "정기공"}
    ]
    worker_ids = []
    for w in workers_info:
        res = await insert_and_return(
            "INSERT INTO users (username, full_name, role, company_id, hashed_password) VALUES (:u, :n, 'worker', :cid, :pw) RETURNING id",
            {"u": w["u"], "n": w["n"], "cid": c3["id"], "pw": pw_hash}
        )
        worker_ids.append(res["id"])

    # 4. 프로젝트 및 현장
    proj = await insert_and_return("INSERT INTO projects (name, status) VALUES ('스마트 시큐리티 통합 프로젝트', 'ACTIVE') RETURNING id", {})
    pid = proj["id"]
    await execute("INSERT INTO project_participants (project_id, company_id, role) VALUES (:pid, :cid, 'CONSTRUCTOR')", {"pid": pid, "cid": c1["id"]})
    
    site = await insert_and_return("INSERT INTO sites (project_id, name) VALUES (:pid, '강남 신축 현장') RETURNING id", {"pid": pid})
    
    # 모든 사용자를 프로젝트 멤버로 등록
    for uid in [admin["id"], manager["id"]] + worker_ids:
        await execute("INSERT INTO project_members (project_id, user_id, role_name, status, joined_at) VALUES (:pid, :uid, '멤버', 'ACTIVE', :today)", {"pid": pid, "uid": uid, "today": today})

    # 5x5 그리드 생성
    base_lat, base_lng = 37.5665, 126.9780
    zone_ids = []
    for f in ["B2", "B1", "1F", "2F"]:
        for x in range(5):
            for y in range(5):
                z = await insert_and_return(
                    "INSERT INTO zones (site_id, name, level, lat, lng, type) VALUES (:sid, :name, :lvl, :lat, :lng, 'INDOOR') RETURNING id",
                    {"sid": site["id"], "name": f"{f}-{x+1}열-{y+1}행", "lvl": f, "lat": base_lat + (x * 0.0002), "lng": base_lng + (y * 0.0002)}
                )
                zone_ids.append(z["id"])

    # 5. 출역 데이터
    for i in range(7):
        target_date = today - timedelta(days=i)
        for wid in worker_ids:
            check_in = datetime.combine(target_date, datetime.min.time()) + timedelta(hours=7, minutes=random.randint(0, 59))
            check_out = datetime.combine(target_date, datetime.min.time()) + timedelta(hours=17, minutes=random.randint(0, 80)) if target_date < today else None
            await execute(
                "INSERT INTO attendance (user_id, project_id, date, status, check_in_time, check_out_time) VALUES (:uid, :pid, :date, 'PRESENT', :cin, :cout)",
                {"uid": wid, "pid": pid, "date": target_date, "cin": check_in, "cout": check_out}
            )

    # 6. 🛡️ 고퀄리티 안전 콘텐츠
    print("🛡️ 안전 콘텐츠 등록 중...")
    resources = [
        {"n": "일반 안전모", "t": "PPE", "i": "hard-hat", "s": ["턱끈을 반드시 조일 것", "충격 흔적이 있는 것은 교체"]},
        {"n": "작업용 안전화", "t": "PPE", "i": "boot", "s": ["뒤축을 꺾어 신지 말 것", "바닥 마모 상태 확인"]},
        {"n": "그네형 안전대", "t": "PPE", "i": "harness", "s": ["D링 위치가 등 중앙에 오도록", "상단 지지물에 확실히 체결"]}
    ]
    res_ids = {}
    for r in resources:
        res = await insert_and_return(
            "INSERT INTO safety_resources (name, type, icon, safety_rules) VALUES (:n, :t, :i, :s) RETURNING id",
            {"n": r["n"], "t": r["t"], "i": r["i"], "s": json.dumps(r["s"])}
        )
        res_ids[r["n"]] = res["id"]

    tmpl = await insert_and_return(
        "INSERT INTO work_templates (work_type, base_risk_score, checklist_items) VALUES ('고소 비계 작업', 85, :cli) RETURNING id",
        {"wt": "고소 비계 작업", "brs": 85, "cli": json.dumps(["비계 기둥 하부 고정 확인", "안전난간 설치 확인"])}
    )
    tid = tmpl["id"]
    for need in ["일반 안전모", "작업용 안전화", "그네형 안전대"]:
        await execute("INSERT INTO template_resource_map (template_id, resource_id) VALUES (:tid, :rid)", {"tid": tid, "rid": res_ids[need]})

    # 7. 강공남 작업 배정
    plan = await insert_and_return(
        "INSERT INTO daily_work_plans (site_id, zone_id, template_id, date, description, status, calculated_risk_score) VALUES (:sid, :zid, :tid, :today, '1F 비계 조립', 'IN_PROGRESS', 85) RETURNING id",
        {"sid": site["id"], "zid": zone_ids[50], "tid": tid, "today": today}
    )
    await execute("INSERT INTO worker_allocations (plan_id, worker_id, role) VALUES (:pid, :wid, '비계공')", {"pid": plan["id"], "wid": worker_ids[0]})

    print("\n✅ 모든 초기화 및 데이터 주입 완료!")
    print("---------------------------------------")
    print("🔑 로그인 정보:")
    print("- 아이디: manager1")
    print("- 비밀번호: 1234 (또는 개발용 0000)")
    print("---------------------------------------")

if __name__ == "__main__":
    asyncio.run(full_reset())
