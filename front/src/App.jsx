import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './features/dashboard/DashboardLayout';
import PagePlaceholder from './components/common/PagePlaceholder';
import { Shield } from 'lucide-react';

// 임시 로그인 컴포넌트 (나중에 features/auth/Login.jsx로 분리)
const Login = () => {
  return (
    <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '90%', textAlign: 'center' }}>
        <Shield size={64} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
        <h1>Smart Security</h1>
        <p style={{ margin: '1rem 0' }}>건설 현장 안전 관리 플랫폼</p>
        <a href="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>로그인 (Prototype)</a>
      </div>
    </div>
  );
};

import WorkList from './features/work/WorkList';
import Emergency from './features/dashboard/Emergency';
import SafetyMap from './features/safety/SafetyMap';

// ... (Login 컴포넌트는 유지)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 구현된 기능 페이지 연결 */}
        <Route path="/work" element={<WorkList />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/map" element={<SafetyMap />} />
        
        {/* 아직 미구현된 페이지는 Placeholder 유지 */}
        <Route path="/safety-info" element={<PagePlaceholder title="일일 안전 정보" />} />
        <Route path="/workers" element={<PagePlaceholder title="출역 현황" />} />
        <Route path="/notice" element={<PagePlaceholder title="공지사항" />} />
      </Routes>
    </Router>
  );
}

export default App;
