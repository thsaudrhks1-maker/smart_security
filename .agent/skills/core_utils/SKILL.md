---
name: Core Utils and Error Handling
description: 표준 유틸리티(JSON/HTTP), 날짜 처리(Date/Time) 및 에러 핸들링 데코레이터 사용 규칙. 데이터 작업이나 날짜 변환 시 반드시 이 가이드를 참조하세요.
---

# 핵심 유틸리티 및 에러 처리 (Core Utils & Error Handling)

이 프로젝트는 `back.utils` 패키지에 표준 유틸리티를 모아두어 코드 재사용성을 높이고 에러 처리를 표준화합니다.

## 1. 예외 처리 데코레이터 (`back.utils.common`)

### API 라우터용: `@handle_exceptions`
비동기 FastAPI 라우터에서 사용합니다. 예외 발생 시 상세 로그(Traceback)를 출력하고 클라이언트에게는 500 에러와 함께 정제된 메시지를 전달합니다.
- **매개변수**: `default_message` (실패 시 기본 노출 문구)
- **특징**: `HTTPException`은 그대로 통과시켜 의도된 에러 처리를 보장합니다.

### 일반 함수용: `@handle_sync_exceptions`
동기 방식의 유틸리티나 백그라운드 스크립트에서 사용합니다.
- **동작**: 예외 발생 시 로그만 남기고 `None`을 반환하여 시스템 중단을 방지합니다.

### 코드 블록용: `safe_execute` (Context Manager)
- **용도**: 파일 IO, 네트워크 통신 등 함수의 일부분만 예외 보호가 필요할 때 `with` 문과 함께 사용합니다.

---

## 2. 데이터 및 파일 헬퍼 (`back.utils.common`)

| 함수명 | 설명 | 비고 |
| :--- | :--- | :--- |
| `load_json_safe(path, default={})` | JSON 파일을 읽어 딕셔너리로 반환 | 파일 없거나 파싱 에러 시 `default` 반환 |
| `save_json_safe(path, data)` | 딕셔너리를 UTF-8 JSON 파일로 저장 | 디렉토리 자동 생성, 한글 깨짐 방지 (`ensure_ascii=False`) |
| `append_json_line(path, data)` | 데이터를 JSONL(Line) 형식으로 추가 | 로그 기록 등에 활용 |
| `safe_http_get(url, headers=None)` | GET 요청을 안전하게 수행 | `(JSON데이터, 에러메시지)` 튜플 반환 |

---

## 3. 날짜 및 시간 처리 (`back.utils.date_utils`)

전달 방식: **리포지토리에 날짜를 넘길 때는 반드시 객체(`date`, `datetime`) 상태로 넘깁니다.**

| 함수명 | 설명 | 반환 타입 |
| :--- | :--- | :--- |
| `get_today()` | 오늘 날짜 (DB 쿼리용 권장) | `date` |
| `get_now()` | 현재 일시 (기록용 권장) | `datetime` |
| `ensure_date(val)` | 문자열(`YYYY-MM-DD`)이나 객체를 안전하게 `date`로 변환 | `date` |
| `format_to_str(d)` | 객체를 `"YYYY-MM-DD"` 문자열로 변환 | `str` |
| `format_to_datetime_str(dt)` | 객체를 `"YYYY-MM-DD HH:MM:SS"`로 변환 | `str` |

---

## 4. Import 및 사용 규칙

1. **Import 경로 준수**: `back.utils.common` 또는 `back.utils.date_utils`를 명시적으로 구분하여 가져옵니다.
2. **한글 처리**: 모든 파일 저장 유틸리티는 `ensure_ascii=False`가 적용되어 있으므로 별도 설정 없이 한글을 다룰 수 있습니다.
3. **에러 메시지**: 데코레이터 사용 시 `default_message`를 사용자 친화적인 한글(예: "사용자 정보를 불러오지 못했습니다")로 작성하세요.

