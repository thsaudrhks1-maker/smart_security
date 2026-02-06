
import asyncio
import json
import os
import sys
from datetime import datetime, date, time
from decimal import Decimal

# 프로젝트 루트 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import fetch_all, execute

def json_serial(obj):
    """JSON에 담을 수 없는 날짜/시간/숫자 객체 변환"""
    if isinstance(obj, (datetime, date, time)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

async def backup_all_tables():
    print("📂 [Backup] 데이터 백업 작업을 시작합니다...")
    
    # 1. 현재 DB의 모든 테이블 목록 조회
    tables_sql = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """
    tables = await fetch_all(tables_sql)
    table_names = [t['table_name'] for t in tables]
    
    backup_result = {}
    
    for table in table_names:
        try:
            print(f" - {table} 테이블 추출 중...")
            rows = await fetch_all(f"SELECT * FROM {table}")
            backup_result[table] = rows
        except Exception as e:
            print(f" ⚠️ {table} 추출 실패 (무시됨): {e}")

    # 2. JSON 파일 저장
    filename = f"backup_full_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(backup_result, f, default=json_serial, ensure_ascii=False, indent=2)
    
    print("-" * 40)
    print(f"✅ 백업 완료: {os.path.abspath(filename)}")
    print(f"📊 총 {len(table_names)}개 테이블 백업됨")
    print("-" * 40)

if __name__ == "__main__":
    asyncio.run(backup_all_tables())
