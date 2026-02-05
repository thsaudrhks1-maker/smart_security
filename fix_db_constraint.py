
import asyncio
from back.database import execute

async def fix_participants_constraint():
    print("--- Fixing project_participants unique constraint ---")
    try:
        # First check if it exists or just try to add it
        # To be safe, we add a UNIQUE constraint on project_id and company_id
        await execute("ALTER TABLE project_participants ADD CONSTRAINT uq_project_company UNIQUE (project_id, company_id)")
        print("Successfully added unique constraint.")
    except Exception as e:
        print(f"Note: {e} (Maybe it already exists?)")

if __name__ == "__main__":
    asyncio.run(fix_participants_constraint())
