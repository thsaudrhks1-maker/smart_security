# 개발 환경 실행 및 관리 가이드 (Dev Environment Guide)

## 1. 통합 실행 스크립트 (`dev.ps1`)
백엔드와 프론트엔드를 매번 따로 실행하는 번거로움을 줄이기 위해, 프로젝트 루트에 `dev.ps1` 스크립트를 생성했습니다.

### 사용 방법
PowerShell 터미널에서 프로젝트 루트(`c:\github\smart_security`)로 이동 후 다음 명령어를 입력하세요.

```powershell
.\dev.ps1
```

### 동작 방식
- **Frontend:** 새 PowerShell 창을 열고 `cd front; npm run dev`를 실행합니다.
- **Backend:** 새 PowerShell 창을 열고 `.\venv\Scripts\uvicorn back.main:app --reload`를 실행합니다.
  - **주의:** 백엔드는 `back` 패키지 인식을 위해 반드시 **프로젝트 루트**에서 실행되어야 합니다.

---

## 2. 향후 확장 계획: 클라우드 터널링 (Cloud Tunneling)
추후 외부에서 로컬 개발 서버에 접속하거나, HTTPS 테스트가 필요할 때 터널링 도구(ngrok, cloudflared 등)를 이 스크립트에 통합할 예정입니다.

### 추가 방법 (예시)
`dev.ps1` 파일 하단에 다음과 같은 섹션을 추가하여 자동으로 터널을 열 수 있습니다.

```powershell
# 3. Cloud Tunneling (예: ngrok)
# ngrok이 설치되어 있다고 가정
# Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 8000"
```

### 관리 포인트
- 터널링 URL이 매번 변경될 수 있으므로, 고정 도메인 사용을 고려하거나 환경 변수로 URL을 관리하는 방안을 문서화할 예정입니다.
