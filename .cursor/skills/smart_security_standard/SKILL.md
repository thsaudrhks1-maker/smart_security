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

