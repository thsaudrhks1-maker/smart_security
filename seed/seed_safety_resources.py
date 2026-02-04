"""
증분 시딩: safety_resources + template_resource_map 만 채움.
기존 DB 데이터(사용자, 프로젝트, 출근 등)는 건드리지 않음.
여러 번 실행해도 이미 있으면 스킵. description/safety_rules 비어 있으면 채움.
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from back.database import AsyncSessionLocal
from back.work.model import WorkTemplate, SafetyResource, TemplateResourceMap
from seed.safety_resource_data import RESOURCES as SAFETY_RESOURCE_ROWS, TEMPLATE_RESOURCE_NAMES


async def run():
    async with AsyncSessionLocal() as db:
        # 1) safety_resources: 없을 때만 30종 삽입
        r = await db.execute(text("SELECT COUNT(*) FROM safety_resources"))
        count = int(r.scalar() or 0)
        if count == 0:
            print("🦺 safety_resources 비어 있음 → 30종 삽입 중 (설명·안전수칙 포함)...")
            for r in SAFETY_RESOURCE_ROWS:
                db.add(SafetyResource(**r))
            await db.commit()
            print("   완료.")
        else:
            print(f"🦺 safety_resources 이미 {count}건 있음 → description/safety_rules 비어 있으면 채움.")
            res = await db.execute(select(SafetyResource.id, SafetyResource.name, SafetyResource.description))
            for row in res.all():
                rid, rname, desc = row[0], row[1], row[2]
                if desc is not None:
                    continue
                match = next((r for r in SAFETY_RESOURCE_ROWS if r["name"] == rname), None)
                if match:
                    await db.execute(
                        update(SafetyResource).where(SafetyResource.id == rid).values(
                            description=match.get("description"),
                            safety_rules=match.get("safety_rules"),
                        )
                    )
            await db.commit()

        # 2) resource 이름 -> id 맵
        res = await db.execute(select(SafetyResource.id, SafetyResource.name))
        name_to_id = {row[1]: row[0] for row in res.all()}

        # 3) work_templates 조회
        tmpl = await db.execute(select(WorkTemplate.id, WorkTemplate.work_type))
        templates = tmpl.all()

        # 4) template_resource_map: 없는 연결만 추가
        existing = set()
        r2 = await db.execute(
            text("SELECT template_id, resource_id FROM template_resource_map")
        )
        for row in r2:
            existing.add((row[0], row[1]))

        added = 0
        for template_id, work_type in templates:
            names = TEMPLATE_RESOURCE_NAMES.get(work_type)
            if not names:
                continue
            for rname in names:
                rid = name_to_id.get(rname)
                if rid is None:
                    continue
                if (template_id, rid) in existing:
                    continue
                db.add(TemplateResourceMap(template_id=template_id, resource_id=rid))
                existing.add((template_id, rid))
                added += 1
        await db.commit()
        print(f"🔗 template_resource_map 연결 {added}건 추가 완료.")


if __name__ == "__main__":
    asyncio.run(run())
