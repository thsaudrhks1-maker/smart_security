# .env 파일에서 설정 로드
$envPath = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envPath) {
    Get-Content $envPath | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $key, $value = $_.Split('=', 2)
        $value = $value.Trim('"')  # 따옴표 제거
        Set-Variable -Name $key -Value $value -Scope script
    }
} else {
    Write-Host "❌ .env 파일을 찾을 수 없습니다." -ForegroundColor Red
    exit
}

Write-Host "🚀 서버($script:SSH_HOST)로 접속합니다..." -ForegroundColor Green
Write-Host "🔑 Key: $script:SSH_KEY_PATH" -ForegroundColor Gray

# SSH 접속 실행
ssh -i $script:SSH_KEY_PATH "$script:SSH_USER@$script:SSH_HOST"
