# Smart Security 통합 실행 스크립트

Write-Host "🚀 Smart Safety Guardian 개발 환경을 시작합니다..." -ForegroundColor Cyan

# 1. Frontend 실행 (새 창)
Write-Host "-> Frontend (Vite) 시작 중..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd front; npm run dev"

# 2. Backend 실행 (새 창)
# 주의: Backend는 모듈 경로(back.main) 인식을 위해 프로젝트 루트에서 실행합니다.
Write-Host "-> Backend (FastAPI) 시작 중..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$env:PYTHONPATH='.'; .\venv\Scripts\uvicorn back.main:app --reload"

Write-Host "✅ 모든 서비스가 실행되었습니다." -ForegroundColor Cyan
Write-Host "Cloud Tunneling(ngrok 등) 설정이 필요하면 이 스크립트에 추가할 수 있습니다." -ForegroundColor Gray


# 프로젝트 루트에서 실행
# .\command\dev.ps1