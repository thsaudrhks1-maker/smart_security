---
name: SQL 리포지토리 패턴
description: 복잡한 ORM 대신 Raw SQL 쿼리를 사용하는 백엔드 작성 규칙.
---

# SQL 중심 리포지토리 패턴 (SQL-First Repository Pattern)

## 1. 철학 (Philosophy)
- **얇은 라우터 (Router is Thin)**: 입력값 검증과 리포지토리 호출만 담당. DB 로직 금지.
- **SQL 리포지토리 (Repository is SQL)**: 가독성과 성능을 위해 Raw SQL 쿼리 사용.
- **DB 헬퍼 활용**: `back.database`의 헬퍼 함수(`fetch_all`, `fetch_one`, `execute`, `insert_and_return`)를 사용하여 세션과 트랜잭션을 안전하게 처리.

## 2. 구조 규칙 (Structure Rules)

### A. 라우터 (`router.py`)
- **절대 금지**: `db: AsyncSession`을 함수 인자로 주입받지 마십시오.
- **절대 금지**: SQLAlchemy 모델이나 `select`, `insert`를 임포트하지 마십시오.
- **권장**: 단순히 Repository 클래스를 임포트하고 정적(static) 메서드를 호출하십시오.

```python
from fastapi import APIRouter
from back.feature.repository import FeatureRepository

router = APIRouter()

@router.get("/")
async def get_items():
    return await FeatureRepository.get_all_items()
```

### B. 리포지토리 (`repository.py`)
- `back.database`에서 헬퍼 함수들을 임포트하십시오.
- 명시적인 SQL 문자열을 작성하십시오 (`:param`을 사용하여 안전하게 바인딩).
- 실행 결과인 Dictionary를 그대로 반환하십시오.

```python
from back.database import fetch_all, fetch_one, execute

class FeatureRepository:
    @staticmethod
    async def get_all_items():
        sql = """
            SELECT id, name, status 
            FROM items 
            WHERE is_active = true
            ORDER BY created_at DESC
        """
        return await fetch_all(sql)

    @staticmethod
    async def create_item(name: str):
        sql = "INSERT INTO items (name) VALUES (:name) RETURNING id"
        return await execute(sql, {"name": name})
```

## 3. ORM은 언제 쓰는가?
- **오직 스키마 관리용 (Alembic Migrations)**.
- 실제 서비스의 CRUD 로직은 위 SQL 패턴 사용을 권장합니다.
