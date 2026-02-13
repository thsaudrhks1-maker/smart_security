
import os
import subprocess
from dotenv import load_dotenv

def run_seed():
    """백업된 latest_seed.sql 파일을 사용하여 데이터베이스 초기화 및 시딩"""
    load_dotenv()
    
    # .env 설정 로드
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_pw = os.getenv("POSTGRES_PASSWORD", "0000")
    db_name = os.getenv("POSTGRES_DB", "smart_security")
    db_host = os.getenv("POSTGRES_SERVER", "localhost")
    db_port = os.getenv("POSTGRES_PORT", "5500")
    
    # 루트의 local_db.sql 파일 사용
    root_seed = "local_db.sql"
    
    if not os.path.exists(root_seed):
        print(f"❌ 시드 파일이 없습니다: {root_seed}")
        print("💡 먼저 python local_db_backup.py를 실행하세요.")
        return False

    print(f"🚀 DB 시딩 시작 (루트 파일 사용): {root_seed}")
    
    # OS별 psql 경로 설정
    if os.name == 'nt': # Windows
        psql_path = r"C:\Program Files\PostgreSQL\17\bin\psql.exe"
        if not os.path.exists(psql_path):
            psql_path = "psql"
    else: # Linux/Mac
        psql_path = "psql"
    
    try:
        os.environ["PGPASSWORD"] = db_pw
        
        # psql 명령어 조립
        cmd = [
            psql_path,
            "-h", db_host,
            "-p", db_port,
            "-U", db_user,
            "-d", db_name,
            "-f", root_seed
        ]
        
        # 명령어 실행
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        print("✅ DB 시딩(복구) 완료! 이제 최신 백업 상태와 동일합니다.")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ psql 실행 실패: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ 에러 발생: {str(e)}")
        return False

if __name__ == "__main__":
    run_seed()
