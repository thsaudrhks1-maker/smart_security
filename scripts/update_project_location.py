import asyncio
import sys
import os

# Ensure the parent directory is in the python path
sys.path.append(os.getcwd())

from sqlalchemy import select, update
from back.database import AsyncSessionLocal
from back.project.master.model import project_master

async def main():
    async with AsyncSessionLocal() as session:
        # Search for project
        print("Searching for project with name containing '세종'...")
        result = await session.execute(select(project_master).where(project_master.name.like('%세종%')))
        projects = result.scalars().all()
        
        if not projects:
            print("No project found with name like '%세종%'")
            return

        target_project = projects[0]
        print(f"Found project: {target_project.name} (ID: {target_project.id})")
        print(f"Old Address: {target_project.location_address}")
        print(f"Old Coords: {target_project.lat}, {target_project.lng}")
        
        # New details
        new_address = "서울특별시 금천구 가산디지털1로 128 (가산동, 에스티엑스브이타워)"
        # Coordinates for STX V-Tower, Gasan
        new_lat = 37.476985
        new_lng = 126.883723
        
        print(f"Updating to:\nAddress: {new_address}\nLat: {new_lat}, Lng: {new_lng}")

        stmt = (
            update(project_master)
            .where(project_master.id == target_project.id)
            .values(location_address=new_address, lat=new_lat, lng=new_lng)
        )
        
        await session.execute(stmt)
        await session.commit()
        print("Project updated successfully.")
        
        # Verify
        result = await session.execute(select(project_master).where(project_master.id == target_project.id))
        updated_project = result.scalar_one()
        print(f"Verified New Address: {updated_project.location_address}")
        print(f"Verified New Coords: {updated_project.lat}, {updated_project.lng}")

if __name__ == "__main__":
    try:
        if sys.platform == 'win32':
             asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        asyncio.run(main())
    except Exception as e:
        print(f"Error: {e}")
