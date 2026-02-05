
import asyncio
from sqlalchemy import text
from back.database import engine

async def fix_alembic():
    async with engine.begin() as conn:
        print("Checking alembic_version...")
        result = await conn.execute(text("SELECT version_num FROM alembic_version"))
        current = result.scalar()
        print(f"Current version in DB: {current}")
        
        target = "b56f8c2a7780"
        print(f"Updating to {target}...")
        await conn.execute(text(f"UPDATE alembic_version SET version_num = '{target}'"))
        print("Done.")

if __name__ == "__main__":
    asyncio.run(fix_alembic())
