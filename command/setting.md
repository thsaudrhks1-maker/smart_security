# 1. 도커 설치
sudo apt update
sudo apt install -y docker.io
# 2. 현재 사용자(ubuntu)에게 도커 실행 권한 부여
sudo usermod -aG docker $USER
# 3. 중요: 권한 적용을 위해 로그아웃 없이 그룹 적용 (이거 안 하면 에러 남)
newgrp docker