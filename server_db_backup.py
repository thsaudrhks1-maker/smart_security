
import os
import subprocess
from datetime import datetime
from dotenv import load_dotenv
import shutil

def run_server_backup():
    """서버 전용 데이터베이스 백업 실행 (파일명에 server_ 명시)"""
    load_dotenv()
    
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_pw = os.getenv("POSTGRES_PASSWORD", "0000")
    db_name = os.getenv("POSTGRES_DB", "smart_security")
    db_host = os.getenv("POSTGRES_SERVER", "localhost")
    db_port = os.getenv("POSTGRES_PORT", "5432") # 서버 기본 포트
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = "db_backups"
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    # 서버 전용 백업 파일명 (server_ 접두어)
    backup_file = os.path.join(backup_dir, f"server_db_backup_{timestamp}.sql")
    server_latest = "server_db.sql"
    
    print(f"📦 [SERVER] DB 백업 시작: {backup_file}")
    
    try:
        os.environ["PGPASSWORD"] = db_pw
        cmd = [
            "pg_dump",
            "-h", db_host,
            "-p", db_port,
            "-U", db_user,
            "--clean",
            "--if-exists",
            "-F", "p",
            "-b",
            "-f", backup_file,
            db_name
        ]
        
        subprocess.run(cmd, check=True)
        
        # 서버용 최종 파일로 복사
        shutil.copy2(backup_file, server_latest)
        
        print(f"✅ [SERVER] 백업 완료: {backup_file}")
        print(f"🔄 [SERVER] 최신 데이터 보관 완료: {server_latest}")
        return True
    except Exception as e:
        print(f"❌ [SERVER] 백업 실패: {str(e)}")
        return False

if __name__ == "__main__":
    run_server_backup()
