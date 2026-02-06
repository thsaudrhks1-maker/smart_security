---
name: Frontend Standard
description: 리액트 컴포넌트 구조, 폴더 구조, 라우팅 및 디자인 패턴에 대한 프론트엔드 개발 표준.
---

# 프론트엔드 개발 표준 (Frontend Standard)

## 1. 컴포넌트 관리 체계 (Flat First Architecture)

복잡한 폴더 깊이를 피하고 가독성을 높이기 위해 '납작한(Flat)' 구조를 지향합니다.

1.  **Global Shared (@/components/common/)**: 전역에서 2회 이상 자주 쓰이는 진짜 공통 컴포넌트만 모읍니다. (예: `SimpleModal.jsx`, `Button.jsx`)
2.  **Feature Flat (@/features/<role>/<feature>/)**: 특정 기능에 속한 컴포넌트들은 별도 `components` 폴더를 파지 않고 해당 기능 폴더에 파일로 직접 둡니다.
    *   메인 페이지 파일: `WorkerDashboard.jsx`
    *   부속 컴포넌트: `DashboardCards.jsx`, `DashboardModals.jsx` 등 (같은 폴더 내 위치)

### 🛠️ 관리 규칙
*   **시작은 Flat하게**: 폴더를 깊게 파지 말고 해당 기능 폴더에 바로 파일을 만듭니다.
*   **쪼개기(Splitting)**: 페이지 파일이 너무 커지면(예: 300라인 이상) 같은 폴더 내에서 파일로 분리합니다.
*   **승격(Promotion)**: 다른 기능에서도 해당 컴포넌트가 필요해지면 그때 `@/components/common/`으로 옮깁니다.

## 2. 라우팅 규칙 및 페이지 구조

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

## 3. 컴포넌트 및 모듈 임포트 규칙 (Import Rules)

- **절대 경로 별칭(\`@\`) 사용 필수**: 복잡한 상대 경로(\`../../..\`) 대신 \`src\` 폴더를 가리키는 \`@\` 별칭을 사용합니다.
  - ✅ 좋아함: \`import { workApi } from '@/api/workApi';\`
  - ❌ 지양함: \`import { workApi } from '../../../api/workApi';\`
- **함수형 컴포넌트**: \`const Component = () => {}\` 사용.
- **API 호출**: 컴포넌트 내 \`axios\` 직접 사용 금지. \`@/api/*.js\`에 정의된 함수만 임포트.

## 4. 디자인 가이드 (Premium Design Rules)

1.  **시인성 최우선 (Contrast Rule)**: 모든 텍스트는 밝은 배경(#FFFFFF/F8FAFC) 위에서 아주 선명하게 보여야 합니다.
    -   메인 텍스트: `#0f172a` (진한 네이비) 또는 `#1e293b` (다크 그레이)
    -   서브 텍스트: `#475569`
    -   **절대 엄금**: 흰색 배경에서 흐릿한 회색이나 파스텔톤 글씨 사용 금지.
2.  **슬림 & 투명 스크롤바 (Scrollbar Rule)**: 긴 페이지나 사이드바에는 브라우저 기본 스크롤바 대신 투명하고 얇은 현대적인 스크롤바를 사용합니다.
    -   너비: 6px 이하
    -   배경: 투명(Transparent)
    -   바(Thumb): 반투명한 슬레이트 계열 (`rgba(148, 163, 184, 0.3)`)
3.  **반응형 레이아웃**:
    -   **관리자/매니저**: 넓은 화면(데스크탑) 기준. Dense한 정보 표시.
    -   **작업자**: 좁은 화면(모바일) 기준. 큰 버튼, 터치 친화적 UI.

## 5. 데이터 연동 및 테스트 표준 (Data & Test Standard)

1.  **현실적 더미 데이터 (Realistic Seeding)**:
    -   `atomic_reset.py`는 항상 **발주처 - 시공사 - 협력사**의 3계층 구조를 유지해야 합니다.
    -   사용자는 반드시 특정 업체(`sys_companies`)에 소속되어야 하며, 역할(`admin`, `manager`, `worker`)에 맞는 업체와 매칭되어야 합니다.
2.  **엔티티 선택 및 직접 입력 (Select & Entry Pattern)**:
    -   등록 폼 상에서 엔티티(업체 등)를 선택할 때는 DB 목록을 먼저 보여주되, 없을 경우를 대비해 **'+ 직접 등록'** 토글을 반드시 제공합니다.
    -   상위 엔티티(시공사)가 선택되면, 하위 엔티티(소속 인원) 목록이 **동적으로 필터링**되어야 합니다.

