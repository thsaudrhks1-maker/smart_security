---
name: Role-Based UI Platform
description: 역할 기반 UI 플랫폼 구조 - 관리자(데스크탑) vs 작업자(모바일) 분기 규칙
---

# Role-Based UI Platform Skill

## 핵심 개념

**하나의 프로젝트를 중심으로, 사용자 역할(role)에 따라 완전히 다른 UI를 제공합니다.**

- **관리자/소장**: 데스크탑 환경 (프로젝트 관리, 설정, 전체 현황)
- **작업자**: 모바일 환경 (오늘의 작업, 위험 경고, 간단한 신고)

## 사용자 역할 (User Roles)

```
┌─────────────────────────────────────────────────┐
│ UserModel (back/auth/model.py)                  │
├─────────────────────────────────────────────────┤
│ role: String                                    │
│   - "admin"           → 관리자 (데스크탑)       │
│   - "manager"         → 소장 (데스크탑)         │
│   - "safety_manager"  → 안전관리자 (데스크탑)   │
│   - "worker"          → 작업자 (모바일)         │
└─────────────────────────────────────────────────┘
```

## UI 분기 구조

### 1. 로그인 후 대시보드 라우팅

**파일**: `front/src/features/dashboard/DashboardLayout.jsx` (371-377번 라인)

```javascript
const DashboardLayout = () => {
  const { user } = useAuth();

  // 역할별 대시보드 분기
  if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'safety_manager') {
    return <AdminDashboard />; // 데스크탑 UI
  }

  if (user?.role === 'worker') {
    return <WorkerDashboard />; // 모바일 UI
  }

  // 기본 fallback
  return <AdminDashboard />;
};
```

### 2. AdminDashboard (관리자용 - 데스크탑)

**파일**: `front/src/features/dashboard/AdminDashboard.jsx`

**특징**:
- **화이트 테마** (`background: #f8fafc`)
- **넓은 레이아웃** (1400px 최대 너비)
- **프로젝트 중심 관리**
  - 프로젝트 목록/생성/수정/삭제
  - 현장(Site), 협력사(Company), 작업자(Worker) 관리
  - 위험지역 설정
  - 통계 및 리포트

**UI 구성**:
```
┌───────────────────────────────────────────┐
│  🏗️ 프로젝트 관리 대시보드                 │
├───────────────────────────────────────────┤
│  [진행 중: 3] [계획: 2] [완료: 1] [전체: 6]│
├───────────────────────────────────────────┤
│  🚀 빠른 작업                              │
│  [+ 새 프로젝트] [📁 목록] [⚠️ 위험지역]   │
├───────────────────────────────────────────┤
│  📌 최근 프로젝트                          │
│  ┌─────────────────────────────────┐     │
│  │ 강남 스마트 아파트               │     │
│  │ [진행 중] [상세보기]             │     │
│  └─────────────────────────────────┘     │
└───────────────────────────────────────────┘
```

### 3. WorkerDashboard (작업자용 - 모바일)

**파일**: `front/src/features/dashboard/WorkerDashboard.jsx`

**특징**:
- **다크 테마** (기존 유지)
- **카드 기반 레이아웃** (모바일 최적화)
- **작업자 개인 중심**
  - 오늘의 내 작업
  - 실시간 위험 경고
  - 위험 신고 (원터치)
  - 안전 브리핑

**UI 구성**:
```
┌─────────────────────────────┐
│  👷 김철수님                 │
│  오늘도 안전한 하루 되세요!  │
├─────────────────────────────┤
│  ┌──────────┬──────────┐   │
│  │ 오늘의   │  2.7°C   │   │
│  │ 작업     │  흐림    │   │
│  └──────────┴──────────┘   │
│  ┌──────────┐ ┌─────────┐  │
│  │ 🔺 간급   │ │ 📋 안전 │  │
│  │ 알림     │ │ 정보    │  │
│  └──────────┘ └─────────┘  │
│  ┌─────────────────────┐   │
│  │ 🚨 공지사항         │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

## 프로젝트 선택 로직 (작업자)

작업자는 **자동으로 본인이 소속된 프로젝트만 접근** 가능:

```javascript
// back/work/router.py (예시)
@router.get("/workers/me/today")
async def get_my_today_work(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # 1. 현재 로그인한 작업자 찾기
    worker = await db.execute(
        select(Worker).where(Worker.user_id == current_user.id)
    )
    worker = worker.scalars().first()
    
    # 2. 작업자의 project_id로 필터링
    work_plan = await db.execute(
        select(DailyWorkPlan)
        .join(WorkerAllocation)
        .where(WorkerAllocation.worker_id == worker.id)
        .where(DailyWorkPlan.date == today)
    )
    
    return work_plan
```

## 개발 규칙 (헷갈리지 않기 위한 체크리스트)

### ✅ 관리자 기능 개발 시

1. **파일 위치**: `front/src/features/{기능명}/`
   - 예: `front/src/features/project/ProjectList.jsx`
2. **스타일**: 화이트 테마 (`background: #f8fafc`, `color: #1e293b`)
3. **레이아웃**: 넓은 화면 (최대 1400px)
4. **네비게이션**: 하단 네비게이션 바 (`MainLayout` 사용)
5. **API 호출**: 프로젝트 필터링 없이 전체 데이터 조회 가능
6. **권한**: 프로젝트 생성/수정/삭제 가능

### ✅ 작업자 기능 개발 시

1. **파일 위치**: `front/src/features/dashboard/WorkerDashboard.jsx` 또는 하위 컴포넌트
2. **스타일**: 다크 테마 (`background: #0f172a`, `color: white`)
3. **레이아웃**: 모바일 카드 (최대 600px)
4. **네비게이션**: 하단 네비게이션 바 (모바일 아이콘)
5. **API 호출**: **반드시 본인 데이터만** (`/workers/me/...`)
6. **권한**: 읽기만 가능, 작업 시작/종료, 위험 신고만 가능

## 컴포넌트 명명 규칙

```
AdminDashboard.jsx          → 관리자 메인 대시보드
ProjectList.jsx             → 관리자용 프로젝트 목록
ProjectDetail.jsx           → 관리자용 프로젝트 상세
CreateProject.jsx           → 관리자용 프로젝트 생성

WorkerDashboard.jsx         → 작업자 메인 대시보드
WorkerTodayWork.jsx         → 작업자 오늘의 작업 (WorkerDashboard 하위)
WorkerReport.jsx            → 작업자 위험 신고 (WorkerDashboard 하위)
```

## 프로젝트 선택 흐름 (미래 개선)

현재는 작업자가 하나의 프로젝트에만 소속되어 있다고 가정.

**향후 개선 시**:
1. 로그인 후 작업자가 여러 프로젝트에 투입되어 있으면
2. **프로젝트 선택 화면** 표시
3. 선택한 프로젝트를 `localStorage` 또는 `Context`에 저장
4. 이후 모든 API 호출 시 `project_id` 파라미터 전달

```javascript
// 예시: Context로 선택된 프로젝트 관리
const { selectedProject, setSelectedProject } = useProject();

// API 호출 시
const todayWork = await api.get(`/workers/me/today?project_id=${selectedProject.id}`);
```

## 주의사항

### ⚠️ 절대 하지 말아야 할 것

1. **관리자 UI에 모바일 스타일 섞기**
   - AdminDashboard에 다크 테마 적용 ❌
   - 카드 레이아웃을 1400px로 늘리기 ❌

2. **작업자 UI에 관리자 기능 노출**
   - WorkerDashboard에 "프로젝트 생성" 버튼 ❌
   - 다른 작업자 정보 조회 ❌

3. **역할 체크 없이 API 호출**
   - 작업자가 `/api/projects` 직접 호출 ❌
   - 관리자가 `/workers/me/today` 호출 (의미 없음) ❌

### ✅ 권장사항

1. **개발 전 역할 먼저 확인**
   - "이 기능은 관리자용인가, 작업자용인가?"
   - 명확히 구분된 폴더에 작업

2. **API 엔드포인트 명명**
   - 관리자용: `/api/projects`, `/api/sites`, `/api/companies`
   - 작업자용: `/api/workers/me/...` (반드시 `me` 포함)

3. **스타일 일관성**
   - 관리자 = 화이트, 넓음, 테이블/그리드
   - 작업자 = 다크, 좁음, 카드

## 현재 구현 상태

### ✅ 완료
- [x] 역할 기반 대시보드 분기 (DashboardLayout.jsx)
- [x] AdminDashboard (프로젝트 중심 관리 허브)
- [x] WorkerDashboard (작업자 모바일 UI)
- [x] 프로젝트 CRUD API
- [x] 프로젝트 관리 UI (목록/생성/상세)

### 🚧 진행 중
- [ ] 프로젝트 선택 시 하위 데이터 자동 필터링
- [ ] 작업자 "오늘의 작업" API 연동
- [ ] 위험지역 설정 UI (안전관리자)

### 📝 예정
- [ ] 작업자 위험 신고 기능
- [ ] 안전 브리핑 (30초 교육)
- [ ] 프로젝트별 권한 관리

## 요약

**이 Skill의 핵심 원칙**:
1. **하나의 프로젝트 = 데이터 컨테이너**
2. **역할(role)에 따라 완전히 다른 UI**
3. **관리자 = 데스크탑 (화이트, 넓음, 전체 관리)**
4. **작업자 = 모바일 (다크, 좁음, 개인 정보)**
5. **API는 항상 역할에 맞게 필터링**

이 규칙을 따르면 헷갈리지 않고 일관성 있게 개발할 수 있습니다! 🎯
