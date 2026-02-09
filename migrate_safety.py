
import asyncio
from back.database import execute

async def main():
    print("Migrating daily_danger_zones...")
    try:
        await execute("ALTER TABLE daily_danger_zones ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'PENDING'")
        await execute("ALTER TABLE daily_danger_zones ADD COLUMN IF NOT EXISTS reporter_id INTEGER REFERENCES sys_users(id) ON DELETE SET NULL")
        print("Migrating daily_danger_images...")
        await execute("ALTER TABLE daily_danger_images ADD COLUMN IF NOT EXISTS danger_info_id INTEGER REFERENCES content_danger_info(id) ON DELETE SET NULL")
        await execute("ALTER TABLE daily_danger_images ADD COLUMN IF NOT EXISTS note TEXT")
        print("✅ Migration Successful!")
    except Exception as e:
        print(f"❌ Migration Failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
