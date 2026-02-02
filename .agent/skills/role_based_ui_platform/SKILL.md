---
name: Role-Based UI Platform
description: 역할 기반 UI 플랫폼 구조 - 관리자(데스크탑) vs 작업자(모바일) 분기 규칙
---

# 역할 기반 UI 플랫폼 (Role-Based UI Platform)

## 핵심 원칙 (3줄 요약)

1. **폴더 = 역할**: `admin/` = 관리자용, `worker/` = 작업자용
2. **라우팅 분리**: `/admin/*` vs `/worker/*`
3. **스타일 일관성**: 관리자 = 화이트/넓음, 작업자 = 다크/좁음

---

## 폴더 구조

```
front/src/features/
├── admin/              ← 관리자 전용 (데스크탑, 화이트)
│   ├── dashboard/      AdminDashboard.jsx
│   ├── projects/       ProjectList.jsx, CreateProject.jsx, ProjectDetail.jsx
│   ├── sites/          SiteManagement.jsx
│   ├── companies/      CompanyManagement.jsx
│   └── workers/        WorkerManagement.jsx (관리자가 보는 작업자 목록)
│
├── worker/             ← 작업자 전용 (모바일, 다크)
│   ├── dashboard/      WorkerDashboard.jsx
│   ├── work/           WorkList.jsx (작업 목록)
│   ├── safety/         SafetyMap.jsx (위험 지도)
│   └── report/         ReportDanger.jsx
│
└── shared/             ← 공통 컴포넌트 (역할 무관)
    ├── LocationPicker.jsx
    └── Button.jsx
```

---

## 라우팅 규칙

```javascript
// App.jsx
<Routes>
  {/* 로그인 */}
  <Route path="/" element={<Login />} />
  
  {/* 관리자 전용 */}
  <Route path="/admin/*" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="projects" element={<ProjectList />} />
    <Route path="projects/create" element={<CreateProject />} />
    <Route path="projects/:id" element={<ProjectDetail />} />
  </Route>
  
  {/* 작업자 전용 */}
  <Route path="/worker/*" element={<WorkerLayout />}>
    <Route index element={<WorkerDashboard />} />
    <Route path="today" element={<TodayWork />} />
    <Route path="report" element={<ReportDanger />} />
  </Route>
</Routes>
```

---

## 로그인 후 리다이렉트

```javascript
// Login.jsx
const handleLogin = async () => {
  const user = await login(username, password);
  
  if (user.role === 'admin' || user.role === 'manager') {
    navigate('/admin'); // 관리자 대시보드
  } else if (user.role === 'worker') {
    navigate('/worker'); // 작업자 대시보드
  }
};
```

---

## 스타일 규칙

### 관리자 (Admin)
- **배경**: `#f8fafc` (화이트)
- **글씨**: `#1e293b` (다크)
- **최대 너비**: `1400px`
- **레이아웃**: 테이블, 그리드
- **파일 위치**: `features/admin/**/*.jsx`

### 작업자 (Worker)
- **배경**: `#0f172a` (다크)
- **글씨**: `#ffffff` (화이트)
- **최대 너비**: `600px`
- **레이아웃**: 카드, 모바일 최적화
- **파일 위치**: `features/worker/**/*.jsx`

---

## 개발 시 체크리스트

### ✅ 새 기능 개발 전

1. **"이 기능은 관리자용인가, 작업자용인가?"**
2. 관리자용 → `features/admin/` 폴더에 작업
3. 작업자용 → `features/worker/` 폴더에 작업
4. 둘 다 쓰는 컴포넌트 → `features/shared/`

### ✅ 파일 생성 시

- 관리자용: `features/admin/{기능명}/{파일명}.jsx`
- 작업자용: `features/worker/{기능명}/{파일명}.jsx`

### ✅ API 호출 시

- 관리자: `/api/projects`, `/api/sites` (전체 데이터)
- 작업자: `/api/workers/me/...` (본인 데이터만)

---

## 주의사항

### ⚠️ 절대 하지 말 것

1. `admin/` 폴더에 다크 테마 적용 ❌
2. `worker/` 폴더에 1400px 레이아웃 ❌
3. 작업자가 `/api/projects` 직접 호출 ❌
4. 관리자 컴포넌트를 `worker/`에 복사 ❌

### ✅ 권장사항

1. 폴더만 보고도 역할을 알 수 있게
2. 스타일은 역할에 맞게 일관성 유지
3. 공통 컴포넌트는 `shared/`에만

---

## Layout 컴포넌트 (2개만)

### AdminLayout.jsx (관리자용)
- 화이트 배경
- 하단 네비게이션 (Desktop)
- 최대 너비 1400px

### WorkerLayout.jsx (작업자용)
- 다크 배경
- 하단 네비게이션 (Mobile)
- 최대 너비 600px

---

## 예시: 새 기능 추가

### 사례 1: "프로젝트 예산 관리" (관리자용)

```
1. features/admin/budget/ 폴더 생성
2. BudgetList.jsx 작성 (화이트 테마)
3. App.jsx에 라우트 추가: /admin/budget
4. API: /api/projects/:id/budget
```

### 사례 2: "오늘의 안전 브리핑" (작업자용)

```
1. features/worker/safety/ 폴더에 추가
2. SafetyBriefing.jsx 작성 (다크 테마)
3. App.jsx에 라우트 추가: /worker/safety
4. API: /api/workers/me/safety-briefing
```

---

## 요약

**이 구조의 장점**:
- ✅ 폴더만 봐도 역할 명확
- ✅ 실수 방지 (관리자/작업자 스타일 섞일 일 없음)
- ✅ 협업 시 충돌 감소
- ✅ 확장 용이 (새 기능 추가 시 폴더에만 넣으면 됨)

**핵심 규칙**:
1. `admin/` = 관리자, `worker/` = 작업자
2. 라우팅도 `/admin/*`, `/worker/*`
3. 스타일 일관성 (화이트 vs 다크)
4. 공통은 `shared/`

**이 규칙만 지키면 절대 헷갈리지 않습니다!** 🎯
