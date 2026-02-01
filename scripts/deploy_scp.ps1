# ========================================================
#  Smart Security 긴급 배포 스크립트 (SCP 모드)
#  Git 명령어가 작동하지 않을 때 파일을 직접 전송합니다.
# ========================================================

# 0. 스크립트 위치 보정
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\.."
Write-Host "📂 Working Directory: $(Get-Location)" -ForegroundColor Gray

# 1. 설정
$SSH_KEY = "C:\Users\P6\.ssh\id_rsa"
$SSH_HOST = "ubuntu@168.107.52.201"
$REMOTE_IP = "168.107.52.201"
$REMOTE_USER = "ubuntu"
$REMOTE_DIR = "/home/ubuntu/smart_security"

Write-Host "`n🚀 [1/2] 변경된 주요 파일 서버로 강제 전송 (SCP)..." -ForegroundColor Cyan

# 전송할 파일 목록 (변경된 파일들)
$FilesToSync = @(
    ".env",
    "requirements.txt",
    "scripts\deploy.sh",
    "back\main.py",
    "front\vite.config.js",
    "front\src\api\client.js"
)

foreach ($File in $FilesToSync) {
    if (Test-Path $File) {
        $Dest = "$REMOTE_USER@${REMOTE_IP}:$REMOTE_DIR/$(Split-Path $File -Parent)"
        $Dest = $Dest -replace "\\", "/"  # 윈도우 경로 역슬래시 보정
        
        Write-Host "   -> Uploading: $File" -ForegroundColor Yellow
        # scp는 윈도우에서도 기본 제공됨
        scp -i $SSH_KEY $File "$Dest"
    } else {
        Write-Host "   ⚠️ File not found: $File" -ForegroundColor Red
    }
}

Write-Host "`n🚀 [2/2] 서버 배포 스크립트(deploy.sh) 실행..." -ForegroundColor Cyan

# deploy.sh 실행 권한 주고 실행
$RemoteCommand = "chmod +x $REMOTE_DIR/scripts/deploy.sh && $REMOTE_DIR/scripts/deploy.sh"
ssh -i "$SSH_KEY" $SSH_HOST "$RemoteCommand"

Write-Host "`n🎉 배포 완료! (Git 없이 파일 직접 전송함)" -ForegroundColor Green
Write-Host "확인: http://168.107.52.201:3500" -ForegroundColor Gray
