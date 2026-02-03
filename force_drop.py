import asyncio
from back.database import engine
from sqlalchemy import text

async def reset_attendance_table():
    async with engine.begin() as conn:
        print("Cleaning up tables...")
        # notices도 충돌 나고 있으니 같이 정리
        await conn.execute(text("DROP TABLE IF EXISTS attendance CASCADE;"))
        await conn.execute(text("DROP TABLE IF EXISTS notices CASCADE;"))
        print("Tables dropped successfully.")

if __name__ == "__main__":
    asyncio.run(reset_attendance_table())
