
import asyncio
import json
import os
import sys
from back.database import execute, insert_and_return

# 프로젝트 루트 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def restore_data(backup_file):
    if not os.path.exists(backup_file):
        print(f"❌ 파일을 찾을 수 없습니다: {backup_file}")
        return

    print(f"📥 [Restore] {backup_file}에서 복구를 시작합니다...")
    
    with open(backup_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 복구 순서 (외래키 제약조건 때문에 중요함)
    # 업체 -> 사용자 -> 프로젝트 -> 현장 -> 구역 순서로 복구하는 것이 안전합니다.
    # 여기서는 간단히 제약조건을 잠시 끄고 복구하는 방식을 사용합니다.
    
    try:
        # 1. 제약조건 체크 일시 중지 (PostgreSQL 전용)
        await execute("SET session_replication_role = 'replica';")
        
        for table_name, rows in data.items():
            if not rows:
                continue
            
            print(f" - {table_name} 복구 중 ({len(rows)}건)...")
            
            # 이전 테이블명 ➡️ 새 테이블명 매핑 (필요 시 수정)
            target_table = table_name
            if table_name == "projects": target_table = "project_master"
            if table_name == "users": target_table = "sys_users"
            if table_name == "companies": target_table = "sys_companies"
            
            for row in rows:
                # 컬럼명과 값을 동적으로 생성
                columns = ", ".join(row.keys())
                placeholders = ", ".join([f":{k}" for k in row.keys()])
                sql = f"INSERT INTO {target_table} ({columns}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
                await execute(sql, row)

        print("-" * 40)
        print("✅ 모든 데이터 복구가 완료되었습니다!")
    except Exception as e:
        print(f"❌ 복구 중 오류 발생: {e}")
    finally:
        # 2. 제약조건 체크 다시 켜기
        await execute("SET session_replication_role = 'origin';")

if __name__ == "__main__":
    # 실행 시 백업 파일명을 인자로 넘겨주세요
    target_file = "backup_full_20260206_094419.json" # 실제 파일명으로 수정
    asyncio.run(restore_data(target_file))
