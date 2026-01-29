# Smart Security Map & Worker Tracking Implementation Plan

## 1. 개요
`safe_project`의 지도/도면/위험요소/작업자 추적 기능을 `smart_security` 프로젝트로 이식하고, 백엔드 연동 및 실시간 동기화(WebSocket)를 구현합니다.

## 2. Backend Implementation (FastAPI)
- **위치**: `back/map/router.py` (신규 생성)
- **주요 기능**:
  - **WebSocket `/ws/workers`**: 작업자 위치 실시간 브로드캐스팅 시뮬레이션.
  - **API `/api/map/risks`**: 위험 요소(Circle, Marker) CRUD.
  - **API `/api/map/blueprint`**: 도면 이미지 업로드 및 서빙.
- **데이터 저장**:
  - DB 마이그레이션 제약을 준수하기 위해 **In-Memory** 저장소(Global Dict/List) 사용 (세션 유지 동안 동작).
  - 업로드된 이미지는 `back/static/blueprints`에 저장.

## 3. Frontend Implementation (React + Vite)
- **위치**: `front/src/features/safety/SafetyMap.jsx` (수정)
- **주요 변경**:
  - **API 연동**: `axios`를 통해 위험 요소 로딩 및 도면 업로드.
  - **WebSocket 연동**: Native `WebSocket` 사용하여 작업자 위치 실시간 수신.
  - **UI 통합**: `SafeMapViewer.jsx`의 도면 업로드/회전/크기조절 UI를 `SafetyMap.jsx`의 디자인 시스템(Glassmorphism)에 맞춰 통합.

## 4. 실행 계획
1. **Backend**: `map/router.py` 작성 -> `main.py`에 등록 -> Static 폴더 설정.
2. **Frontend**: `SafetyMap.jsx` 수정 (WebSocket 연결, API 호출, Upload UI 추가).
3. **Validation**: 브라우저를 열어 `/map` 접속 및 동작 확인.
