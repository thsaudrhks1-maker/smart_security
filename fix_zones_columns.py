
import asyncio
from back.database import execute

async def add_missing_columns():
    print("--- Adding created_at and updated_at to zones table ---")
    try:
        await execute("ALTER TABLE zones ADD COLUMN created_at TIMESTAMP DEFAULT NOW()")
        print("Added created_at")
    except Exception as e:
        print(f"created_at error: {e}")

    try:
        await execute("ALTER TABLE zones ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()")
        print("Added updated_at")
    except Exception as e:
        print(f"updated_at error: {e}")

if __name__ == "__main__":
    asyncio.run(add_missing_columns())
