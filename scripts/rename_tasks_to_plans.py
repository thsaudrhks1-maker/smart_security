
import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from back.database import execute

async def rename_table():
    print("=== [DB Migration] daily_work_tasks -> daily_work_plans 변경 ===")
    try:
        # 1. 테이블 이름 변경
        await execute("ALTER TABLE IF EXISTS daily_work_tasks RENAME TO daily_work_plans")
        print("[성공] 테이블 이름 변경 완료: daily_work_tasks -> daily_work_plans")
        
        # 2. 시퀀스 이름 변경 (선택사항)
        try:
             await execute("ALTER SEQUENCE IF EXISTS daily_work_tasks_id_seq RENAME TO daily_work_plans_id_seq")
             print("[성공] 시퀀스 이름 변경 완료")
        except Exception as e:
             print(f"[정보] 시퀀스 변경 건너뜀 (이미 변경되었거나 권한 부족 등): {e}")

    except Exception as e:
        print(f"[오류] 테이블 변경 실패: {e}")

if __name__ == "__main__":
    asyncio.run(rename_table())
