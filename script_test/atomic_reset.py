
import asyncio
import os
import sys
import json
import random
import bcrypt
from datetime import date, datetime, timedelta
from sqlalchemy import text

# 프로젝트 루트를 path에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from back.database import engine, Base, execute, insert_and_return

async def final_atomic_reset():
    print("🧨 [System Nuke & Rebuild] 데이터 완전 초기화 및 리얼 월드 더미 데이터 주입 시작...")
    
    async with engine.begin() as conn:
        print("🧹 기존의 모든 유령 테이블 및 제약조건 강제 삭제 중...")
        drop_all_sql = """
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        """
        await conn.execute(text(drop_all_sql))
        print("🏗️  새로운 도메인 테이블 생성 중...")
        await conn.run_sync(Base.metadata.create_all)

    today = date.today()
        pw_hash = bcrypt.hashpw("1234".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # 1. [SYS] 업체 마스터 (발주처 2, 시공사 2, 협력사 2)
    print("📝 [SYS] 업체 및 사용자 데이터 주입 중...")
    
    # 발주처 (CLIENT)
    c1 = await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('(주)미래디벨로퍼', 'CLIENT', '발주사') RETURNING id", {})
    c2 = await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('서울도시공사', 'CLIENT', '공공기관') RETURNING id", {})
    
    # 시공사 (CONSTRUCTOR)
    con1 = await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('현대건설(주)', 'CONSTRUCTOR', '종합건설') RETURNING id", {})
    con2 = await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('GS건설(주)', 'CONSTRUCTOR', '종합건설') RETURNING id", {})
    
    # 협력사 (PARTNER)
    p1 = await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('삼보목공', 'PARTNER', '목공/창호') RETURNING id", {})
    p2 = await insert_and_return("INSERT INTO sys_companies (name, type, trade_type) VALUES ('대진경량', 'PARTNER', '내장/수납') RETURNING id", {})

    # 2. [SYS] 사용자 생성 (시공사 소속 소장/안전관리자, 협력사 소속 작업자)
    
    # 현대건설 인원
    await execute("INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES ('admin', '김철수 소장', 'admin', :cid, :pw)", {"cid": con1["id"], "pw": pw_hash})
    await execute("INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES ('modern_mgr', '박현대 소장', 'manager', :cid, :pw)", {"cid": con1["id"], "pw": pw_hash})
    await execute("INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES ('modern_safe', '최안전 과장', 'manager', :cid, :pw)", {"cid": con1["id"], "pw": pw_hash})
    
    # GS건설 인원
    await execute("INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES ('gs_mgr', '이자이 소장', 'manager', :cid, :pw)", {"cid": con2["id"], "pw": pw_hash})
    await execute("INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES ('gs_safe', '강자이 대리', 'manager', :cid, :pw)", {"cid": con2["id"], "pw": pw_hash})
    
    # 작업자 (협력사 소속)
    workers = []
    names_p1 = ["강목수", "이창호", "김기초"]
    names_p2 = ["박내장", "최수납", "정마감"]
    
    for i, name in enumerate(names_p1):
        w = await insert_and_return("INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES (:u, :n, 'worker', :cid, :pw) RETURNING id", 
                                   {"u": f"worker_p1_{i}", "n": name, "cid": p1["id"], "pw": pw_hash})
        workers.append(w["id"])
    for i, name in enumerate(names_p2):
        w = await insert_and_return("INSERT INTO sys_users (username, full_name, role, company_id, hashed_password) VALUES (:u, :n, 'worker', :cid, :pw) RETURNING id", 
                                   {"u": f"worker_p2_{i}", "n": name, "cid": p2["id"], "pw": pw_hash})
        workers.append(w["id"])

    # 3. [PROJECT] 기본 프로젝트 하나 생성
    print("🧱 [PROJECT] 초기 프로젝트 및 공간 데이터 주입 중...")
    proj = await insert_and_return("""
        INSERT INTO project_master (name, location_address, lat, lng, grid_cols, grid_rows, status) 
        VALUES ('스마트 시큐리티 통합 관제 센터', '서울시 강남구 테헤란로 123', 37.5665, 126.9780, 5, 5, 'ACTIVE') RETURNING id
    """, {})
    pid = proj["id"]

    # 프로젝트-업체 관계 설정 (현대건설이 시공사인 프로젝트)
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:pid, :cid, 'CONSTRUCTOR')", {"pid": pid, "cid": con1["id"]})
    await execute("INSERT INTO project_companies (project_id, company_id, role) VALUES (:pid, :cid, 'CLIENT')", {"pid": pid, "cid": c1["id"]})

    # 4. [ZONES] 격자 구역 자동 생성 (1F 전용)
    for r in range(5):
        for c in range(5):
            name = f"1F-{chr(65+r)}{c+1}"
            await execute("INSERT INTO project_zones (project_id, name, level, row_index, col_index) VALUES (:pid, :n, '1F', :ri, :ci)",
                         {"pid": pid, "n": name, "ri": r, "ci": c})

    print("\n✅ [SUCCESS] 리얼 월드 더미 데이터 환경 구축 완료!")
    print("---------------------------------------")
    print("🚀 접속 정보:")
    print(" - 최고관리자: admin / 0000")
    print(" - 현대소장: modern_mgr / 0000")
    print(" - GS소장: gs_mgr / 0000")
    print("---------------------------------------")

if __name__ == "__main__":
    asyncio.run(final_atomic_reset())
