# Docker 설정 가이드 (Docker Settings)

이 프로젝트는 `docker-compose`를 사용하여 프론트엔드와 백엔드를 한 번에 실행할 수 있도록 구성되었습니다.

## 1. 사전 요구사항 (Prerequisites)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치 및 실행 필수.

## 2. Docker 실행 명령어 (Commands)

### 기본 실행 (백그라운드 모드)
가장 권장되는 실행 방식입니다. 터미널을 점유하지 않고 실행됩니다.
```powershell
docker-compose up -d --build
```
- `--build`: 이미지를 새로 빌드하여 변경 사항 반영
- `-d`: Detached mode (백그라운드 실행)

### 로그 확인
실행 중인 컨테이너의 로그를 실시간으로 확인합니다.
```powershell
# 전체 로그 확인
docker-compose logs -f

# 특정 서비스 로그 확인 (backend 또는 frontend)
docker-compose logs -f backend
```

### 컨테이너 종료
```powershell
docker-compose down
```

## 3. 접속 주소
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API 문서:** http://localhost:8000/docs

---

## 4. 문제 해결 (Troubleshooting)
- **포트 충돌:** 이미 5173이나 8000 포트를 사용 중인지 확인하세요.
- **백엔드 에러:** `python-multipart` 등의 패키지가 Dockerfile에 포함되어 있는지 확인이 필요할 수 있습니다. (현재 설정에 포함됨)
