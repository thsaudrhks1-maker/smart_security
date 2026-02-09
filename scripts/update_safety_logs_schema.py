
from back.database import engine
from sqlalchemy import text
import asyncio

async def add_columns():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE daily_safety_logs ADD COLUMN plan_id INTEGER REFERENCES daily_work_plans(id) ON DELETE SET NULL"))
            print("Added plan_id column")
        except Exception as e:
            print(f"plan_id column might already exist or error: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE daily_safety_logs ADD COLUMN checklist_data JSON"))
            print("Added checklist_data column")
        except Exception as e:
            print(f"checklist_data column might already exist or error: {e}")

if __name__ == "__main__":
    asyncio.run(add_columns())
