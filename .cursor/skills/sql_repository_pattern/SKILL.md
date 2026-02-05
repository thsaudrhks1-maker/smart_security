---
name: SQL 리포지토리 패턴
description: 복잡한 ORM 대신 Raw SQL 쿼리를 사용하는 백엔드 작성 규칙.
---

# SQL 중심 리포지토리 패턴 (SQL-First Repository Pattern)

## 1. 철학 (Philosophy)
- **3계층 아키텍처 (3-Layer Architecture)**: 앱 로직은 Router -> Service -> Repository 로 분리합니다.
- **얇은 라우터 (Router is Thin)**: 요청 수신, 입력 검증, Service 호출만 수행. DB/비즈니스 로직 금지.
- **비즈니스 서비스 (Service is Logic)**: 트랜잭션 관리, 복잡한 비즈니스 로직, 여러 Repository 조합 수행.
- **SQL 리포지토리 (Repository is SQL)**: 가독성과 성능을 위해 **Raw SQL 쿼리** 사용. ORM은 스키마 정의/마이그레이션용으로만 제한.
- **DB 헬퍼 활용**: `back.database`의 헬퍼 함수(`fetch_all`, `fetch_one`, `execute`, `insert_and_return`)를 사용.

## 2. 구조 규칙 (Structure Rules)

### A. 라우터 (`router.py`)
- **절대 금지**: `db: AsyncSession` 또는 ORM 모델을 주입받지 마십시오.
- **절대 금지**: Repository를 직접 호출하지 말고, Service를 경유하십시오.
- **권장**: Service 클래스의 정적(static) 메서드를 호출하십시오.

```python
from fastapi import APIRouter
from back.feature.service import FeatureService

router = APIRouter()

@router.get("/")
async def get_items():
    return await FeatureService.get_processed_items()
```

### B. 서비스 (`service.py`)
- 비즈니스 유효성 검사, 데이터 가공, 다중 리포지토리 호출을 담당합니다.
- Repository에서 가져온 딕셔너리 데이터를 정제하여 라우터로 전달합니다.

```python
from back.feature.repository import FeatureRepository

class FeatureService:
    @staticmethod
    async def get_processed_items():
        items = await FeatureRepository.get_all_items()
        # 비즈니스 로직 처리 (예: 필터링, 데이터 가공)
        return [{"id": i["id"], "name": i["name"].upper()} for i in items]
```

### C. 리포지토리 (`repository.py`)
- `back.database`에서 헬퍼 함수들을 임포트하십시오 (`fetch_all`, `fetch_one`, `execute`).
- 명시적인 SQL 문자열을 작성하고 바인딩 파라미터(`:param`)를 사용하십시오.
- **절대 금지**: SQLAlchemy ORM의 `db.add()`, `db.commit()` 등을 비즈니스 로직에서 사용하지 마십시오.

```python
from back.database import fetch_all, fetch_one, execute

class FeatureRepository:
    @staticmethod
    async def get_all_items():
        sql = "SELECT id, name FROM items WHERE is_active = true"
        return await fetch_all(sql)
```

## 3. ORM은 언제 쓰는가?
- **오직 스키마 관리용 (Alembic Migrations)** 및 **테이블/컬럼 정의**.
- **초기 시딩(Seeding)**: 더미 데이터 생성 시에는 ORM이 편리할 수 있습니다.
- 실제 서비스의 실시간 CRUD 로직은 반드시 Raw SQL 패턴을 사용하십시오.
