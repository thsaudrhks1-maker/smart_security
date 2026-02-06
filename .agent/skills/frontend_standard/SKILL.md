
---
name: Frontend Standard
description: 리액트 컴포넌트 구조, 역할별 라우팅 및 데스크탑/모바일 UI 분리 표준.
---

# 프론트엔드 개발 표준 (Frontend Standard)

## 1. 역할 중심 폴더 아키텍처 (Role-Based Structure)

우리 프로젝트는 **사용자 역할(Role)**에 따라 기능이 완전히 분리되므로, `features` 폴더 내에서 이를 엄격히 분기합니다.

### 🏗️ 디렉토리 분기 규칙
- **`@/features/admin/`**: 최고 관리자용 (데스크탑 전용, 시스템 전체 관리)
- **`@/features/manager/`**: 현장 관리자용 (데스크탑/태블릿, 현장 관제 및 승인)
- **`@/features/worker/`**: 근로자 전용 (모바일 전용, 작업 확인 및 안전 신고)

## 2. 레이아웃 및 라우팅 분기 (Routing Branching)

사용자 로그인 후 `role`에 따라 완전히 다른 레이아웃을 렌더링해야 합니다.

```javascript
/* App.jsx 에서의 분기 표준 */
<Routes>
  {/* 비로그인: 공통 로그인 페이지 */}
  <Route path="/" element={<Login />} />

  {/* Admin 분기: AdminLayout (Sidebar + Header) */}
  <Route path="/admin/*" element={<AdminLayout />}>
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="projects/*" element={<ProjectRoutes />} />
  </Route>

  {/* Worker 분기: MobileLayout (Bottom Navigation) */}
  <Route path="/worker/*" element={<WorkerMobileLayout />}>
    <Route path="home" element={<WorkerDashboard />} />
    <Route path="map" element={<SafetyMap />} />
  </Route>
</Routes>
```

## 3. 플랫폼별 디자인 가이드 (Device-Specific Design)

### 🖥️ 데스크탑 (Admin / Manager)
- **패턴**: 사이드바 기반 화면 구성 + 데이터 그리드(Table) 중심.
- **스크롤바**: `index.css`에 정의된 **슬림 & 투명 스크롤바** 강제 적용.
- **시인성**: 메인 텍스트 `#0f172a`, 서브 텍스트 `#475569`.

### 📱 모바일 (Worker)
- **패턴**: 바텀 내비게이션 + 카드(Card) UI 중심.
- **터치 영역**: 모든 버튼은 최소 44px 이상의 터치 영역 확보.
- **다크모드**: 현장에서의 눈피로도를 고려하여 다크모드를 우선 고려.

## 4. 데이터 연동 및 선택 패턴

1.  **동적 필터링**: 시공사가 선택되면 소속 관리자만 필터링되어야 함.
2.  **직접 입력 토글**: 목록에 없는 엔티티를 위해 상시 `+ 직접 등록` 버튼 제공.
3.  **실제적 더미**: `atomic_reset.py` 수행 시 발주-시공-협력 관계가 깨지지 않아야 함.
