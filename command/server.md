# 3005번(프론트), 8010번(백엔드) 포트 열기
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3005 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8010 -j ACCEPT
# 설정 저장 (재부팅해도 유지되게)
sudo netfilter-persistent save

# 0. SSH 접속 (PowerShell)
# 먼저 .env 파일의 설정을 불러오세요:
# $env:SSH_KEY_PATH = "C:\Users\P6\.ssh\id_rsa"
# ssh -i $env:SSH_KEY_PATH ubuntu@168.107.52.201
# 또는 제공된 스크립트 사용: .\command\server_connect.ps1

ssh -i "C:\Users\P6\.ssh\id_rsa" ubuntu@168.107.52.201

npm install

cd ~/smart_security
cd front
npm run dev -- --host 0.0.0.0 --port 3005 &

npm run build

sudo apt update
sudo apt install -y python3-venv nginx

cd ~/smart_security_back
python3 -m venv venv

source venv/bin/activate
pip install -r requirements.txt

pm2 start "npm run dev -- --host 0.0.0.0 --port 3005" --name "smart-front"
pm2 start "../venv/bin/uvicorn back.main:app --host 0.0.0.0 --port 8010" --name "smart-back"