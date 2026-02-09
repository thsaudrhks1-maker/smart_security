
import asyncio
from back.database import execute

async def fix_table():
    print("Starting DB fix...")
    try:
        # 1. Rename is_emergency to notice_type if it hasn't been renamed yet
        # (Using a try-except block in SQL is safer)
        await execute("""
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_notices' AND column_name = 'is_emergency') THEN
                    ALTER TABLE daily_notices RENAME COLUMN is_emergency TO notice_type;
                END IF;
            END $$;
        """)
        print("Step 1: Renamed if needed")

        # 2. Add notice_role, created_by, and created_at if missing
        await execute("ALTER TABLE daily_notices ADD COLUMN IF NOT EXISTS notice_role VARCHAR(50)")
        await execute("ALTER TABLE daily_notices ADD COLUMN IF NOT EXISTS created_by INTEGER")
        await execute("ALTER TABLE daily_notices ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        print("Step 2: Ensured notice_role, created_by, created_at columns exist")

        # 3. Change notice_type from BOOLEAN to VARCHAR
        # Check current type first
        from back.database import fetch_one
        type_info = await fetch_one("SELECT data_type FROM information_schema.columns WHERE table_name = 'daily_notices' AND column_name = 'notice_type'")
        
        if type_info and type_info['data_type'] == 'boolean':
            print("Step 3: notice_type is boolean. Changing to VARCHAR(50)...")
            await execute("""
                ALTER TABLE daily_notices 
                ALTER COLUMN notice_type TYPE VARCHAR(50) 
                USING (CASE WHEN notice_type THEN 'EMERGENCY' ELSE 'NORMAL' END);
            """)
            print("Successfully changed notice_type to VARCHAR")
        else:
            print(f"Step 3: notice_type is already {type_info['data_type'] if type_info else 'unknown'}")

        print("DB fix completed successfully!")
    except Exception as e:
        print(f"Error during DB fix: {e}")

if __name__ == "__main__":
    asyncio.run(fix_table())
