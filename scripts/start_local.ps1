# ========================================================
# 💻 Smart Security - 로컬 실행 스크립트 (Start Local)
# ========================================================
# 백엔드와 프론트엔드를 새 창에서 실행합니다.
# ========================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\.."

Write-Host "🚀 로컬 서버를 시작합니다..." -ForegroundColor Cyan

# 1. 백엔드 실행 (새 창)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\github\smart_security; .\venv\Scripts\python -m uvicorn back.main:app --reload --port 8500"
Write-Host "✅ 백엔드 서버 시작 (Port: 8500)" -ForegroundColor Green

# 2. 프론트엔드 실행 (새 창)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\github\smart_security\front; npm run dev"
Write-Host "✅ 프론트엔드 서버 시작 (Port: 5173)" -ForegroundColor Green

Write-Host "`n🌐 브라우저 접속: http://localhost:5173" -ForegroundColor Yellow
