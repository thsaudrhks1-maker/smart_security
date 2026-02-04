import asyncio
import sys
import os
from datetime import datetime

# 프로젝트 루트 경로를 파이썬 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from back.database import execute, fetch_one, insert_and_return, fetch_all

async def update_zones_5x5():
    print("🧹 기존 Zone 데이터 확인 중...")
    
    # 1. Site ID 조회 (가장 최근 현장 하나 선택)
    site = await fetch_one("SELECT id FROM sites ORDER BY id DESC LIMIT 1")
    if not site:
        print("❌ 현장(Site) 데이터가 없습니다. 먼저 reset_scenario.py를 실행하세요.")
        return
    site_id = site['id']
    print(f"📍 대상 Site ID: {site_id}")

    # 2. 기존 Zone 삭제 (CASCADE 처리를 위해 연관 데이터 먼저 삭제하거나 수동 처리)
    # 실제 운영 환경이라면 주의해야 하지만, 테스트 환경이므로 과감하게 삭제
    print("🗑️ 기존 Zone 및 연관 데이터(작업계획 등) 삭제 중...")
    await execute("DELETE FROM daily_danger_zones WHERE zone_id IN (SELECT id FROM zones WHERE site_id = :site_id)", {"site_id": site_id})
    await execute("DELETE FROM worker_allocations WHERE plan_id IN (SELECT id FROM daily_work_plans WHERE zone_id IN (SELECT id FROM zones WHERE site_id = :site_id))", {"site_id": site_id})
    await execute("DELETE FROM daily_work_plans WHERE zone_id IN (SELECT id FROM zones WHERE site_id = :site_id)", {"site_id": site_id})
    await execute("DELETE FROM zones WHERE site_id = :site_id", {"site_id": site_id})
    
    # 3. 5x5 Grid 생성
    center_lat, center_lng = 37.56600, 126.97800
    step = 0.00025
    
    print("🌱 25개(5x5) Zone 데이터 생성 중...")
    
    # 가로(lng) 5열, 세로(lat) 5행
    # col: -2, -1, 0, 1, 2
    # row: 2, 1, 0, -1, -2
    
    zones_to_insert = []
    for r in range(5): # 행 (위 -> 아래)
        for c in range(5): # 열 (왼쪽 -> 오른쪽)
            lat = round(center_lat + (2 - r) * step, 6)
            lng = round(center_lng + (c - 2) * step, 6)
            
            # 구역명 (예: A1, A2, ..., E5)
            row_label = chr(65 + r) # A, B, C, D, E
            col_label = c + 1
            name = f"Zone {row_label}{col_label}"
            
            zone_data = {
                "site_id": site_id,
                "name": name,
                "level": "1F",
                "type": "INDOOR",
                "lat": lat,
                "lng": lng,
                "default_hazards": None
            }
            zones_to_insert.append(zone_data)

    # bulk insert 대신 하나씩 insert_and_return (helper 함수 활용)
    for zone in zones_to_insert:
        sql = """
            INSERT INTO zones (site_id, name, level, type, lat, lng)
            VALUES (:site_id, :name, :level, :type, :lat, :lng)
        """
        await execute(sql, zone)
        
    print(f"✅ 총 {len(zones_to_insert)}개의 Zone이 성공적으로 생성되었습니다.")
    
    # 4. (보너스) 최소한의 작업 계획 하나 생성 (대시보드 확인용)
    new_zones = await fetch_all("SELECT id FROM zones WHERE site_id = :site_id ORDER BY name", {"site_id": site_id})
    if new_zones:
        # 중앙 구역 (Zone C3)에 작업 하나 추가
        center_zone_id = new_zones[12]['id']
        template = await fetch_one("SELECT id FROM work_templates LIMIT 1")
        if template:
            await execute("""
                INSERT INTO daily_work_plans (site_id, zone_id, template_id, date, description, status, calculated_risk_score, created_at)
                VALUES (:site_id, :zone_id, :template_id, :date, :desc, 'PLANNED', 50, NOW())
            """, {
                "site_id": site_id,
                "zone_id": center_zone_id,
                "template_id": template['id'],
                "date": datetime.now().date(),
                "desc": "5x5 그리드 테스트 작업"
            })
            print("📝 중앙 구역(C3)에 테스트 작업 계획을 추가했습니다.")

if __name__ == "__main__":
    asyncio.run(update_zones_5x5())
