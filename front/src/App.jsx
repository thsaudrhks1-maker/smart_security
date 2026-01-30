import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './features/dashboard/DashboardLayout';
import PagePlaceholder from './components/common/PagePlaceholder';
import Login from './features/auth/Login';
import Register from './features/auth/Register';

import WorkList from './features/work/WorkList';
import SafetyMap from './features/safety/SafetyMap';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* 구현된 기능 페이지 연결 */}
          <Route path="/work" element={<WorkList />} />
          <Route path="/map" element={<SafetyMap />} />
          
          {/* 아직 미구현된 페이지는 Placeholder 유지 */}
          <Route path="/safety-info" element={<PagePlaceholder title="일일 안전 정보" />} />
          <Route path="/workers" element={<PagePlaceholder title="출역 현황" />} />
          <Route path="/notice" element={<PagePlaceholder title="공지사항" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
