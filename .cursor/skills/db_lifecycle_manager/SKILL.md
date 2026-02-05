---
name: Database Lifecycle Manager
description: DB 스키마 의존성 관리, 시딩(Seeding) 순서, 마이그레이션(Alembic) 워크플로우를 담당하는 스킬.
---

# 데이터베이스 수명주기 관리 (Database Lifecycle Manager)

## 1. 데이터베이스 계층 구조 (Dependency Hierarchy)
*외래키(FK) 제약조건으로 인해 데이터 생성/삭제 순서를 엄격히 지켜야 합니다.*

### 생성 순서 (Creation Order)
1. **Companies** (업체 정보 - 최상위)
2. **Users** (로그인 계정)
3. **Workers** (작업자 프로필 - User와 Company를 연결)
4. **Projects** (프로젝트 정보) -> *Users/Companies와 N:N 관계 주의*
5. **DailyWorkPlans** (작업 계획서)
6. **WorkerAllocations** (작업자 배정 정보)

### 삭제 순서 (Deletion Order)
*반드시 생성의 역순으로 삭제해야 함.*
1. `WorkerAllocations`, `Attendance`, `DailyDangerZone`
2. `DailyWorkPlans`
3. `ProjectMembers`, `ProjectParticipants` (관계 테이블)
4. `Projects`
5. `Workers`
6. `Users`
7. `Companies`

## 2. Alembic 마이그레이션 워크플로우
*DB 스키마 변경 시 `Base.metadata.create_all` 사용 금지.*

1. **로컬 개발 (Migration 생성)**:
   - 모델 코드를 수정한 후 반드시 로컬에서 마이그레이션 파일 생성.
   - 명령어: `alembic revision --autogenerate -m "변경내용"`
   - 생성된 `migrations/versions/*.py` 파일을 Git에 Commit & Push.

2. **서버 배포 (Migration 적용)**:
   - 배포 스크립트(`deploy_server.ps1`)는 반드시 코드 Pull 이후에 `alembic upgrade head`를 실행해야 함.

## 3. DB 초기화 및 시딩 (Reset & Seed)

### A. 전체 초기화 (Full Reset)
- **명령어**: `python reset_scenario.py`
- **용도**: DB 스키마가 변경되었거나, 데이터를 완전히 깨끗한 상태에서 시작해야 할 때 사용.
- **특징**: 모든 테이블을 `DROP CASCADE` 하고 재생성하므로 **기존의 모든 데이터가 유실됨.**

### B. 인크리멘탈 시딩 (Incremental Seeding) - ⭐ 권장
- **원칙**: 기존 데이터를 파괴하지 않고, 특정 기능 테스트를 위해 필요한 데이터만 **추가**함.
- **구현 방법**:
  1. `select` 쿼리로 데이터 존재 여부 먼저 확인 (Idempotency 보장).
  2. `seed/seed_*.py` 형식으로 기능별 시딩 파일을 분리.
- **예시**: `python seed/seed_extended_historical.py` (과거 출역 데이터만 추가)

### C. 필수 생성 데이터 (Scenario Standard)
1. **Users**: Admin, Manager, Worker, Safety Manager (PW: `0000` 기본)
2. **Project**: 최소 1개의 활성 프로젝트 (User와 매핑 완료)
3. **Site & Zone**: 현물 도면 대응을 위한 구역 데이터
4. **Member Status**: 승인 대기(PENDING)와 승인 완료(ACTIVE) 상태가 혼합되도록 설정하여 권한 테스트 보장.
