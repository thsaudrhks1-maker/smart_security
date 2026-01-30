---
name: Hybrid Database Pattern
description: SQLAlchemy ORM과 Raw SQL을 효과적으로 함께 사용하기 위한 규칙과 패턴. 트랜잭션 자동 관리 및 쿼리 최적화 헬퍼 함수 활용법 포함.
---

# 하이브리드 DB 패턴 (SQLAlchemy ORM + Raw SQL)

이 프로젝트는 DB 상호 작용을 위해 **하이브리드 접근 방식**을 채택합니다.

1.  **SQLAlchemy ORM (AsyncSession)**:
    *   **용도**: 복잡한 비즈니스 로직, 엔티티 상태 관리, Cascade 삭제 등 객체 지향적 일관성이 중요할 때 사용.
2.  **Raw SQL (Helper Functions)**:
    *   **용도**: 읽기 전용 대량 조회(대시보드), 복잡한 통계/집계 쿼리, 성능이 최우선일 때, 또는 ORM 오버헤드가 불필요할 때 사용.
    *   **헬퍼 함수**: `back.database` 모듈에 정의된 간소화된 함수들(`execute`, `fetch_one`, `fetch_all`, `insert_and_return`)을 사용.

## 규칙 (Rules)

### 1. Import 위치
항상 `back.database`에서 헬퍼 함수를 가져오세요.

```python
from back.database import get_db, execute, fetch_one, fetch_all, insert_and_return
from sqlalchemy import text  # 헬퍼 함수 내부에서 text()를 자동 처리하지만, 복잡한 동적 쿼리 시 필요할 수 있음
```

### 2. 트랜잭션 관리 (Rollback & Commit)

-   **헬퍼 함수 (`execute`, `insert_and_return`)**: 이 함수들은 내부적으로 `engine.begin()`을 사용합니다.
    -   **자동 커밋 (Auto Commit)**: 코드 블록이 에러 없이 실행되면 트랜잭션이 **자동으로 커밋**됩니다.
    -   **자동 롤백 (Auto Rollback)**: 실행 중 예외(Exception)가 발생하면 트랜잭션이 **자동으로 롤백**됩니다.
    -   **사용법**: 별도로 `commit()`이나 `rollback()`을 호출할 필요가 **없습니다**. 예외 발생 시 로그를 남기거나 HTTP 예외로 변환하는 처리만 하면 됩니다.

```python
# ✅ 올바른 사용 예시
try:
    await execute("INSERT INTO logs (msg) VALUES (:msg)", {"msg": "테스트 메시지"})
except Exception as e:
    # 이미 여기서 롤백된 상태임
    print(f"에러 발생: {e}")
```

-   **ORM (`AsyncSession`)**:
    -   ORM 세션은 여전히 수동으로 `commit`을 관리해야 하는 경우가 많습니다.
    -   FastAPI 라우터에서는 `Depends(get_db)`를 사용하여 세션을 주입받으세요.

### 3. SQL 최적화 및 모범 사례

-   **바인딩 파라미터 사용 (Bind Parameters)**: 값 대입 시 절대 파이썬 f-string을 사용하지 마세요. 반드시 바인딩 파라미터(`:param_name`)를 사용하여 **SQL Injection을 방지**하고 쿼리 캐싱 효율을 높여야 합니다.
    -   ❌ `await execute(f"SELECT * FROM users WHERE id = {user_id}")` (절대 금지!)
    -   ✅ `await execute("SELECT * FROM users WHERE id = :uid", {"uid": user_id})`

-   **필요한 컬럼만 조회**: `SELECT *` 대신 필요한 컬럼만 명시적으로 조회하세요.
    -   ✅ `await fetch_all("SELECT id, username FROM users")`

-   **DB 레벨 연산 활용**: 카운트(COUNT), 합계(SUM), 날짜 포맷팅 등은 파이썬으로 가져와서 처리하기보다, 가능한 SQL 쿼리 내에서 해결하세요.

## 사용 예제 (Examples)

### 상황 A: 단순 데이터 조회 (Raw SQL 사용)
위험 장비 개수를 보여주는 대시보드 위젯용.

```python
async def get_danger_count():
    sql = """
        SELECT COUNT(*) as count 
        FROM work_templates 
        WHERE base_risk_score > :threshold
    """
    result = await fetch_one(sql, {"threshold": 80})
    return result['count']
```

### 상황 B: 복잡한 트랜잭션 (ORM 또는 수동 트랜잭션 사용)
주문을 생성하면서 재고를 차감하고 로그를 남기는 등, 여러 테이블에 걸쳐 원자성(Atomicity)과 객체 일관성이 보장되어야 할 때.

*(참고: 단순한 연속 `execute` 호출은 각각 별도의 트랜잭션으로 돌 수 있으니, 강력한 원자성이 필요하면 ORM을 쓰거나 명시적 트랜잭션 블록을 사용해야 합니다.)*

### 상황 C: INSERT 후 결과 반환 (Raw SQL 헬퍼 사용)

```python
async def add_quick_log(msg: str):
    sql = """
        INSERT INTO safety_logs (message, created_at)
        VALUES (:msg, NOW())
        RETURNING id, created_at
    """
    return await insert_and_return(sql, {"msg": msg})
```
