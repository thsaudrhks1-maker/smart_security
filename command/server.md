# 3005번(프론트), 8010번(백엔드) 포트 열기
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3005 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8010 -j ACCEPT
# 설정 저장 (재부팅해도 유지되게)
sudo netfilter-persistent save

ssh -i "C:\ssh\ssh-key-oracle.key" ubuntu@168.107.52.201

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
pm2 start "../venv/bin/uvicorn main:app --host 0.0.0.0 --port 8010" --name "smart-back"
