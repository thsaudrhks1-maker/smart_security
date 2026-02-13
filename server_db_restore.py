
import os
import subprocess
from dotenv import load_dotenv

def run_server_restore():
    """서버 백업 파일(server_db.sql)을 사용하여 데이터베이스 복구"""
    load_dotenv()
    
    # .env 설정 로드
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_pw = os.getenv("POSTGRES_PASSWORD", "0000")
    db_name = os.getenv("POSTGRES_DB", "smart_security")
    db_host = os.getenv("POSTGRES_SERVER", "localhost")
    db_port = os.getenv("POSTGRES_PORT", "5432") # 서버 기본 포트
    
    # 서버 전용 복구 파일 (server_db.sql)
    server_seed = "server_db.sql"
    
    if not os.path.exists(server_seed):
        print(f"❌ 서버 복구 파일이 없습니다: {server_seed}")
        print("💡 먼저 python server_db_backup.py를 실행하여 백업본을 생성하세요.")
        return False

    print(f"🚀 [SERVER] DB 복구 시작 (현장 데이터 복원): {server_seed}")
    
    # OS별 psql 경로 설정 (서버는 보통 리눅스)
    if os.name == 'nt': # Windows (테스트용)
        psql_path = r"C:\Program Files\PostgreSQL\17\bin\psql.exe"
        if not os.path.exists(psql_path):
            psql_path = "psql"
    else: # Linux/Mac (실제 서버)
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
            "-f", server_seed
        ]
        
        # 명령어 실행
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        print("✅ [SERVER] DB 복구 완료! 현장 실제 데이터가 복원되었습니다.")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ [SERVER] psql 실행 실패: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ [SERVER] 에러 발생: {str(e)}")
        return False

if __name__ == "__main__":
    run_server_restore()
