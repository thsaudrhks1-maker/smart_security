# ========================================================
# 🚀 Smart Security - 서버 배포 스크립트 (PROD Version)
# ========================================================
# 기능:
# 1. 로컬 코드 Git Push (Git 경로 자동 탐색)
# 2. 서버 코드 Pull (강제 동기화)
# 3. 백엔드/프론트엔드 의존성 설치 및 빌드
# 4. PM2 프로세스 재시작 (Restart)
# ========================================================

param ([string]$CommitMessage = "Update: Deploy to Production")

# 0. 설정 및 경로 이동
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\.."
Write-Host "📂 Working Directory: $(Get-Location)" -ForegroundColor Gray

$SSH_KEY = "C:\Users\P6\.ssh\id_rsa"
$SSH_HOST = "ubuntu@168.107.52.201"
$REMOTE_DIR = "~/smart_security"

# --------------------------------------------------------
# 1. Git 경로 자동 설정 (PATH 추가)
# 1. Git 설정
# 시스템에 Git이 설치되어 있으므로 기본 명령어 사용
$GitExe = "git"

Write-Host "✅ Git 사용: $GitExe" -ForegroundColor Green

# --------------------------------------------------------
# 2. Git Push
# --------------------------------------------------------
Write-Host "`n🚀 [1/3] 서버로 코드 전송 (Git Push)..." -ForegroundColor Cyan
try {
    Invoke-Expression "$GitExe add ."
    Invoke-Expression "$GitExe commit -m '$CommitMessage'"
    Invoke-Expression "$GitExe push origin main"
} catch {
    Write-Host "⚠️ Git Push 중 오류가 발생했으나 서버 배포는 계속 시도합니다." -ForegroundColor Yellow
}

# --------------------------------------------------------
# 3. 서버 배포 명령 실행
# --------------------------------------------------------
Write-Host "`n🚀 [2/3] 서버 업데이트, 빌드 및 재시작..." -ForegroundColor Cyan

# 서버 실행 명령어
# 1. git fetch & reset: 최신 코드 반영
# 2. backend: 패키지 설치
# 3. frontend: 패키지 설치 -> 빌드(Build) -> 빌드된 파일 사용 준비
# 4. pm2 restart: 프로세스 확실하게 재시작
$RemoteCommand = "
    cd $REMOTE_DIR && 
    git fetch --all && 
    git reset --hard origin/main && 
    echo '📦 Backend Dependencies...' &&
    ./venv/bin/pip install -r requirements.txt && 
    echo '📦 Frontend Build...' &&
    cd front && 
    npm install && 
    npm run build && 
    cd .. && 
    echo '🔄 Restarting Server...' &&
    pm2 restart all
"

# 한 줄로 합쳐서 전송 (줄바꿈 제거)
$RemoteCommand = $RemoteCommand -replace "`r`n", " " -replace "`n", " "

ssh -i "$SSH_KEY" $SSH_HOST "$RemoteCommand"

Write-Host "`n🎉 [3/3] 배포 완료! (Build & Restart Applied)" -ForegroundColor Green
Write-Host "👉 상태 확인: ssh -i `"$SSH_KEY`" $SSH_HOST `"pm2 status`"" -ForegroundColor Gray
