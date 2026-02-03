---
name: Frontend Standard
description: 리액트 컴포넌트 구조, 폴더 구조, 라우팅 및 디자인 패턴에 대한 프론트엔드 개발 표준.
---

# 프론트엔드 개발 표준 (Frontend Standard)

## 1. 역할 기반 폴더 구조 (Role-Based Architecture)

이 프로젝트는 사용자 역할(Role)에 따라 UI와 기능을 완전히 분리합니다.

- **원칙**: `src/features/<역할>` 형태로 최상위 폴더를 나눕니다.
- **공유 컴포넌트**: 여러 역할에서 쓰이는 것은 `src/components/shared` 또는 `common`에 둡니다.

### 디렉토리 구조 (Directory Structure)
```
front/src/features/
├── admin/              ← 최고 관리자 (System Admin, 데스크탑)
│   ├── dashboard/      AdminDashboard.jsx (전체 통합 관제)
│   ├── projects/       ProjectList.jsx, CreateProject.jsx
│   ├── companies/      CompanyList.jsx (업체 마스터 관리)
│   └── system/         SystemConfig.jsx
│
├── manager/            ← 중간 관리자 (Site Manager, 현장 소장/안전관리자, 데스크탑)
│   ├── dashboard/      ManagerDashboard.jsx (담당 현장 현황)
│   ├── my_project/     ProjectOverview.jsx (내 현장 관리)
│   ├── approvals/      WorkerApproval.jsx (작업자/업체 투입 승인)
│   └── safety/         SafetyCheck.jsx (TBM, 위험성 평가)
│
├── worker/             ← 작업자 (Worker, 모바일)
│   ├── dashboard/      WorkerDashboard.jsx
│   ├── work/           WorkList.jsx (작업 목록)
│   ├── safety/         SafetyMap.jsx (위험 지도)
│   └── report/         ReportDanger.jsx
│
└── shared/             ← 공통 컴포넌트 (역할 무관)
    ├── LocationPicker.jsx
    └── Button.jsx
```

## 2. 라우팅 규칙 (Routing)

역할별로 URL Prefix를 사용하여 접근 권한을 명확히 구분합니다.

```javascript
// App.jsx 구조 예시
<Routes>
  <Route path="/" element={<Login />} />
  
  {/* 관리자 (데스크탑) */}
  <Route path="/admin/*" element={<AdminLayout />}> ... </Route>
  
  {/* 현장 관리자 (데스크탑/태블릿) */}
  <Route path="/manager/*" element={<ManagerLayout />}> ... </Route>
  
  {/* 작업자 (모바일) */}
  <Route path="/worker/*" element={<WorkerLayout />}> ... </Route>
</Routes>
```

## 3. 컴포넌트 작성 규칙
- **함수형 컴포넌트**: `const Component = () => {}` 사용.
- **스타일**: CSS Modules 또는 SCSS 권장.
- **API 호출**: 컴포넌트 내 `axios` 직접 사용 금지. `src/api/*.js`에 정의된 함수만 임포트.

## 4. 디자인 가이드
- **관리자/매니저**: 넓은 화면(데스크탑) 기준. Dense한 정보 표시.
- **작업자**: 좁은 화면(모바일) 기준. 큰 버튼, 터치 친화적 UI, 다크 모드 고려.
