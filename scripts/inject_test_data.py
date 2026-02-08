
import asyncio
import sys
import os
from datetime import date

# 프로젝트 루트 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import fetch_one, execute, insert_and_return

async def inject_today_work():
    print("=== [데이터 긴급 주입] 오늘 날짜 작업 할당 시작 ===")

    # 1. '이목수' (worker_mok1) 사용자 찾기
    user = await fetch_one("SELECT id, full_name FROM sys_users WHERE username = :username", {"username": "worker_mok1"})
    
    if not user:
        # 혹시 username이 다를 수 있으니 이름으로도 검색
        user = await fetch_one("SELECT id, full_name FROM sys_users WHERE full_name LIKE :name", {"name": "%이목수%"})
    
    if not user:
        print("[실패] '이목수' 또는 'worker_mok1' 사용자를 찾을 수 없습니다.")
        return

    print(f"[확인] 사용자 발견: {user['full_name']} (ID: {user['id']})")
    
    today = date.today()
    print(f"[설정] 오늘 날짜: {today}")

    # 2. 오늘 날짜의 작업 계획이 있는지 확인
    # 없다면 샘플로 하나 만듭니다. (zone_id=5 임의 지정 - 도면상 중앙 쯤)
    task = await fetch_one("""
        SELECT id FROM daily_work_plans 
        WHERE date = :today AND project_id = 1
        ORDER BY id DESC LIMIT 1
    """, {"today": today})

    task_id = None

    if task:
        task_id = task['id']
        print(f"[확인] 오늘 이미 생성된 작업(ID: {task_id})이 존재합니다.")
    else:
        # 오늘 작업이 없으면 하나 만듦 (2F-C3 구역 쯤으로 가정)
        # zone_id는 DB에 있는 유효한 값이어야 함. 
        # 안전하게 2F 구역 중 하나 조회
        zone = await fetch_one("SELECT id, name FROM project_zones WHERE project_id = 1 AND level='2F' LIMIT 1")
        if not zone:
            print("[오류] 2F 구역 정보를 찾을 수 없습니다. Zone 데이터를 먼저 확인하세요.")
            return
            
        print(f"[생성] 오늘 작업이 없어서 새로 생성합니다. (구역: {zone['name']})")
        
        new_task = await insert_and_return("""
            INSERT INTO daily_work_plans (project_id, zone_id, work_info_id, date, description, calculated_risk_score, status)
            VALUES (1, :zone_id, 1, :today, '긴급 배관 점검 및 보수', 80, 'IN_PROGRESS')
            RETURNING id
        """, {"zone_id": zone['id'], "today": today})
        task_id = new_task['id']

    # 3. 해당 작업에 이목수 배정
    # 이미 배정되어 있는지 확인
    assigned = await fetch_one("""
        SELECT * FROM daily_worker_users WHERE plan_id = :pid AND worker_id = :uid
    """, {"pid": task_id, "uid": user['id']})

    if assigned:
        print(f"[완료] 이미 작업(ID: {task_id})에 배정되어 있습니다.")
    else:
        await execute("""
            INSERT INTO daily_worker_users (plan_id, worker_id)
            VALUES (:pid, :uid)
        """, {"pid": task_id, "uid": user['id']})
        print(f"[성공] 작업(ID: {task_id})에 {user['full_name']} 님을 배정했습니다!")

    print("\n=== 이제 앱을 새로고침하면 '내 작업 위치'가 뜰 것입니다. ===")

if __name__ == "__main__":
    asyncio.run(inject_today_work())
