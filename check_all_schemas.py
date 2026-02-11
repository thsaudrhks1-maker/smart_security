
import asyncio
from back.database import fetch_all

async def check_schemas():
    tables = ['daily_notices', 'daily_notice_reads', 'sys_users', 'sys_companies', 'content_safety_info']
    for table in tables:
        print(f"\n📊 [{table}] 테이블 구조:")
        sql = f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}';"
        try:
            rows = await fetch_all(sql)
            if rows:
                for row in rows:
                    print(f" - {row['column_name']}: {row['data_type']}")
            else:
                print(" ❌ 테이블이 존재하지 않거나 컬럼이 없습니다.")
        except Exception as e:
            print(f" ❌ 오류 발생: {e}")

if __name__ == "__main__":
    asyncio.run(check_schemas())
