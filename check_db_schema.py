
import asyncio
from back.database import fetch_all, execute

async def check():
    try:
        # 컬럼 존재 여부 확인
        sql = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'content_safety_info' AND column_name = 'embedding';"
        res = await fetch_all(sql)
        print(f"Column Info: {res}")
        
        if not res:
            print("Adding embedding column as JSONB (Fallback for vector)...")
            await execute("ALTER TABLE content_safety_info ADD COLUMN embedding JSONB;")
            print("Column added successfully.")
    except Exception as e:
        print(f"Check failed: {e}")

if __name__ == "__main__":
    asyncio.run(check())
