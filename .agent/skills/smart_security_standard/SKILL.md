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

## 2. 프론트엔드 UI/UX 표준 (UI Standards)

### A. 가독성 및 색상 (Aesthetics)
- **라이트 모드 우선 (Main Rule)**: 모든 화면은 **밝은 배경(#f8fafc, #ffffff)**을 기본으로 한다.
- **글자색 시인성**: 배경이 밝으므로 글씨는 무조건 **어두운색(#0f172a, #1e293b, #334155)**을 사용한다.
- **흰색 글씨 금지**: 버튼 내부 등 특수한 경우를 제외하고 메인 텍스트에 흰색(#ffffff)이나 연한 회색을 사용하지 않는다. (스크린샷 가독성 저하 방지)
- **프리미엄 미니멀리즘**: `lucide-react` 아이콘과 부드러운 그림자(`box-shadow`)를 사용하여 모던한 느낌을 유지한다.

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

## 2. 데이터베이스 명명 규칙 (Database Naming Convention)

### A. 참조 테이블 (Junction Table) 명명 규칙
Many-to-Many 관계를 위한 중간 테이블(연결 테이블)은 관계의 의미를 명확히 담은 **직관적인 이름(Descriptive Name)**을 사용합니다. `_links`와 같은 추상적인 접미사는 사용하지 않으며, 현재 구현된 테이블 명칭들을 우선적으로 따릅니다.

**규칙:**
- `{주체}_{대상}` 또는 `{주체}_{의미}` 형식 (예: `project_users`, `project_companies`)
- 단순 연결이 아닌 구체적으로 어떤 엔티티들이 엮이는지 명시

**예시:**
- ✅ `project_users` (프로젝트 ↔ 사용자)
- ✅ `project_companies` (프로젝트 ↔ 업체)
- ✅ `daily_worker_users` (작업 ↔ 작업자)
- ✅ `content_work_gear_map` (작업 ↔ 보호구)

**적용 대상:**
- 작업 ↔ 작업자: `daily_worker_users`
- 프로젝트 ↔ 사용자: `project_users`
- 프로젝트 ↔ 협력사: `project_companies`
- 작업 ↔ 보호구: `content_work_gear_map`

## 3. API 및 통신 표준 (API Standards)

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

## 4. 데이터베이스 구조 및 네이밍 표준 (Database Naming Standard)

- **테이블 및 클래스 네이밍 컨벤션:** 데이터의 성격과 생명 주기에 따라 4가지 접두어를 사용하며, **파이썬 클래스명도 테이블명과 동일하게 `snake_case`로 작성**하여 1:1 매핑을 강제한다. (PascalCase 지양)
  - `sys_`: 시스템 전역 기초 정보 (예: `class sys_users`)
  - `project_`: 프로젝트 물리적 구조 및 소속 (예: `class project_master`)
  - `content_`: 안전/작업 가이드 및 마스터 지식 (예: `class content_safety_gear`)
  - `daily_`: 매일 발생하는 운영 데이터 (예: `class daily_attendance`)

### 도메인별 매핑 테이블 가이드
| 도메인 | 테이블명 기준 |- **데이터 무결성(CASCADE):** 모든 외래키(ForeignKey) 정의 시 반드시 `ondelete="CASCADE"` 옵션을 포함하여 부모 데이터 삭제 시 관련 데이터가 꼬이지 않고 함께 정리되도록 강제한다.
| :--- | :--- |
| **SYS** | `sys_users`, `sys_companies`, `sys_emergency_alerts` |
| **PROJECT** | `project_master`, `project_sites`, `project_zones`, `project_members`, `project_companies` |
| **CONTENT** | `content_work_templates`, `content_safety_gear`, `content_work_gear_map` |
| **DAILY** | `daily_attendance`, `daily_weather`, `daily_notices`, `daily_work_tasks`, `daily_worker_allocations`, `daily_safety_logs`, `daily_danger_zones`, `daily_danger_images`, `daily_violations` |

---

## 5. AI 기술 표준 (AI Integration Standard)

### A. AI 모델 사용 원칙 (Model Selection)
- **Google Generative AI (GenAI) 우선**: 프로젝트의 모든 AI 기능(텍스트 생성, 임베딩, 이미지 생성, 멀티모달)은 Google의 GenAI (Gemini) API를 사용한다.
- **예외 사항**: `LangChain` 또는 `LangGraph` 프레임워크를 사용하는 특수한 경우를 제외하고는 OpenAI 등 타사 모델을 직접 호출하지 않는다.
- **적용 영역**:
  - **텍스트 생성 (LLM)**: 작업 안전 수칙 요약, 사고 사례 분석 등.
  - **임베딩 (Embedding)**: 안전 콘텐츠 및 작업 설명의 벡터 변환.
  - **이미지 생성 (Image Gen)**: 안전 아이콘 및 교육용 이미지 생성.
  - **멀티모달 (Multimodal)**: 현장 사진 분석 및 위험 요소 탐지.

### B. 데이터 가공 및 임베딩 (Processing & Embedding)
- **사전 가공 필수**: 원본 데이터를 임베딩하기 전, AI를 이용해 핵심 요약 및 노이즈 제거를 수행하여 검색 정확도를 높인다.
- **벡터 검색**: 가공된 텍스트의 임베딩 값을 저장하고 코사인 유사도 기반 검색을 수행한다.

