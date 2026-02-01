#!/bin/bash
# Server-side Deployment Script for smart_security

echo "--- [1/3] Updating dependencies ---"
# 가상환경이 없으면 생성, 있으면 활성
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "--- [2/3] Stopping previous server (Port 8010) ---"
# Port 8010을 사용하는 프로세스 종료
PID=$(lsof -t -i:8010)
if [ ! -z "$PID" ]; then
    echo "Killing process $PID"
    kill -9 $PID
fi

echo "--- [3/3] Starting Smart Security server ---"
# 백그라운드 실행 (nohup)
nohup python3 -m uvicorn back.main:app --host 0.0.0.0 --port 8010 > server.log 2>&1 &

echo "✨ Deployment successful! Server is running on port 8010."
