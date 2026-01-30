---
name: Core Utils and Error Handling
description: 표준 유틸리티 사용 규칙 및 에러 핸들링 데코레이터 적용 가이드. 일관된 로깅, 안전한 파일 작업, HTTP 에러 응답 표준화를 보장합니다.
---

# 핵심 유틸리티 및 에러 처리 (Core Utils & Error Handling)

이 프로젝트는 `back.utils.common` 모듈에 정의된 표준 유틸리티와 에러 핸들링 데코레이터를 사용하여 시스템의 안정성과 코드 일관성을 유지합니다.

## 1. 예외 처리 (Exception Handling)

비즈니스 로직이나 라우터 함수마다 `try-except` 블록을 중복해서 작성하지 마세요. 대신 표준 데코레이터를 사용하여 예외를 일관되게 처리해야 합니다. 이렇게 하면 서버 로그에는 상세한 트레이스백이 남고, 클라이언트(UI)에는 정제된 에러 메시지가 전달됩니다.

### 비동기 함수 (FastAPI Routers)
API 라우터 함수에는 반드시 `@handle_exceptions` 데코레이터를 붙이세요.

```python
from back.utils.common import handle_exceptions

@router.post("/create")
@handle_exceptions(default_message="데이터 생성 실패")
async def create_data(data: CreateDto):
    # 비즈니스 로직 수행...
    return result
```

*   **동작 원리**:
    *   **성공 시**: 함수 실행 결과를 그대로 반환합니다.
    *   **HTTPException 발생 시**: 의도된 에러이므로 그대로 클라이언트에게 전달합니다 (예: 400 Bad Request).
    *   **기타 예외 발생 시**:
        1.  서버 콘솔에 상세한 트레이스백(Traceback)을 출력합니다.
        2.  클라이언트에게는 `500 Internal Server Error`를 반환합니다.
        3.  응답 메시지(`detail`)에는 `"데이터 생성 실패: {에러내용}"` 형태로 전달되어, 프론트엔드에서 쉽게 `alert` 등으로 띄울 수 있습니다.

### 동기 함수 (Background Tasks / Scripts)
백그라운드 작업이나 일반 함수에는 `@handle_sync_exceptions`를 사용하세요.

```python
from back.utils.common import handle_sync_exceptions

@handle_sync_exceptions(default_message="이미지 처리 오류")
def process_background_image(path: str):
    # 이미지 처리 로직...
```

*   **동작 원리**: 예외가 발생해도 프로세스가 죽지 않고, `None`을 반환하며 로그만 출력합니다.

### 위험한 코드 블록 (Context Manager)
함수 전체가 아니라 특정 코드 블록만 보호하고 싶을 때 사용합니다.

```python
from back.utils.common import safe_execute

# 파일 삭제 시도가 실패해도 프로그램은 계속 진행됨
with safe_execute("임시 파일 삭제 실패"):
    os.remove("temp_file.txt")
```

## 2. 안전한 유틸리티 (Safe Utilities)

파이썬 내장 함수(`open`)나 라이브러리(`requests`)를 직접 사용하기보다, 예외 처리가 내장된 헬퍼 함수를 사용하여 엣지 케이스(파일 없음, 네트워크 끊김 등)를 방어하세요.

*   **`load_json_safe(path, default={})`**: JSON 파일을 읽습니다. 파일이 없거나 내용이 깨져있으면 에러 대신 `default` 값을 반환합니다.
*   **`save_json_safe(path, data)`**: 데이터를 JSON 파일로 저장합니다. 저장 경로의 폴더가 없으면 자동으로 생성해줍니다.
*   **`safe_http_get(url)`**: 외부 API에 GET 요청을 보냅니다. 네트워크 에러가 발생해도 프로그램이 죽지 않고 `(None, 에러메시지)` 튜플을 반환하여 안전하게 처리할 수 있습니다.

## 3. Import 규칙

모든 유틸리티 함수는 `back.utils.common` 경로에서 임포트해야 합니다.

```python
from back.utils.common import (
    handle_exceptions, 
    handle_sync_exceptions, 
    load_json_safe, 
    save_json_safe
)
```
