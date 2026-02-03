---
name: Smart Security 기술 표준
description: 스마트 시큐리티 프로젝트 통합 기술 표준 (백엔드 아키텍처, DB 스키마, 프론트엔드 패턴 등)
---

# 스마트 시큐리티(Smart Security) 기술 표준

이 프로젝트의 코드를 작성하거나 수정할 때는 반드시 아래 표준을 준수해야 합니다.

## 1. 백엔드: SQL 중심 리포지토리 패턴 (SQL-First)
*복잡한 ORM 사용 금지. 직관적인 SQL 사용.*

### A. 라우터 규칙 (`router.py`)
- **DB 세션 주입 금지**: 함수 인자에 `db: AsyncSession` 절대 넣지 말 것.
- **ORM 임포트 금지**: `select`, `insert` 같은 SQLAlchemy 모델 함수 임포트 배제.
- **역할 정의**: 입력값 검증 -> 리포지토리 호출 -> 응답 반환 (단순 중계).

### B. 리포지토리 규칙 (`repository.py`)
- **순수 SQL 사용**: `SELECT ... FROM ...` 처럼 명시적인 SQL 문자열 작성.
- **헬퍼 함수 활용**: `back.database`의 `fetch_all`, `fetch_one`, `execute` 함수를 사용하여 안전하게 실행.
- **반환 타입**: 헬퍼 함수가 반환하는 `dict` (또는 dict 리스트)를 그대로 라우터에 전달.

## 2. 데이터베이스 스키마 및 계층 구조
*데이터 시딩(Seeding) 및 삭제 시 반드시 지켜야 할 의존성 순서.*

### 부모-자식 관계 (생성 순서)
1. **Companies** (업체 정보 - 최상위)
2. **Users** (로그인 계정)
3. **Workers** (작업자 프로필 - User와 Company를 연결)
4. **DailyWorkPlans** (작업 계획서)
5. **WorkerAllocations** (작업자 배정 정보)

### 운영 수칙
- **초기화/삭제 시**: 반드시 **역순으로 삭제(DROP)** 해야 함. (배정 -> 계획 -> 작업자 -> 유저 -> 업체)
- **유저-작업자 매핑**: `User` 계정 없이 `Worker` 데이터만 생성하는 것은 **절대 금지**.

## 3. 프론트엔드: 리액트 컴포넌트 구조
- **기능 중심(Feature-First)**: 특정 도메인(예: 대시보드)에 종속된 컴포넌트는 `features/<기능명>` 폴더에 위치.
- **공통 컴포넌트**: 버튼, 모달 등 어디서나 쓰는 것만 `components/common`에 위치.
- **레이아웃**: 페이지 전체 틀은 `components/layout`에 위치.

## 4. 문서 작성 표준
- **TXT 파일 규칙**: `Project_Docs/**/*.txt` 작성 시 마크다운 문법(`#`, `**`) 사용 금지. 순수 텍스트(`===`, `1.`)로만 작성.
- **로그 파일명**: `YYYY-MM-DD.txt` 형식 준수.

## 5. 데이터베이스 및 마이그레이션
- **ORM**: SQLAlchemy (Async)
- **Migration**: Alembic
- **Reset Rule**:
  - 개발 중 DB 초기화(`reset_db.py`) 시, **테스트 가능한 Full Seed Data**를 자동 생성한다.
  - **필수 생성 목록**:
    1. **Users**: Admin(`a`), Manager(`m`), Worker(`w`) (PW: `0000`)
    2. **Company**: 원청사(General), 협력사(Specialty) 최소 각 1개
    3. **Project**: 진행 중인 프로젝트 1개 (User와 매핑 완료된 상태)
    4. **Site & Zone**: 현장 및 위험구역(Zone) 데이터
    5. **Work Info**: 작업 템플릿, 금일 작업 계획 등 기본 데이터

## 6. DB 마이그레이션 및 배포 프로세스 (Alembic Workflow)
*DB 스키마 변경 시 아래 절차를 엄수해야 함. `Base.metadata.create_all` 사용 금지.*

1. **로컬 개발 (Migration 생성)**:
   - 모델 코드를 수정한 후 반드시 로컬에서 마이그레이션 파일 생성.
   - 명령어: `alembic revision --autogenerate -m "변경내용"`
   - 생성된 `migrations/versions/*.py` 파일을 Git에 Commit & Push.

2. **서버 배포 (Migration 적용)**:
   - 배포 스크립트(`deploy_server.ps1`)는 반드시 코드 Pull 이후에 `alembic upgrade head`를 실행해야 함.
   - 서버에서 `create_all` 등 자동 생성 함수를 호출하지 않도록 주의.

## 7. 날짜 및 시간 처리 표준 (Date/Time Handling)
*PostgreSQL(asyncpg)의 Strict Type Checking으로 인한 에러를 방지하기 위함.*

- **원칙**: DB 쿼리 파라미터로 날짜를 넘길 때는 반드시 **Python `date` 객체**를 사용해야 한다. 문자열(`str`) 금지.
- **유틸리티 사용**: `back.utils.date_utils`를 사용하여 날짜를 생성 및 변환한다.
  - `get_today()`: 오늘 날짜 (`date` 객체)
  - `ensure_date(val)`: 입력값을 안전하게 `date` 객체로 변환
- **금지 패턴**:
  - ❌ `today = str(date.today())`
  - ❌ `fetch_one(..., {"date": "2024-01-01"})`
- **권장 패턴**:
  - ✅ `today = date_utils.get_today()`
  - ✅ `fetch_one(..., {"date": today})`
