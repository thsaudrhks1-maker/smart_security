import asyncio
import sys
import os
from datetime import datetime

# 프로젝트 루트 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from back.database import AsyncSessionLocal

async def seed_today_work():
    # 1. 추가 템플릿 확보 (전기, 안전점검)
    additional_templates = [
        {
            "work_type": "전기 입선/배선",
            "base_risk": 40,
            "ppe": ["안전모", "절연장갑"],
            "check_items": ["전원 차단 확인", "접지 상태 확인"]
        },
        {
            "work_type": "안전 시설물 점검",
            "base_risk": 10,
            "ppe": ["안전모", "안전화"],
            "check_items": ["난간대 흔들림 확인", "개구부 덮개 확인"]
        }
    ]

    # 2. 오늘의 작업 시나리오
    today = datetime.now().strftime("%Y-%m-%d")
    
    # (Template ID는 DB 조회해서 가져와야 하나, 간단하게 Subquery나 하드코딩 대신 이름을 매핑 로직으로 처리)
    # 여기서는 SQL로 직접 템플릿 이름으로 ID를 찾아 넣는 방식을 씀.
    
    plans = [
        {
            "site_id": 1,
            "date": today,
            "work_type": "용접/절단",  # Template Name
            "zone_name": "101동 1F",  # Zone Name
            "desc": "101동 1F 배관 용접 작업",
            "flags": '["WELDING_MACHINE"]',
            "status": "IN_PROGRESS",
            "risk": 65
        },
        {
            "site_id": 1,
            "date": today,
            "work_type": "타워크레인 양중",
            "zone_name": "외부 자재 야적장",
            "desc": "B구역 자재 양중 (철근)",
            "flags": '["CRANE"]',
            "status": "PLANNED",
            "risk": 85
        },
        {
            "site_id": 1,
            "date": today,
            "work_type": "전기 입선/배선",
            "zone_name": "지하 주차장",
            "desc": "지하 1층 전기 배선 작업",
            "flags": '[]',
            "status": "IN_PROGRESS",
            "risk": 40
        },
        {
            "site_id": 1,
            "date": today,
            "work_type": "안전 시설물 점검",
            "zone_name": "101동 2F",
            "desc": "현장 안전 시설물 정기 점검",
            "flags": '[]',
            "status": "DONE",
            "risk": 15
        }
    ]

    async with AsyncSessionLocal() as session:
        print("🌱 Seeding Today's Work Plans...")
        
        # 1. Insert Additional Templates
        for t in additional_templates:
            import json
            await session.execute(text("""
                INSERT INTO work_templates (work_type, base_risk_score, required_ppe, checklist_items)
                VALUES (:type, :risk, :ppe, :check)
                ON CONFLICT (work_type) DO NOTHING
            """), {
                "type": t["work_type"],
                "risk": t["base_risk"],
                "ppe": json.dumps(t["ppe"], ensure_ascii=False),
                "check": json.dumps(t["check_items"], ensure_ascii=False)
            })
            
        # 2. Insert Plans
        # 기존 Plans 삭제 (중복 방지)
        await session.execute(text("DELETE FROM daily_work_plans"))
        
        for p in plans:
            # Find IDs (이름 매칭 시도 -> 실패 시 Like 검색 -> 실패 시 1번 강제 할당)
            t_res = await session.execute(text(f"SELECT id FROM work_templates WHERE work_type = '{p['work_type']}'"))
            tid = t_res.scalar()
            
            # 템플릿 이름이 정확하지 않을 수 있으니 LIKE 검색 시도
            if not tid:
                t_res = await session.execute(text(f"SELECT id FROM work_templates WHERE work_type LIKE '%{p['work_type'].split('/')[0]}%' LIMIT 1"))
                tid = t_res.scalar()
                
            if not tid:
                print(f"⚠️ Warning: Template not found for '{p['work_type']}'. Using ID 1.")
                tid = 1 # Fallback
            
            z_res = await session.execute(text(f"SELECT id FROM zones WHERE name = '{p['zone_name']}'"))
            zid = z_res.scalar()
            
            if not zid:
                print(f"⚠️ Warning: Zone not found for '{p['zone_name']}'. Using ID 1.")
                zid = 1 # Fallback

            await session.execute(text("""
                INSERT INTO daily_work_plans (site_id, zone_id, template_id, date, description, equipment_flags, status, calculated_risk_score, created_at)
                VALUES (:site_id, :zid, :tid, :date, :desc, :flags, :status, :risk, now())
            """), {
                "site_id": p["site_id"],
                "zid": zid,
                "tid": tid,
                "date": p["date"],
                "desc": p["desc"],
                "flags": p["flags"], # Already JSON string
                "status": p["status"],
                "risk": p["risk"]
            })
            print(f" -> Inserted plan: {p['desc']}")
        
        await session.commit()
        print("✅ Daily Plans Inserted.")

if __name__ == "__main__":
    asyncio.run(seed_today_work())
