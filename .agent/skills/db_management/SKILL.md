# DB Management & Seeding Standard

이 스킬은 스마트 시큐리티 프로젝트의 데이터베이스 초기화(Seeding) 및 관리 체계를 정의합니다.

## 1. 마스터 시드 (Master Seed) 운영 원칙
- **단일 소스 (SSOT)**: `master_seed.py`는 프로젝트의 모든 초기 데이터를 담고 있는 유일한 표준 실행 파일입니다.
- **멱등성 (Idempotency)**: 여러 번 실행해도 동일한 결과를 보장해야 합니다. (`TRUNCATE ... RESTART IDENTITY`)
- **Fresh Start**: 실행 시 테이블을 삭제(Drop)하지 않고, 데이터만 비우며 PKEY 시퀀스를 1로 초기화합니다.
- **데이터 확인 기준 (Ground Truth)**: DB에 현재 어떤 데이터(업체, 유저, 구역 등)가 들어있는지 확인이 필요한 경우, `master_seed.py`의 최신 소스 코드를 가장 정확한 참고 자료로 활용합니다. 굳이 DB를 매번 직접 조회하지 않아도 시드 코드를 통해 데이터 구성을 파악할 수 있습니다.

## 2. 시드 파일 버전 관리 (Versioning Strategy)
에이전트는 `master_seed.py`를 수정하기 전에 반드시 다음 절차를 따릅니다.
1. **이전 파일 백업**: 기존 `master_seed.py`를 `seeds/master_seed_v{N}.py` 또는 `seeds/master_seed_YYYYMMDD.py` 경로로 복사합니다.
2. **신규 반영**: 사용자 요청사항을 반영하여 `master_seed.py`를 업데이트합니다.
3. **히스토리 보존**: `seeds/` 폴더 내의 파일들을 통해 데이터 변경 이력을 관리합니다.

## 3. 데이터 정합성 가이드
- **프로젝트 ID**: 모든 테스트 데이터는 기본적으로 `project_id = 1`로 연결합니다.
- **계정 속성**: 모든 테스트 계정의 초기 비밀번호는 `0000`으로 통일하며, `bcrypt` 해싱을 거쳐 저장합니다.
- **현장 가용 인원**: `project_users` 테이블에 `status = 'ACTIVE'`로 등록된 인원만 현장 대시보드에서 가용 인원으로 표시됩니다.
- **위험 구역 사진**: `uploads/daily_danger_images` 폴더에 존재하는 실제 파일명을 `daily_danger_images` 테이블에 매핑합니다.

## 4. 백업 및 복구
- 로컬 `pg_dump` 백업이 실패할 경우, 위에서 정의한 **시드 파일 버전 관리**를 통해 소스 코드 레벨에서 데이터를 복구하는 방식을 우선합니다.
- 중요한 데이터 변경 전에는 반드시 `seeds/` 폴더에 백업본이 있는지 확인합니다.
