# 1. Frontend (터미널 1)
cd front; npm run dev

# 3. DB 실행 (docker-compose)
# docker-compose.yml이 있는 폴더에서 실행
docker-compose up -d

# DB 중지 시:
# docker-compose down

# 접속 (스크립트 사용 추천: .\command\server_connect.ps1)
ssh -i "C:\Users\P6\.ssh\id_rsa" ubuntu@168.107.52.201 Backend (터미널 2)

.\venv\Scripts\uvicorn back.main:app --reload
.\venv\Scripts\python -m uvicorn back.main:app --reload --port 8000

python -m venv venv

.\venv\Scripts\activate

.\venv\Scripts\pip install -r requirements.txt

.\venv\Scripts\alembic revision --autogenerate -m "Initial migration"

.\venv\Scripts\alembic upgrade head
