
import asyncio
import os
import sys
import bcrypt

# 프로젝트 루트를 path에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import execute, fetch_all, insert_and_return

async def diagnose_and_fix():
    print("🔍 [Auth Diagnosis] 로그인 계정 진단 시작...")
    
    # 1. 현재 사용자 목록 확인
    users = await fetch_all("SELECT username, role, full_name FROM users")
    print(f"📊 현재 등록된 사용자 ({len(users)}명):")
    for u in users:
        print(f" - [{u['role']}] {u['username']} ({u['full_name']})")
    
    # 2. manager1 존재 여부 확인 및 생성
    manager_exists = any(u['username'] == 'manager1' for u in users)
    
    if not manager_exists:
        print("💡 manager1 계정이 없습니다. 강제 생성을 시작합니다.")
        # bcrypt 해싱
        pw_hash = bcrypt.hashpw("1234".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        try:
            # 먼저 원청 업체 ID 하나 가져오기
            comp = await fetch_all("SELECT id FROM companies LIMIT 1")
            cid = comp[0]['id'] if comp else 1
            
            await execute(
                "INSERT INTO users (username, full_name, role, company_id, hashed_password) VALUES ('manager1', '이관리 과장', 'manager', :cid, :pw) ON CONFLICT (username) DO UPDATE SET role = 'manager'",
                {"cid": cid, "pw": pw_hash}
            )
            print("✅ manager1 계정 생성 완료! (PW: 1234)")
        except Exception as e:
            print(f"❌ 계정 생성 실패: {e}")
    else:
        print("✅ manager1 계정이 이미 존재합니다.")

    print("\n🚀 [진단 완료] 이제 이 정보를 바탕으로 로그인을 시도해 보세요.")

if __name__ == "__main__":
    asyncio.run(diagnose_and_fix())
