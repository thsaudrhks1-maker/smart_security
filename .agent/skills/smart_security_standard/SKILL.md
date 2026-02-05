---
name: Smart Security 기술 표준
description: 스마트 시큐리티 프로젝트 통합 기술 표준 (백엔드 아키텍처, DB 스키마, 프론트엔드 패턴 등)
---

# 스마트 시큐리티(Smart Security) 통합 기술 표준

이 문서는 프로젝트의 **가장 상위 레벨의 원칙(High-Level Principles)**을 정의합니다.
구체적인 구현 방법은 각 **전문 스킬(Specialized Skills)**을 참조하십시오.

## 🔗 전문 스킬 참조 가이드

| 영역 | 스킬 이름 | 역할 및 내용 |
| :--- | :--- | :--- |
| **Backend** | `sql_repository_pattern` | 라우터/리포지토리 작성 규칙, 순수 SQL 사용 원칙 |
| **Database** | `db_lifecycle_manager` | 스키마 구조, 시딩 순서, 마이그레이션 절차 |
| **Frontend** | `frontend_standard` | 컴포넌트 구조, 디자인 패턴 |
| **Common** | `core_utils` | 날짜 처리(Date Utils), 에러 핸들링, 로깅 유틸 |

---

## 1. 프로젝트 통합 행동 강령 (Global Rules)

### A. 언어 및 소통 (Language)
- **한국어 필수 (Korean ONLY)**: 모든 대화, 코드 주석, 결과 보고는 반드시 한국어로 한다.

### B. 커맨드 및 환경 설정
- **직접 실행 금지**: 사용자가 복사/붙여넣기 할 수 있는 텍스트로 명령어 제공.
- **가상환경 필수**: `.\venv\Scripts\python ...` 경로 명시.

### C. 문서 및 로그 (Documentation)
- **Plain Text**: 로그는 마크다운 문법 없이 텍스트로 작성 (`===`, `---` 사용).
- **Daily Log**: `YYYY-MM-DD.txt` 형식으로 `Project_Docs/Daily_Log`에 작성.

### D. 오류 자가 진단 (Self-Correction)
- 명령어 실행 후 반드시 **로그를 끝까지 확인**하여 에러(`Fail`, `Traceback`)를 감지하고 수정한다.

## 2. API 및 통신 표준 (API Standards)

### A. URL 경로 구조 (API Prefixing)
- **`/api` 접두어 필수**: 백엔드 데이터 요청과 프론트엔드 라우팅을 명확히 구분하기 위해 모든 백엔드 엔드포인트는 `/api` 접두어를 사용한다.
  - ✅ 백엔드 데이터: `GET /api/work/plans`
  - ✅ 프론트엔드 페이지: `http://localhost:5173/work/plans`
- **중앙 집중식 관리**:
  - **백엔드**: `back/main.py`에서 `include_router(..., prefix="/api")`를 통해 일괄 적용한다. 개별 라우터 파일의 `prefix`에는 `/api`를 붙이지 않는다.
  - **프론트엔드**: `src/api/client.js`의 `baseURL`에 `/api`를 포함시킨다. 개별 API 라이브러리(예: `workApi.js`)에서는 `/api`를 생략하고 하위 경로만 작성한다.

## 3. 데이터 처리 및 날짜 표준 (Data & Date Standards)

### A. 날짜 및 시간 생성 (Application-Level Timestamps)
- **DB 자동 생성 금지**: `NOW()`, `CURRENT_TIMESTAMP`, `DEFAULT NOW()` 등 DB 엔진에서 자동으로 시간을 생성하는 기능을 지양한다.
- **애플리케이션 계층 생성**: 모든 날짜와 시간은 백엔드(Service/Repository) 또는 프론트엔드에서 명시적으로 생성하여 데이터베이스에 전달한다.
- **이유**: 시점의 일관성 유지, 비즈니스 로직에서의 시간 제어권 확보, 테스트 용이성을 위함이다.
- **파이썬 기준**: `datetime.now()`를 사용하여 전달한다.

