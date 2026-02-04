import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from back.database import fetch_all

async def main():
    users = await fetch_all("SELECT id, username, full_name, role FROM users")
    for u in users:
        print(f"ID: {u['id']}, Name: {u['full_name']}, Role: {u['role']}, Username: {u['username']}")

if __name__ == "__main__":
    asyncio.run(main())
