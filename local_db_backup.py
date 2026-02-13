
import os
import subprocess
from datetime import datetime
from dotenv import load_dotenv

# .\venv\Scripts\python local_db_backup.py

def run_backup():
    """로컬 데이터베이스 백업 실행 (PostgreSQL)"""
    load_dotenv()
    
    # .env 설정 로드
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_pw = os.getenv("POSTGRES_PASSWORD", "0000")
    db_name = os.getenv("POSTGRES_DB", "smart_security")
    db_host = os.getenv("POSTGRES_SERVER", "localhost")
    db_port = os.getenv("POSTGRES_PORT", "5500")
    
    # 백업 폴더 및 파일명 설정
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = "db_backups"
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    backup_file = os.path.join(backup_dir, f"backup_{db_name}_{timestamp}.sql")
    
    print(f"📦 DB 백업 시작: {backup_file}")
    
    # 윈도우 환경 pg_dump 절대 경로 설정 (Reference: Path Found by Agent)
    pg_dump_path = r"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe"
    
    # 만약 위 경로에 없다면 시스템 PATH에서 찾도록 함
    if not os.path.exists(pg_dump_path):
        pg_dump_path = "pg_dump"
    
    try:
        # 환경변수에 비밀번호 일시 설정 (pg_dump용)
        os.environ["PGPASSWORD"] = db_pw
        
        # pg_dump 명령어 조립 (Plain SQL 형식 - 시드 데이터로 읽기 위함)
        cmd = [
            pg_dump_path,
            "-h", db_host,
            "-p", db_port,
            "-U", db_user,
            "--clean",           # 복구 시 기존 테이블 DROP 명령어 포함
            "--if-exists",       # DROP 시 에러 방지
            "-F", "p",           # Plain SQL format (가독성 및 시드용)
            "-b",                
            "-f", backup_file,
            db_name
        ]
        
        # 명령어 실행
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        # [추가] 루트 디렉토리에 최신 시드용 파일 생성 (local_db.sql)
        import shutil
        root_seed = "local_db.sql"
        shutil.copy2(backup_file, root_seed)
        
        print(f"✅ 백업 완료: {backup_file}")
        print(f"🔄 루트 시드 업데이트 완료: {root_seed}")
        return True, backup_file
        
    except subprocess.CalledProcessError as e:
        print(f"❌ pg_dump 실행 실패: {e.stderr}")
        print("💡 pg_dump가 시스템 PATH에 등록되어 있는지, 포트(5500)가 맞는지 확인하세요.")
        return False, None
    except Exception as e:
        print(f"❌ 예상치 못한 에러: {str(e)}")
        return False, None

if __name__ == "__main__":
    run_backup()
