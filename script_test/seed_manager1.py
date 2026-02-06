"""
manager1 계정을 sys_users에 추가 (비밀번호 1234).
이미 DB를 쓰는 상태에서 리셋 없이 manager1 로그인만 가능하게 할 때 실행.
실행 위치: 프로젝트 루트
명령: .\venv\Scripts\python script_test/seed_manager1.py
"""
import asyncio
import os
import sys
import bcrypt

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import fetch_one, execute

async def main():
    existing = await fetch_one("SELECT id FROM sys_users WHERE username = :u", {"u": "manager1"})
    pw_hash = bcrypt.hashpw("1234".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    if existing:
        await execute(
            "UPDATE sys_users SET hashed_password = :pw WHERE username = 'manager1'",
            {"pw": pw_hash}
        )
        print("manager1 비밀번호를 1234로 초기화했습니다.")
    else:
        company = await fetch_one("SELECT id FROM sys_companies WHERE type = 'CONSTRUCTOR' LIMIT 1")
        cid = company["id"] if company else None
        await execute(
            "INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES ('manager1', '이관리 과장', 'manager', :cid, :pw)",
            {"cid": cid, "pw": pw_hash}
        )
        print("manager1 계정을 생성했습니다. (비밀번호: 1234)")
    print("이제 manager1 / 1234 로 로그인할 수 있습니다.")

if __name__ == "__main__":
    asyncio.run(main())
