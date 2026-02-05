
import asyncio
from back.database import execute, fetch_all

async def fix_schema():
    # 1. companies 테이블 체크
    print("Checking 'companies' table...")
    cols = await fetch_all("SELECT column_name FROM information_schema.columns WHERE table_name = 'companies'")
    existing_cols = [c['column_name'] for c in cols]
    if 'created_at' not in existing_cols:
        await execute("ALTER TABLE companies ADD COLUMN created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()")
    if 'updated_at' not in existing_cols:
        await execute("ALTER TABLE companies ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()")
    print("'companies' table checked.")

    # 2. users 테이블 체크
    print("Checking 'users' table...")
    cols = await fetch_all("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
    existing_cols = [c['column_name'] for c in cols]
    if 'created_at' not in existing_cols:
        await execute("ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()")
    print("'users' table checked.")

if __name__ == "__main__":
    asyncio.run(fix_schema())
