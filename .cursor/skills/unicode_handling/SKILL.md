---
name: unicode_handling
description: JSON 및 DB에서 한글(유니코드)을 읽기 쉽게 다루기 위한 가이드.
---

# 유니코드 처리 및 한글 텍스트 저장

이 스킬은 한글(및 기타 비 ASCII 문자)이 DB에 저장되고 JSON으로 직렬화될 때, `\uc548...` 같은 유니코드 이스케이프가 아니라 **사람이 읽기 쉬운 형태**로 유지되도록 합니다.

## 1. 원칙

1.  **DB 저장**: 텍스트는 DB에 UTF-8로 직접 저장한다. 유니코드 이스케이프 문자열을 저장하지 않는다.
    *   DB 문자셋은 `utf8mb4`(또는 `utf8`)로 설정한다.
    *   ORM(SQLAlchemy) 사용 시 Python 문자열/리스트/딕셔너리를 그대로 넘긴다. 드라이버(예: `asyncpg`)가 인코딩을 처리한다.
    *   JSON 컬럼에 넣을 때 **가능하면** `json.dumps()`로 직접 직렬화하지 않는다. 꼭 쓸 경우 `ensure_ascii=False`를 사용한다.

2.  **JSON 직렬화**: JSON 파일이나 API 응답을 수동으로 문자열로 만들 때:
    *   `json.dumps(data, ensure_ascii=False)`를 사용한다.
    *   그러면 `\uXXXX` 시퀀스가 생기지 않고 "안전모" 같은 한글이 그대로 읽기 쉽게 나온다.

3.  **API 응답**:
    *   FastAPI/Starlette는 JSON 인코딩을 자동으로 처리한다.
    *   `JSONResponse`를 반환하면 일반적으로 UTF-8이 적용된다.
    *   응답 본문을 직접 만드는 경우 UTF-8 인코딩을 사용한다.

## 2. 구현 가이드

### Python `json.dumps`
❌ **나쁜 예 (기본값):**
```python
import json
data = {"name": "안전모"}
print(json.dumps(data)) 
# 출력: {"name": "\uc548\uc804\ubaa8"}  <-- 읽기 어렵고 용량도 큼
```

✅ **좋은 예:**
```python
import json
data = {"name": "안전모"}
print(json.dumps(data, ensure_ascii=False))
# 출력: {"name": "안전모"} <-- 읽기 쉽고 간결함
```

### SQLAlchemy / DB
*   **JSON 컬럼**: 컬럼을 `JSON` 또는 `JSONB`로 정의하고, Python 딕셔너리/리스트를 그대로 넘긴다.
    ```python
    # model.py
    from sqlalchemy import Column, JSON
    
    class WorkItem(Base):
        ...
        attributes = Column(JSON)

    # 사용
    item = WorkItem(attributes={"color": "빨강", "type": "안전"})
    # SQLAlchemy/드라이버가 올바르게 전달함.
    ```
*   **Text/String 컬럼**: JSON 타입이 있는 DB라면 Text 컬럼에 JSON을 넣지 않는 것이 좋다. 부득이하게 넣을 때는 먼저 직렬화한다.
    ```python
    item = WorkItem(data_str=json.dumps(my_dict, ensure_ascii=False))
    ```

## 3. 이미 이스케이프된 데이터 수정 절차
1.  **확인**: DB 레코드에서 `\u`로 시작하는 문자열이 있는지 조회한다.
2.  **마이그레이션/수정**:
    *   로드: `data = json.loads(db_content)`
    *   저장: JSON 컬럼이면 Python 객체로 업데이트하고, Text 컬럼이면 `json.dumps(data, ensure_ascii=False)`로 넣어 업데이트한다.

## 4. 검증
*   DBeaver, TablePlus 등 DB 클라이언트로 테이블 뷰에서 한글이 정상적으로 보이는지 확인한다.
