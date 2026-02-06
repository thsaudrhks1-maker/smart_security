# 공통 컴포넌트 구조 (Common Components)

## 📁 디렉토리 구조

```
common/
├── cards/                    # 카드 컴포넌트들
│   ├── TaskCard.jsx         # 작업 카드 (작업자 배정 포함)
│   └── DangerCard.jsx       # 위험 구역 카드
│
├── forms/                    # 폼 컴포넌트들
│   ├── TaskForm.jsx         # 작업 추가 폼
│   ├── DangerForm.jsx       # 위험 구역 추가 폼
│   └── WorkerAssignmentForm.jsx  # 작업자 배정 폼
│
├── ZoneDetailModal.jsx       # 구역 상세 모달 (통합)
├── DailyPlanLayout.jsx       # 반응형 레이아웃 (데스크톱/모바일)
├── CommonMap.jsx             # 공통 지도 컴포넌트
└── README.md                 # 이 파일
```

## 🎯 리팩토링 개요

### Before (DailyPlanManagement.jsx)
- **1,301줄**: 단일 파일에 모든 로직 포함
- 유지보수 어려움, 재사용 불가능
- 모바일 대응 어려움

### After
- **200줄**: 메인 컴포넌트만 포함
- **7개 재사용 가능 컴포넌트**로 분리
- 모바일/데스크톱 모두 대응 가능

## 📦 컴포넌트 설명

### 1. ZoneDetailModal
**위치**: `common/ZoneDetailModal.jsx`

**용도**: 구역 클릭 시 나타나는 상세 모달
- 작업 계획 관리
- 위험 구역 관리
- 작업자 배정

**Props**:
```jsx
<ZoneDetailModal 
  zone={selectedZone}
  date={selectedDate}
  projectId={project?.id}
  approvedWorkers={approvedWorkers}
  onClose={() => {}}
/>
```

### 2. TaskForm
**위치**: `common/forms/TaskForm.jsx`

**용도**: 작업 추가 폼

**Props**:
```jsx
<TaskForm 
  taskForm={taskForm}
  setTaskForm={setTaskForm}
  workTemplates={workTemplates}
  onSubmit={handleCreateTask}
  onCancel={() => setMode('view')}
/>
```

### 3. DangerForm
**위치**: `common/forms/DangerForm.jsx`

**용도**: 위험 구역 추가 폼
- 템플릿 선택 모드
- 커스텀 입력 모드

**Props**:
```jsx
<DangerForm 
  dangerForm={dangerForm}
  setDangerForm={setDangerForm}
  dangerTemplates={dangerTemplates}
  onSubmit={handleCreateDanger}
  onCancel={() => {}}
/>
```

### 4. WorkerAssignmentForm
**위치**: `common/forms/WorkerAssignmentForm.jsx`

**용도**: 작업자 배정 폼

**Props**:
```jsx
<WorkerAssignmentForm 
  task={selectedTask}
  approvedWorkers={approvedWorkers}
  onAssign={handleAssignWorker}
  onRemove={handleRemoveWorker}
  onComplete={() => {}}
/>
```

### 5. TaskCard
**위치**: `common/cards/TaskCard.jsx`

**용도**: 작업 카드 표시
- 작업 정보
- 위험도 표시
- 배정된 작업자 목록
- 작업자 추가/제거

**Props**:
```jsx
<TaskCard 
  task={task}
  approvedWorkers={approvedWorkers}
  onDelete={() => {}}
  onAssignWorker={(workerId) => {}}
  onRemoveWorker={(workerId) => {}}
/>
```

### 6. DangerCard
**위치**: `common/cards/DangerCard.jsx`

**용도**: 위험 구역 카드 표시

**Props**:
```jsx
<DangerCard 
  danger={danger}
  onDelete={() => {}}
/>
```

### 7. DailyPlanLayout
**위치**: `common/DailyPlanLayout.jsx`

**용도**: 반응형 레이아웃 (데스크톱/모바일)

**Props**:
```jsx
<DailyPlanLayout
  header={<Header />}
  sidePanel={<BuildingSectionView />}
  mapView={<MapView />}
  rightPanel={<RightPanel />}
  layoutConfig={{
    sidePanelWidth: '250px',
    mapViewRatio: '2fr',
    rightPanelRatio: '1.2fr',
    mobileBreakpoint: 768
  }}
/>
```

## 🔧 사용 예시

### 데스크톱 (Manager)
```jsx
import ZoneDetailModal from '@/components/common/ZoneDetailModal';

const DailyPlanManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  
  return (
    <>
      {isModalOpen && (
        <ZoneDetailModal 
          zone={selectedZone}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {/* ... 나머지 레이아웃 */}
    </>
  );
};
```

### 모바일 (Worker)
```jsx
import TaskCard from '@/components/common/cards/TaskCard';
import DangerCard from '@/components/common/cards/DangerCard';

const MobileWorkView = () => {
  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
      {dangers.map(danger => (
        <DangerCard key={danger.id} danger={danger} />
      ))}
    </div>
  );
};
```

## 🎨 스타일 가이드

모든 컴포넌트는 인라인 스타일을 사용하며, 다음 디자인 토큰을 따릅니다:

### 색상
- Primary Blue: `#3b82f6`
- Danger Red: `#ef4444`
- Success Green: `#16a34a`
- Gray Scale: `#f8fafc`, `#e2e8f0`, `#64748b`, `#0f172a`

### Border Radius
- Small: `8px`
- Medium: `12px`
- Large: `16px`
- XL: `24px`

### Font Weights
- Normal: `400`
- Semi-bold: `700`
- Bold: `800`
- Extra-bold: `900`

## 📱 모바일 대응

### 레이아웃 조절
```jsx
// 데스크톱: 3단 레이아웃
gridTemplateColumns: '250px 2fr 1.2fr'

// 모바일 (768px 이하): 1단 스택
gridTemplateColumns: '1fr'
gridTemplateRows: 'auto auto 1fr'
```

### 터치 최적화
- 버튼 최소 크기: `44px` (터치 영역)
- 폰트 최소 크기: `0.85rem`
- 패딩 증가: 모바일에서 `padding: 1rem`

## 🚀 확장 가능성

### 추가 가능한 컴포넌트
1. `WorkerCard.jsx` - 작업자 정보 카드
2. `ZoneCard.jsx` - 구역 정보 카드
3. `StatusBadge.jsx` - 상태 뱃지 컴포넌트
4. `DateRangePicker.jsx` - 날짜 범위 선택기

### 스타일 개선
1. CSS Module 도입 고려
2. Tailwind CSS 마이그레이션
3. 다크 모드 지원

## 📄 라이선스
Smart Security Project © 2026
