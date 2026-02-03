import asyncio
from sqlalchemy import select
from back.database import AsyncSessionLocal
from back.project.model import Project

async def check_projects():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Project))
        projects = result.scalars().all()
        print(f"Total projects found: {len(projects)}")
        for p in projects:
            print(f"ID: {p.id}, Name: {p.name}")

if __name__ == "__main__":
    asyncio.run(check_projects())
