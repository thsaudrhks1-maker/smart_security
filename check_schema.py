
import asyncio
from back.database import fetch_all

async def check_schema():
    try:
        # Check all tables
        sql_tables = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        """
        tables = await fetch_all(sql_tables)
        print("Tables in public schema:")
        for t in tables:
            print(f"- {t['table_name']}")
            
        # Check columns of daily_notices
        sql_cols = """
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'daily_notices';
        """
        columns = await fetch_all(sql_cols)
        print("\nColumns in daily_notices:")
        for col in columns:
            print(f"- {col['column_name']} ({col['data_type']})")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_schema())
