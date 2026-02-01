# ========================================================
#  Smart Security 원클릭 Git 배포 스크립트
# ========================================================
param ([string]$CommitMessage = "Update: Auto-deploy via script")

# 1. 설정
$SSH_KEY = "C:\Users\P6\.ssh\id_rsa"
$SSH_HOST = "ubuntu@168.107.52.201"
$REMOTE_DIR = "~/smart_security"

Write-Host "`n🚀 [1/3] 로컬 코드 Git Push 진행 중..." -ForegroundColor Cyan

# Git 작업 진행
git add .
git commit -m "$CommitMessage"
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Git Push 중에 경고/에러가 발생했으나 서버 동기화를 계속 시도합니다." -ForegroundColor Yellow
}

Write-Host "`n🚀 [2/3] 서버 접속 및 강제 동기화(Reset) 진행..." -ForegroundColor Cyan

# 2. 서버 명령 (git reset으로 서버 로컬 변경사항 무시하고 origin/main과 강제 일치)
$RemoteCommand = "cd $REMOTE_DIR && git fetch --all && git reset --hard origin/main && chmod +x scripts/deploy.sh && ./scripts/deploy.sh"

ssh -i "$SSH_KEY" $SSH_HOST "$RemoteCommand"

Write-Host "`n🎉 [3/3] 모든 배포 공정이 완료되었습니다!" -ForegroundColor Green
Write-Host "서버 로그 확인: ssh -i `"$SSH_KEY`" $SSH_HOST `"tail -f $REMOTE_DIR/server.log`"" -ForegroundColor Gray
