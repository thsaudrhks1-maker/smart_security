# 스크립트: Smart Security 안드로이드 앱 빌드 및 설정 자동화
# 실행 위치: c:\github\smart_security\front
Write-Host "🚀 Smart Security 안드로이드 앱 설정을 시작합니다..." -ForegroundColor Cyan

# 1. 프론트엔드 빌드
Write-Host "📦 1. React 프론트엔드 빌드 중..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패. 오류를 확인하세요." -ForegroundColor Red
    exit
}

# 2. Capacitor 초기화 (없을 경우)
if (-not (Test-Path "capacitor.config.ts") -and -not (Test-Path "capacitor.config.json")) {
    Write-Host "⚡ 2. Capacitor 초기화 중..." -ForegroundColor Yellow
    npx cap init "Smart Security" "com.sogething.smartsecurity" --web-dir dist
} else {
    Write-Host "ℹ️ 2. Capacitor 설정이 이미 존재합니다. 건너뜁니다." -ForegroundColor Gray
}

# 3. 안드로이드 플랫폼 추가 (없을 경우)
if (-not (Test-Path "android")) {
    Write-Host "🤖 3. Android 플랫폼 추가 중..." -ForegroundColor Yellow
    npx cap add android
} else {
    Write-Host "ℹ️ 3. Android 플랫폼이 이미 추가되었습니다." -ForegroundColor Gray
}

# 4. AndroidManifest.xml 권한 자동 주입
$manifestPath = "android\app\src\main\AndroidManifest.xml"
if (Test-Path $manifestPath) {
    Write-Host "🔑 4. Android 권한(Bluetooth/Location) 주입 중..." -ForegroundColor Yellow
    $content = Get-Content $manifestPath -Raw
    
    # 권한 목록
    $permissions = @(
        '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
        '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
        '<uses-permission android:name="android.permission.BLUETOOTH" />',
        '<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />',
        '<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />',
        '<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />',
        '<uses-feature android:name="android.hardware.bluetooth_le" android:required="true"/>'
    )
    
    # <manifest> 태그 찾기
    if ($content -notmatch "android.permission.BLUETOOTH_SCAN") {
        # <application> 태그 바로 앞에 권한 삽입
        $newContent = $content -replace "<application", ($permissions -join "`n" + "`n    <application")
        if ($newContent -ne $content) {
            Set-Content -Path $manifestPath -Value $newContent -Encoding UTF8
            Write-Host "✅ 권한 주입 완료!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 권한 주입 실패 (패턴 매칭 오류)" -ForegroundColor Red
        }
    } else {
        Write-Host "ℹ️ 권한이 이미 존재합니다." -ForegroundColor Gray
    }
} else {
    Write-Host "❌ AndroidManifest.xml을 찾을 수 없습니다. (경로 확인 필요)" -ForegroundColor Red
}

# 5. Sync 및 열기
Write-Host "🔄 5. Capacitor Sync (플러그인 동기화)..." -ForegroundColor Yellow
npx cap sync

Write-Host "✅ 설정 완료! 이제 Android Studio가 열립니다." -ForegroundColor Cyan
Write-Host "👉 Android Studio에서 [Play 버튼 ▶]을 눌러 태블릿에 설치하세요." -ForegroundColor Cyan
Start-Sleep -Seconds 2

npx cap open android
