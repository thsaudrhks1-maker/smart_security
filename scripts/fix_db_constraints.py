
import asyncio
import sys
import os

# 프로젝트 루트 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import execute

async def fix_constraints():
    print("=== [DB] daily_worker_users 제약조건 복구 시작 ===")
    
    # 1. 기존에 잘못된 데이터가 있는지 확인 (orphan 제거 - 선택사항이지만 안전을 위해)
    # 여기서는 제약조건 생성 실패를 방지하기 위해 참조 대상이 없는 행을 정리할 수도 있습니다.
    
    try:
        # 먼저 기존 제약조건이 있다면 삭제 (중복 생성 방지)
        try:
            await execute("ALTER TABLE daily_worker_users DROP CONSTRAINT IF EXISTS daily_worker_users_plan_id_fkey")
            await execute("ALTER TABLE daily_worker_users DROP CONSTRAINT IF EXISTS daily_worker_users_worker_id_fkey")
        except:
            pass

        # 1. plan_id -> daily_work_tasks(id) 연결
        await execute("""
            ALTER TABLE daily_worker_users 
            ADD CONSTRAINT daily_worker_users_plan_id_fkey 
            FOREIGN KEY (plan_id) REFERENCES daily_work_tasks(id) ON DELETE CASCADE;
        """)
        print("[성공] daily_worker_users (plan_id) -> daily_work_tasks (id)")
        
        # 2. worker_id -> sys_users(id) 연결
        await execute("""
            ALTER TABLE daily_worker_users 
            ADD CONSTRAINT daily_worker_users_worker_id_fkey 
            FOREIGN KEY (worker_id) REFERENCES sys_users(id) ON DELETE CASCADE;
        """)
        print("[성공] daily_worker_users (worker_id) -> sys_users (id)")
        
        print("\n=== 모든 제약조건이 정상적으로 적용되었습니다. ===")
        print("이제 DB 관리 툴에서 Foreign Keys를 확인하실 수 있습니다.")
        
    except Exception as e:
        print(f"\n[오류 발생] 제약조건 적용 실패: {e}")
        print("-" * 50)
        print("원인 가능성:")
        print("1. daily_worker_users 테이블에 작업 계획(daily_work_tasks)에 없는 plan_id가 이미 들어있음")
        print("2. daily_worker_users 테이블에 사용자(sys_users)에 없는 worker_id가 이미 들어있음")
        print("3. 데이터 정리가 필요합니다.")

if __name__ == "__main__":
    asyncio.run(fix_constraints())
