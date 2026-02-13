
import os
import subprocess
import sys
from dotenv import load_dotenv

def restore_db(backup_file):
    load_dotenv()
    
    # .env에서 설정 읽기
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "0000")
    db_name = os.getenv("POSTGRES_DB", "smart_security")
    host = os.getenv("POSTGRES_SERVER", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    
    if not os.path.exists(backup_file):
        print(f"❌ 백업 파일을 찾을 수 없습니다: {backup_file}")
        return

    print(f"--- DB 복구 시작: {backup_file} -> {db_name} ---")
    print("⚠️  주의: 기존 데이터가 덮어씌워질 수 있습니다. (DROP SCHEMA public CASCADE 실행 후 복구 권장)")
    
    # 환경 변수에 비밀번호 설정
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
        # 도커용 pg_restore 명령어 구성 (cat으로 파일을 컨테이너 내부에 전달)
        cmd = f"cat {backup_file} | sudo docker exec -i {container_name} pg_restore -U {user} -d {db_name} --clean --if-exists -v"
        try:
            result = subprocess.run(cmd, shell=True, check=True)
            print(f"✅ [Docker] 복구 성공! 사용된 파일: {backup_file}")
        except subprocess.CalledProcessError as e:
            print(f"❌ [Docker] 복구 실패: {e}")
    else:
        # 로컬(Non-Docker) pg_restore 명령어 구성
        cmd = [
            "pg_restore",
            "-h", host,
            "-p", port,
            "-U", user,
            "-d", db_name,
            "--clean",           # 복구 전 기존 객체 삭제
            "--if-exists",
            "-v",                # Verbose
            backup_file
        ]
        
        try:
            subprocess.run(cmd, check=True)
            print(f"✅ 복구 성공! 사용된 파일: {backup_file}")
        except subprocess.CalledProcessError as e:
            print(f"❌ 복구 실패: {e}")
        except FileNotFoundError:
            print("❌ 'pg_restore' 명령어를 찾을 수 없습니다. PostgreSQL 클라이언트 도구가 설치되어 있는지 확인해 주세요.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python scripts/db_restore.py <백업파일_경로>")
    else:
        restore_db(sys.argv[1])
