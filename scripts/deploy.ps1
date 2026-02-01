# ========================================================
#  Smart Security 원클릭 Git 배포 스크립트
# ========================================================
param ([string]$CommitMessage = "Update: Auto-deploy via script")

# 0. 스크립트 위치 보정 (scripts 폴더 -> 프로젝트 루트로 이동)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\.."
Write-Host "📂 Working Directory set to: $(Get-Location)" -ForegroundColor Gray

# 1. 설정
# 사용자 환경에 맞는 SSH 키 경로 확인 필요
$SSH_KEY = "C:\Users\P6\.ssh\id_rsa"
$SSH_HOST = "ubuntu@168.107.52.201"
$REMOTE_DIR = "~/smart_security"

Write-Host "`n🚀 [1/3] 로컬 코드 Git Push 진행 중..." -ForegroundColor Cyan

# Git 작업 진행 (이제 루트에서 실행되므로 . 이 전체 프로젝트를 의미함)
git add .
git commit -m "$CommitMessage"
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Git Push 중에 경고/에러가 발생했으나 서버 동기화를 계속 시도합니다." -ForegroundColor Yellow
}

Write-Host "`n🚀 [2/3] 서버 접속 및 강제 동기화(Reset) 진행..." -ForegroundColor Cyan

# 2. 서버 명령 
# - git reset: 충돌 방지용 강제 동기화
# - chmod +x: 실행 권한 부여
# - ./scripts/deploy.sh: 서버 내부 배포 스크립트 실행
$RemoteCommand = "cd $REMOTE_DIR && git fetch --all && git reset --hard origin/main && chmod +x scripts/deploy.sh && ./scripts/deploy.sh"

ssh -i "$SSH_KEY" $SSH_HOST "$RemoteCommand"

Write-Host "`n🎉 [3/3] 모든 배포 공정이 완료되었습니다!" -ForegroundColor Green
Write-Host "PM2 상태 확인: ssh -i `"$SSH_KEY`" $SSH_HOST `"pm2 status`"" -ForegroundColor Gray
