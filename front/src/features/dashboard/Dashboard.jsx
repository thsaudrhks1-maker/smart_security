import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  AlertTriangle, 
  Info, 
  Users, 
  MapPin, 
  Bell, 
  Megaphone,
  ShieldAlert
} from 'lucide-react';
import './Dashboard.css'; // 스타일 분리

const Dashboard = () => {
  const navigate = useNavigate();

  // 메뉴 아이템 데이터 (레거시 앱 참조 + 리뉴얼)
  const menuItems = [
    { id: 'work', title: '금일 나의 작업', subtitle: '가설공사 외 1건', icon: ClipboardList, color: 'var(--accent-primary)', path: '/work' },
    { id: 'emergency', title: '긴급 알림', subtitle: '현장 사고 발생 시 터치', icon: AlertTriangle, color: 'var(--accent-secondary)', path: '/emergency', isUrgent: true },
    { id: 'safety-info', title: '일일 안전정보', subtitle: '필독 안전사항', icon: Info, color: '#3b82f6', path: '/safety-info' },
    { id: 'workers', title: '금일 출역현황', subtitle: '나의 팀 8명 출근', icon: Users, color: '#10b981', path: '/workers' },
    { id: 'danger-map', title: '나의 위험지역', subtitle: '접근 주의 구역 확인', icon: MapPin, color: '#f97316', path: '/map' },
    { id: 'notice', title: '공지사항', subtitle: '우천 시 작업 변경 안내', icon: Megaphone, color: '#a855f7', path: '/notice' },
  ];

  return (
    <div className="dashboard-container container">
      {/* 상단 헤더: 현장 정보 */}
      <header className="dashboard-header glass-panel">
        <div className="site-info">
          <h1>서울빌딩 신축공사</h1>
          <div className="weather-badge">
            <span>22°C 맑음</span>
          </div>
        </div>
        <div className="user-greeting">
          <p>안녕하세요, <span className="text-accent">김안전</span>님</p>
          <p className="text-sm">무재해 <span className="text-success">80일</span> 달성 중</p>
        </div>
      </header>

      {/* 메인 메뉴 그리드 (Bento Grid 스타일) */}
      <main className="dashboard-grid">
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            className={`menu-card glass-panel ${item.isUrgent ? 'urgent-card' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div className="card-icon" style={{ backgroundColor: item.isUrgent ? 'white' : 'rgba(255,255,255,0.1)' }}>
              <item.icon size={24} color={item.isUrgent ? 'red' : item.color} />
            </div>
            <div className="card-content">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
            {item.isUrgent && <div className="pulse-ring"></div>}
          </div>
        ))}
      </main>

      {/* 하단 상태 바 */}
      <footer className="dashboard-footer glass-panel">
        <div className="status-item">
          <ShieldAlert size={20} className="text-danger" />
          <span>안전위반 <strong>2건</strong></span>
        </div>
        <div className="divider"></div>
        <div className="status-item">
          <Bell size={20} />
          <span>읽지 않은 알림 <strong>5개</strong></span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
