
import asyncio
from sqlalchemy import text
from back.database import engine, execute, fetch_all

async def fix_schema():
    print("🔍 [SCHEMA] daily_notices 테이블 구조 확인 중...")
    
    # 1. 컬럼 확인
    check_sql = "SELECT column_name FROM information_schema.columns WHERE table_name = 'daily_notices';"
    try:
        rows = await fetch_all(check_sql)
        columns = [row['column_name'] for row in rows]
        print(f"📊 현재 컬럼: {columns}")
        
        # 2. date 컬럼 추가
        if 'date' not in columns:
            print("🚀 'date' 컬럼이 누락되었습니다. 추가를 시작합니다...")
            # PostgreSQL에서 DATE 타입 컬럼 추가, 기본값은 오늘
            alter_sql = "ALTER TABLE daily_notices ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;"
            await execute(alter_sql)
            print("✅ 'date' 컬럼 추가 완료!")
        else:
            print("✅ 'date' 컬럼이 이미 존재합니다.")

    except Exception as e:
        print(f"❌ 스키마 수정 중 오류 발생: {e}")

if __name__ == "__main__":
    asyncio.run(fix_schema())
