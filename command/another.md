# 1. 기존 권한 초기화 (상속 제거)
icacls "C:\ssh\ssh-key-oracle.key" /inheritance:r
# 2. '나(사용자)'에게만 모든 권한 부여
icacls "C:\ssh\ssh-key-oracle.key" /grant:r "$($env:USERNAME):F"
# 3. 접속 시도 (이제 잘 될# 파일 전송 (SCP)
# 키 경로를 변수로 관리하는 것 추천 ($SSH_KEY_PATH)
scp -i "C:\Users\P6\.ssh\id_rsa" docker-compose.yml ubuntu@168.107.52.201:~/smart_security/