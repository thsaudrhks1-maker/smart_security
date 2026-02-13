---
name: Database Lifecycle Manager
description: DB 스키마 의존성 관리, 시딩(Seeding) 순서, 마이그레이션(Alembic) 워크플로우를 담당하는 스킬.
---

# Database Lifecycle Manager

본 스킬은 프로젝트의 데이터베이스 생애주기 전반을 관리하며, 특히 상무님 등 주요 의사결정자에게 보여줄 데모 데이터를 생성하는 규칙을 정의합니다.

## 0. 테이블 명명 규칙 (Table Naming Convention)

### 참조 테이블 (Junction Table) 규칙
Many-to-Many 관계의 중간 테이블은 관계의 성격을 명확히 나타내는 **직관적인 이름(Descriptive Name)**을 사용합니다. 별도의 접미사(`_links`, `_maps` 등)를 강제하지 않으며, 테이블 자체가 담고 있는 데이터의 의미를 우선시합니다.

**권장 형식:**
```
{주체}_{대상} 또는 {주체}_{관계의_의미}
```

**예시:**
- ✅ `project_users` (프로젝트 ↔ 사용자 연결)
- ✅ `project_companies` (프로젝트 ↔ 참여 업체 연결)
- ✅ `daily_worker_users` (작업 ↔ 배정된 작업자)
- ✅ `content_work_gear_map` (작업 ↔ 보호구 매핑)

**이유:**
- 직관성: `links`라는 추상적인 단어보다 `users`, `companies` 등 실제 데이터의 정체가 명확함
- 유연성: 로컬 파일(model.py) 로드 시 테이블 정의와 규칙이 일치하지 않는 문제를 방지
- 일관성: 이미 구축된 `back/database.py`의 모델 리스트와 명명법을 통일함


## 1. 개요
데이터베이스의 일관성을 유지하고, 개발 및 데모 환경에서 즉시 사용 가능한 풍부한 데이터를 공급하는 것을 목표로 합니다.

## 2. 시딩(Seeding) 가이드
- **위치:** 모든 테스트 및 시딩 스크립트는 루트 디렉토리의 `script_test/` 폴더 내에 보관합니다.
- **실행 방식:** 패키지 모듈 방식 대신 직접 실행 가능하도록 `sys.path` 설정을 포함해야 합니다.
- **데이터 품질:** 
    - 실제 현장 용어 사용 (예: '작업1' 금지, '지하 1층 환기 덕트 설치' 권장)
    - 시간 데이터는 항상 실행 시점의 `today()`와 동기화
- **정합성 유지:** 데이터 삽입 전 반드시 `fix_sequence`를 통해 PostgreSQL ID 시퀀스를 초기화합니다.

## 3. DB 설계 및 테이블 생성 원칙 (필독)
에이전트는 새로운 기능을 구현하거나 스키마를 수정할 때 다음 원칙을 반드시 준수합니다.
- **참조 테이블 원칙:** 다른 테이블의 ID(Foreign Key) 목록을 저장해야 할 경우, **JSON 배열을 사용하지 않고 반드시 다대다(M:N) 매핑 테이블을 생성**합니다. (예: `required_ppe`를 JSON으로 넣는 대신 `template_resource_map` 테이블 사용)
- **JSONB 사용 제한:** JSON 데이터 타입은 다음의 경우에만 예외적으로 허용합니다.
    1. 필드 구성이 극히 유동적인 메타데이터 (예: 센서 로그의 로우 데이터)
    2. 단순 텍스트 설명의 집합 (참조가 필요 없는 단순 코멘트 리스트 등)
- **데이터 무결성:** 참조 테이블 생성 시 반드시 `FOREIGN KEY` 제약 조건을 걸어 데이터 정합성을 보장합니다.
- **정규화:** 제3정규화까지 고려하여 중복 데이터를 최소화합니다.

## 3. 마이그레이션 규칙 (Atlas)

본 프로젝트는 스키마의 가시성과 관리 효율을 위해 **Atlas**를 마이그레이션 도구로 사용합니다. SQLAlchemy 모델을 '진실의 원천(Source of Truth)'으로 삼아 DB 상태를 동기화합니다.

- **선언적 방식 (Declarative):** `atlas schema apply` 명령을 사용하여 모델의 변경 사항을 DB에 즉시 반영하거나 마이그레이션 계획을 생성합니다.
- **Provider 설정:** `atlas-provider-sqlalchemy`를 사용하여 파이썬 모델(Base)을 Atlas가 인식할 수 있는 데이터 소스로 연결합니다.
- **실행 프로세스 (CLI):**
    - **변경 사항 확인:** `atlas schema diff --from "postgres://..." --to "sqlalchemy://back.database?dialect=postgresql"`
    - **드라이 런 (Dry Run):** `atlas schema apply --to "sqlalchemy://back.database?dialect=postgresql" --url "postgres://..." --dry-run`
    - **실제 서버 적용:** `atlas schema apply --to "sqlalchemy://back.database?dialect=postgresql" --url "postgres://..." --auto-approve`
- **시각화:** Atlas UI를 통해 ER 다이어그램을 확인하고, 구조 변경 시 데이터 파괴 위험(Drop column 등)을 사전에 린팅(Linting)합니다.
- **모델 등록 필수:** 새로운 테이블 추가 시 반드시 `back/database.py`의 하단 모델 임포트 리스트에 등록해야 Atlas가 인식할 수 있습니다.

## 4. 주요 스크립트 명세
- `master_seed_combined.py`: 업체, 유저, 프로젝트, 일일 계획 등 통합 골든 시드 데이터 주입
- `local_db_backup.py`: 현재 로컬 데이터베이스를 `db_backups/` 폴더에 .sql 파일로 백업
- `script_test/scenario_seeder.py`: 특정 인물(강공남 등) 중심의 일일 현장 시나리오 생성
- `scripts/db_restore.py`: `db_backups/` 내의 특정 파일을 선택하여 데이터베이스를 복구

## 5. DB 백업 및 복구 지침 (Backup & Restore)
데이터베이스의 안전한 관리와 데이터 영속성을 위해 다음 지침을 따릅니다.

- **백업 파일 위치:** 모든 DB 백업 파일은 루트의 `db_backups/` 폴더에 보관합니다.
- **백업 자동화:** 주요 기능 개발 완료 또는 데이터 대량 수정 전에는 반드시 `scripts/db_backup.py`를 실행하여 백업본을 생성합니다.
- **복구 절차:** 데이터 유실이나 환경 재설정 시 `scripts/db_restore.py`를 통해 가장 최신의 정상 백업본을 로드합니다.
- **파일명 컨벤션:** `backup_{db_name}_{YYYYMMDD_HHMMSS}.sql` 형식을 유지하여 생성 시점을 명확히 합니다.

## 6. 골든 시드 관리 정책 (Golden Seed Management Policy)

개발 및 데모 환경의 일관성을 위해 모든 대표 더미 데이터는 통합된 하나의 파일에서 관리되어야 합니다.

- **통합 파일:** `master_seed_combined.py` (루트 디렉토리)
- **업데이트 원칙:**
    1. 새로운 시나리오나 데이터 유형(예: 새로운 센서 데이터, 위반 사례 등)을 시딩해야 할 경우, 파편화된 새로운 파일을 만들기보다 `master_seed_combined.py`의 적절한 PHASE에 해당 로직을 통합합니다.
    2. 통합 시드 파일만 실행해도 시스템 전체의 대표적인 상태(업체, 유저, 프로젝트, 일일 계획, 리얼리티 출결 등)가 재현되어야 합니다.
    3. 시드 파일 수정 시, 해당 파일만 봐도 DB에 어떤 종류의 데이터가 어떤 논리로 들어가 있는지(예: 출근 확률 85% 등) 한눈에 파악할 수 있도록 주석을 상세히 작성합니다.
- **관리 이점:** 에이전트가 새로운 기능을 개발할 때 다른 시드 파일을 일일이 뒤지지 않고 `master_seed_combined.py` 하나만 참고하여 현재의 데이터 페르소나를 즉시 이해할 수 있습니다.

