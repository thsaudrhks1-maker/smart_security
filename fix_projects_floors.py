
import asyncio
from back.database import execute, fetch_all

async def fix_projects_columns():
    cols = await fetch_all("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'")
    existing_cols = [c['column_name'] for c in cols]
    
    if 'basement_floors' not in existing_cols:
        print("Adding basement_floors column...")
        await execute("ALTER TABLE projects ADD COLUMN basement_floors INTEGER DEFAULT 0")
    
    if 'ground_floors' not in existing_cols:
        print("Adding ground_floors column...")
        await execute("ALTER TABLE projects ADD COLUMN ground_floors INTEGER DEFAULT 1")
    
    print("Projects table check complete.")

if __name__ == "__main__":
    asyncio.run(fix_projects_columns())
