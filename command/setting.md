# 0. 서버 접속
ssh -i "C:\Users\P6\.ssh\id_rsa" ubuntu@168.107.52.201
# (또는 .\command\server_connect.ps1 사용)
sudo apt install -y docker.io


# 2. 현재 사용자(ubuntu)에게 도커 실행 권한 부여
sudo usermod -aG docker $USER
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 3. 중요: 권한 적용을 위해 로그아웃 없이 그룹 적용 (이거 안 하면 에러 남)
newgrp docker


# 1. 기존꺼 삭제
sudo rm /usr/local/bin/docker-compose /usr/bin/docker-compose 2>/dev/null
# 2. ARM64 전용 바이너리 '직접' 다운로드 (v2.24.5)
sudo curl -SL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-aarch64" -o /usr/local/bin/docker-compose
# 3. 실행 권한 부여
sudo chmod +x /usr/local/bin/docker-compose
# 4. 심볼릭 링크
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
# 5. 확인 (여기서 버전 나오면 끝난 겁니다)
docker-compose --version









# 모든 __pycache__ 폴더 강제 삭제 (찌꺼기 제거)
Get-ChildItem -Path . -Include "__pycache__" -Recurse -Force | Remove-Item -Force -Recurse
# alembic 폴더 안의 pyc 파일들도 확인 사살
Get-ChildItem -Path "alembic" -Include "*.pyc" -Recurse -Force | Remove-Item -Force