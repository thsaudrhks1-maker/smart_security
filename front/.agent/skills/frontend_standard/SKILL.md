---
name: Frontend Standard
description: 리액트 컴포넌트 구조, 역할별 라우팅 및 폴더 계층 관리 표준.
---

# 프론트엔드 구조 표준 (Structure & Routing)

## 1. 컴포넌트 관리 체계 (Flat First Architecture)

복잡한 폴더 깊이를 피하고 가독성을 높이기 위해 '납작한(Flat)' 구조를 지향합니다.

1. **Global Shared (@/components/common/)**: 전역에서 2회 이상 자주 쓰이는 진짜 공통 컴포넌트만 모읍니다. (예: `CommonMap.jsx`, `Modal.jsx`)
2. **Feature Flat (@/features/<role>/<feature>/)**: 특정 기능 폴더에 파일로 직접 둡니다.
    - 부속 컴포넌트가 필요하면 같은 폴더 내에 `DashboardCards.jsx` 식으로 생성.

## 2. 역할별 라우팅 분기 (Role Routing)

사용자 역할(`role`)에 따라 접근 권한과 레이아웃을 엄격히 분리합니다.

- **Admin (`/admin`)**: 시스템 전역 관리 및 현장 개설.
- **Manager (`/manager`)**: 투입 현장 승인 및 일일 안전 점검.
- **Worker (`/worker`)**: 스마트 출역신고 및 위험 구역 확인 (모바일).

## 3. 임포트 및 모듈 규칙

- **`@` 별칭 사용**: 모든 경로는 `src`를 가리키는 `@/` 별칭 사용 필수.
- **API 캡슐화**: 컴포넌트 내에서 `axios`를 직접 쓰지 않고 `@/api/*`에 정의된 모듈만 사용.
- **함수형 지향**: 모든 컴포넌트는 `Arrow Function` 기반 함수형 컴포넌트로 작성.
