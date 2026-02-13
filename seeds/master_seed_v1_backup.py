
import os
import asyncio
import bcrypt
import json
import subprocess
from datetime import date, datetime, timedelta
from dotenv import load_dotenv
from back.database import fetch_one, fetch_all, execute, insert_and_return

async def auto_backup():
    """시딩 전 안전을 위한 백업 (실패해도 진행)"""
    load_dotenv()
    db_name = os.getenv("POSTGRES_DB", "smart_security")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = "db_backups"
    if not os.path.exists(backup_dir): os.makedirs(backup_dir)
    backup_file = os.path.join(backup_dir, f"backup_{timestamp}.sql")
    
    print(f"📦 Attempting backup to: {backup_file}")
    try:
        os.environ["PGPASSWORD"] = os.getenv("POSTGRES_PASSWORD", "0000")
        cmd = ["pg_dump", "-h", "localhost", "-p", "5500", "-U", "postgres", "-F", "c", "-f", backup_file, db_name]
        subprocess.run(cmd, check=True, capture_output=True)
        print("✅ Backup successful.")
    except Exception:
        print("⚠️ pg_dump not found in PATH. Skipping backup and proceeding with seeding...")

async def master_seed():
    # 0. 백업 시도
    await auto_backup()

    print("🧹 1. Resetting Data (Fresh Start, ID rest to 1)...")
    await execute("""
        TRUNCATE sys_companies, sys_users, project_master, project_zones, 
                 project_companies, project_users, daily_work_plans, 
                 daily_worker_users, daily_attendance, daily_notices, daily_safety_logs,
                 daily_danger_zones, daily_danger_images, content_work_info, content_danger_info, daily_notice_reads
        RESTART IDENTITY CASCADE
    """)
    print("✅ System-wide data cleaned.")

    hashed_pw = bcrypt.hashpw("0000".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # --- PHASE 1: 업체 및 유저 ---
    print("🚀 PHASE 1: Seeding Companies & Users...")
    c1 = (await insert_and_return("INSERT INTO sys_companies (name, type) VALUES ('스마트종합건설', 'CONSTRUCTOR') RETURNING id"))['id']
    p1 = (await insert_and_return("INSERT INTO sys_companies (name, type) VALUES ('강철토공', 'PARTNER') RETURNING id"))['id']
    
    users = [
        ("a", "관리자", "admin", c1),
        ("m", "이소장", "manager", c1),
        ("w", "박작업", "worker", p1),
    ]
    for un, fn, r, cid in users:
        await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id) VALUES (:u, :p, :f, :r, :c)",
                      {"u": un, "p": hashed_pw, "f": fn, "r": r, "c": cid})

    # --- PHASE 2: 프로젝트 및 구역 (Step 2 로직) ---
    print("🚀 PHASE 2: Creating Project & Grid...")
    proj = await insert_and_return("""
        INSERT INTO project_master (name, status, grid_cols, grid_rows, grid_spacing, lat, lng, floors_above, floors_below)
        VALUES ('건설안전 가산디지털 현장', 'ACTIVE', 5, 5, 10.0, 37.4772, 126.8841, 3, 1) RETURNING id
    """)
    pid = proj['id']

    for lv in ["B1", "1F", "2F"]:
        for r in range(5):
            for c in range(5):
                name = f"{lv}-{chr(65+r)}{c+1}"
                await execute("INSERT INTO project_zones (project_id, name, level, row_index, col_index) VALUES (:p, :n, :l, :ri, :ci)",
                              {"p": pid, "n": name, "l": lv, "ri": r, "ci": c})

    await execute("INSERT INTO project_users (project_id, user_id, role_name, status) SELECT :p, id, role, 'ACTIVE' FROM sys_users", {"p": pid})

    # --- PHASE 3: 통합 일일 데이터 (Step 3 + New Danger) ---
    print("🚀 PHASE 3: Seeding Comprehensive Daily Data...")
    today = date.today()
    admin_id = (await fetch_one("SELECT id FROM sys_users WHERE username = 'a'"))['id']
    
    # 1. 작업 템플릿 4종 (Step 3 원본 데이터)
    work_templates = [
        {"wt": "철근조립", "brs": 30, "ci": '["안전모", "발판", "결속"]'},
        {"wt": "거푸집 설치", "brs": 40, "ci": '["동바리", "수평", "추락방지망"]'},
        {"wt": "비계 설치", "brs": 50, "ci": '["결속력", "난간", "바닥고정"]'},
        {"wt": "전기 배선", "brs": 20, "ci": '["절연장갑", "차단기", "전선정리"]'},
    ]
    template_ids = {}
    for t in work_templates:
        res = await insert_and_return("INSERT INTO content_work_info (work_type, base_risk_score, checklist_items) VALUES (:wt, :brs, :ci) RETURNING id", t)
        template_ids[t['wt']] = res['id']

    # 2. 위험 요소 마스터 세팅
    dangers = [
        {"type": "굴착 (Excavation)", "icon": "AlertTriangle", "color": "#FF0000", "desc": "깊은 굴착부 추락 위험"},
        {"type": "개구부 (Opening)", "icon": "Skull", "color": "#FF4D4D", "desc": "슬래브 개구부 추락 위험"},
        {"type": "화기 (Fire)", "icon": "Flame", "color": "#FFA500", "desc": "용접 작업 중 화재 위험"}
    ]
    danger_map = {}
    for d in dangers:
        res_d = await insert_and_return("""
            INSERT INTO content_danger_info (danger_type, icon, color, description, risk_level) 
            VALUES (:t, :i, :c, :d, 4) RETURNING id
        """, {"t": d['type'], "i": d['icon'], "c": d['color'], "d": d['desc']})
        danger_map[d['type']] = res_d['id']

    # 3. 오늘의 작업 계획 3종 (Step 3 원본 데이터)
    plan_zones = [
        {"z": "1F-A1", "t": "철근조립", "desc": "1F-A1 구역 기둥 철근 배근"},
        {"z": "1F-B2", "t": "거푸집 설치", "desc": "1F-B2 구역 보 거푸집 조립"},
        {"z": "1F-C3", "t": "전기 배선", "desc": "1F-C3 구역 1층 메인 배선"},
    ]
    for p in plan_zones:
        zone = await fetch_one("SELECT id FROM project_zones WHERE name = :n", {"n": p['z']})
        plan = await insert_and_return("""
            INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, status) 
            VALUES (:pid, :zid, :wid, :d, :desc, 'IN_PROGRESS') RETURNING id
        """, {"pid": pid, "zid": zone['id'], "wid": template_ids[p['t']], "d": today, "desc": p['desc']})
        
        if p['z'] == '1F-A1': # 박작업(w)은 A1 작업에 투입
            worker_w = await fetch_one("SELECT id FROM sys_users WHERE username = 'w'")
            await execute("INSERT INTO daily_worker_users (plan_id, worker_id) VALUES (:pl, :u)", {"pl": plan['id'], "u": worker_w['id']})
            await execute("INSERT INTO daily_attendance (user_id, project_id, date, check_in_time, status) VALUES (:u, :p, :d, now(), 'PRESENT')",
                          {"u": worker_w['id'], "p": pid, "d": today})

    # 4. 동적 위험 구역 및 사진 연동
    # 1F-B2 구역에 굴착 위험
    zone_b2 = await fetch_one("SELECT id FROM project_zones WHERE name = '1F-B2'")
    dz1 = await insert_and_return("""
        INSERT INTO daily_danger_zones (zone_id, danger_info_id, date, description, status, reporter_id)
        VALUES (:zid, :did, :d, 'A동 방면 터파기 굴착부 - 추락 주의', 'APPROVED', :uid) RETURNING id
    """, {"zid": zone_b2['id'], "did": danger_map["굴착 (Excavation)"], "d": today, "uid": admin_id})
    
    img_files1 = ["63_47953b434dcb434a97251c5f5709847d.jpg", "64_de9e241c775042648face74266581eaf.jpg"]
    for img in img_files1:
        await execute("INSERT INTO daily_danger_images (danger_zone_id, image_url, note) VALUES (:dzid, :url, '굴착 현장')", 
                      {"dzid": dz1['id'], "url": img})

    # 1F-C3 구역에 개구부 위험
    zone_c3 = await fetch_one("SELECT id FROM project_zones WHERE name = '1F-C3'")
    dz2 = await insert_and_return("""
        INSERT INTO daily_danger_zones (zone_id, danger_info_id, date, description, status, reporter_id)
        VALUES (:zid, :did, :d, '슬래브 중합 개구부 덮개 불량', 'APPROVED', :uid) RETURNING id
    """, {"zid": zone_c3['id'], "did": danger_map["개구부 (Opening)"], "d": today, "uid": admin_id})
    
    img_files2 = ["66_6fa95652fcec454495e9ed669dbbe9fe.png", "67_39772e2930bf4fb5bca8497b9a3b44b3.jpg"]
    for img in img_files2:
        await execute("INSERT INTO daily_danger_images (danger_zone_id, image_url, note) VALUES (:dzid, :url, '개구부 미조치')", 
                      {"dzid": dz2['id'], "url": img})

    # 5. 신규 승인 대기자 (5명)
    for i in range(1, 6):
        await execute("INSERT INTO sys_users (username, hashed_password, full_name, role, company_id) VALUES (:u, :p, :f, 'worker', :c)",
                      {"u": f"pending_{i}", "p": hashed_pw, "f": f"대기자_{i}", "c": p1})

    # 6. 공지사항 2종 (Step 3 원본 데이터)
    notices = [
        {"t": "오후 강풍 주의보", "c": "오후 2시 강풍 예상, 안전고리 필수!", "nt": "EMERGENCY"},
        {"t": "현장 정리정돈 강조", "c": "작업 종료 후 자재 정리 철저히.", "nt": "NORMAL"},
    ]
    for n in notices:
        await execute("INSERT INTO daily_notices (project_id, date, title, content, notice_type, created_by) VALUES (:p, :d, :t, :c, :nt, :u)",
                      {"p": pid, "d": today, "t": n['t'], "c": n['c'], "nt": n['nt'], "u": admin_id})

    print("✨ Master Seed successfully completed! (Step 1,2,3 All Integrated)")

if __name__ == "__main__":
    asyncio.run(master_seed())
