---
name: project_architect
description: 스마트 건설안전 프로젝트의 아키텍처(Modular Monolith) 및 폴더 구조 규칙을 강제합니다.
---

# 🏗️ Project Architect Skill (구조 설계 원칙)

**[핵심 철학]**
- **❌ `back/models`, `back/routers` 폴더 금지!** (기능과 상관없이 기술별로 묶지 마세요)
- **✅ 기능(Feature)별 수직 응집!** (관련된 코드는 한 곳에 모으세요)

## 1. 📂 백엔드 폴더 구조 (Backend Structure)
모든 새로운 기능 추가 시, 반드시 아래와 같이 **새로운 폴더**를 생성해야 합니다.

```
back/
├── main.py              # 앱 진입점
├── database.py          # DB 설정
├── login/               # [기능 1] 로그인/인증
│   ├── router.py        # API 엔드포인트
│   ├── service.py       # 비즈니스 로직 (SQL 금지, Repository 호출)
│   ├── repository.py    # DB 쿼리(CRUD) 실행
│   ├── model.py         # SQLAlchemy 모델 클래스 정의
│   └── schemas.py       # Pydantic DTO
├── work/                # [기능 2] 작업/공정
│   ├── router.py
│   ├── repository.py
│   ├── model.py         # (DailyJob, Worker 모델 등)
│   └── ...
└── (safety, company 등 기능별 폴더 추가)
```

### [규칙 상세]
1.  **`model.py`**: 오직 **DB 테이블(Entity) 정의**만 합니다.
2.  **`repository.py`**: **DB 쿼리(CRUD)**만 담당합니다. (비즈니스 로직 금지)
3.  **`service.py`**: **비즈니스 로직**만 담당합니다. (SQL 직접 작성 금지, Repository 호출)
4.  **API 버전:** URL은 반드시 `/api/v1/[feature_name]` 형식을 따릅니다.
5.  **의존성 방향:** `Router` -> `Service` -> `Repository` -> `Model` (역방향 참조 금지)

## 2. ⚛️ 프론트엔드 구조 (React + Vite)
- **공통 UI:** `src/components/common/` (버튼, 카드 등)
- **기능 UI:** `src/features/[feature_name]/` (해당 기능 전용 컴포넌트)
- **페이지:** `src/pages/` (라우팅 단위 페이지)

## 3. 🚨 절대 금지 (DO NOT)
- `back/models/all_models.py` 처럼 모든 모델을 한 파일에 몰아넣기 금지.
- `back/routers/all_routers.py` 처럼 모든 라우터를 한 곳에 모으기 금지.
- **기존에 잘 나눠진 구조를 깨고 다시 `models` 폴더를 만드는 행위 절대 금지.**

## 4. 실행 트리거
- "새로운 기능을 추가해줘" (예: 안전 점검 기능 등)
- "DB 테이블을 만들어줘" (어디에 만들지 폴더부터 고민할 것)
