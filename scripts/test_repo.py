
import asyncio
from back.project.locations.repository import locations_repository

async def test():
    try:
        zones = await locations_repository.get_zones_with_details(1, '2026-02-09')
        for zone in zones:
            for task in zone.get('tasks', []):
                print(f"Zone: {zone['name']}, Task: {task['description']}, Checklist Type: {type(task['checklist_items'])}, Value: {task['checklist_items']}")
    except Exception as e:
        print(e)

if __name__ == "__main__":
    asyncio.run(test())
