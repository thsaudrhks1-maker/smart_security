import asyncio
import sys
import os
from datetime import datetime

# 프로젝트 루트 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, delete
from back.database import AsyncSessionLocal
from back.work.model import WorkTemplate, DailyWorkPlan
from back.safety.model import Zone

async def seed_today_work():
    # 1. 추가 템플릿 확보 (전기, 안전점검) - ORM 사용
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
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_date = datetime.now().date()
    
    plans_data = [
        {
            "site_id": 1,
            "work_type": "용접/절단",
            "zone_name": "101동 1F",
            "desc": "101동 1F 배관 용접 작업",
            "flags": ["WELDING_MACHINE"],
            "status": "IN_PROGRESS",
            "risk": 65
        },
        {
            "site_id": 1,
            "work_type": "타워크레인 양중",
            "zone_name": "외부 자재 야적장",
            "desc": "B구역 자재 양중 (철근)",
            "flags": ["CRANE"],
            "status": "PLANNED",
            "risk": 85
        },
        {
            "site_id": 1,
            "work_type": "전기 입선/배선",
            "zone_name": "지하 주차장",
            "desc": "지하 1층 전기 배선 작업",
            "flags": [],
            "status": "IN_PROGRESS",
            "risk": 40
        },
        {
            "site_id": 1,
            "work_type": "안전 시설물 점검",
            "zone_name": "101동 2F",
            "desc": "현장 안전 시설물 정기 점검",
            "flags": [],
            "status": "DONE",
            "risk": 15
        }
    ]

    async with AsyncSessionLocal() as session:
        print("🌱 Seeding Today's Work Plans using ORM...")
        
        # 1. Insert Additional Templates if not exist
        for t in additional_templates:
            res = await session.execute(select(WorkTemplate).where(WorkTemplate.work_type == t["work_type"]))
            if not res.scalar_one_or_none():
                session.add(WorkTemplate(
                    work_type=t["work_type"],
                    base_risk_score=t["base_risk"],
                    required_ppe=t["ppe"],
                    checklist_items=t["check_items"]
                ))
        await session.flush()

        # 2. Clear existing plans
        await session.execute(delete(DailyWorkPlan))
        
        for p in plans_data:
            # Find Template
            t_res = await session.execute(select(WorkTemplate).where(WorkTemplate.work_type.like(f"%{p['work_type'].split('/')[0]}%")))
            template = t_res.scalars().first()
            tid = template.id if template else 1
            
            # Find Zone
            z_res = await session.execute(select(Zone).where(Zone.name == p['zone_name']))
            zone = z_res.scalars().first()
            zid = zone.id if zone else 1
            
            new_plan = DailyWorkPlan(
                site_id=p["site_id"],
                zone_id=zid,
                template_id=tid,
                date=today_date,
                description=p["desc"],
                equipment_flags=p["flags"],
                status=p["status"],
                calculated_risk_score=p["risk"]
            )
            session.add(new_plan)
            print(f" -> Prepared plan: {p['desc']}")
        
        await session.commit()
        print("✅ Daily Plans Inserted using ORM.")

if __name__ == "__main__":
    asyncio.run(seed_today_work())
