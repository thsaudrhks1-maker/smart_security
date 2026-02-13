
import os
import subprocess
from datetime import datetime
from dotenv import load_dotenv

def backup_db():
    load_dotenv()
    
    # .env에서 설정 읽기
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "0000")
    db_name = os.getenv("POSTGRES_DB", "smart_security")
    host = os.getenv("POSTGRES_SERVER", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    
    # 백업 파일명 생성 (날짜 포함)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = "db_backups"
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        
    backup_file = os.path.join(backup_dir, f"backup_{db_name}_{timestamp}.sql")
    
    print(f"--- DB 백업 시작: {backup_file} ---")
    
    # 환경 변수에 비밀번호 설정 (pg_dump가 묻지 않게 함)
    os.environ["PGPASSWORD"] = password
    
    # 도커 컨테이너 실행 여부 확인
    is_docker = False
    container_name = "smart_security_db"
    try:
        docker_check = subprocess.run(["docker", "ps", "--filter", f"name={container_name}", "--format", "{{.Names}}"], capture_output=True, text=True)
        if container_name in docker_check.stdout:
            is_docker = True
    except FileNotFoundError:
        pass

    if is_docker:
        print(f"ℹ️ 도커 환경 감지됨: {container_name}")
        # 도커용 pg_dump 명령어 구성
        cmd = f"sudo docker exec -t {container_name} pg_dump -U {user} -F c {db_name} > {backup_file}"
        try:
            # 리다이렉션을 포함하므로 shell=True 사용
            result = subprocess.run(cmd, shell=True, check=True)
            print(f"✅ [Docker] 백업 성공! 파일 위치: {backup_file}")
        except subprocess.CalledProcessError as e:
            print(f"❌ [Docker] 백업 실패: {e}")
    else:
        # 로컬(Non-Docker) pg_dump 명령어 구성
        cmd = [
            "pg_dump",
            "-h", host,
            "-p", port,
            "-U", user,
            "-F", "c", # Custom format (compressed)
            "-b",      # Include large objects
            "-v",      # Verbose
            "-f", backup_file,
            db_name
        ]
        
        try:
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"✅ 백업 성공! 파일 위치: {backup_file}")
        except subprocess.CalledProcessError as e:
            print(f"❌ 백업 실패: {e}")
            print(f"에러 메시지: {e.stderr}")
            print("\n[알림] pg_dump가 시스템 PATH에 등록되어 있는지 확인해 주세요.")
        except FileNotFoundError:
            print("❌ 'pg_dump' 명령어를 찾을 수 없습니다. PostgreSQL 클라이언트 도구가 설치되어 있고 PATH에 등록되어 있는지 확인해 주세요.")

if __name__ == "__main__":
    backup_db()
