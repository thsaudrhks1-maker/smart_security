import asyncio
from back.database import execute

async def fix_users_schema():
    print("Checking and fixing users table schema...")
    
    # 1. job_type 컬럼 추가 (없을 경우)
    try:
        await execute("ALTER TABLE users ADD COLUMN job_type VARCHAR")
        print("✅ Added 'job_type' column to users table.")
    except Exception as e:
        if "already exists" in str(e):
            print("ℹ️ 'job_type' column already exists.")
        else:
            print(f"❌ Error adding 'job_type': {e}")

    # 2. title 컬럼 추가 (없을 경우)
    try:
        await execute("ALTER TABLE users ADD COLUMN title VARCHAR")
        print("✅ Added 'title' column to users table.")
    except Exception as e:
        if "already exists" in str(e):
            print("ℹ️ 'title' column already exists.")
        else:
            print(f"❌ Error adding 'title': {e}")

    # 3. phone 컬럼 추가 (없을 경우)
    try:
        await execute("ALTER TABLE users ADD COLUMN phone VARCHAR")
        print("✅ Added 'phone' column to users table.")
    except Exception as e:
        if "already exists" in str(e):
            print("ℹ️ 'phone' column already exists.")
        else:
            print(f"❌ Error adding 'phone': {e}")

    # 4. birth_date 컬럼 추가 (없을 경우)
    try:
        await execute("ALTER TABLE users ADD COLUMN birth_date DATE")
        print("✅ Added 'birth_date' column to users table.")
    except Exception as e:
        if "already exists" in str(e):
            print("ℹ️ 'birth_date' column already exists.")
        else:
            print(f"❌ Error adding 'birth_date': {e}")

    print("Done.")

if __name__ == "__main__":
    import os
    os.environ["PYTHONPATH"] = "."
    asyncio.run(fix_users_schema())
