import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './features/dashboard/DashboardLayout';
import AdminDashboard from './features/dashboard/AdminDashboard';
import PagePlaceholder from './components/common/PagePlaceholder';
import Login from './features/auth/Login';
import Register from './features/auth/Register';

import WorkList from './features/work/WorkList';
import SafetyMap from './features/safety/SafetyMap';
import ProjectList from './features/project/ProjectList';
import CreateProject from './features/project/CreateProject';
import ProjectDetail from './features/project/ProjectDetail';

import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 모든 메인 페이지는 하단 네비게이션 포함 */}
          <Route element={<MainLayout />}>
             <Route path="/dashboard" element={<AdminDashboard />} />
             <Route path="/projects" element={<ProjectList />} />
             <Route path="/projects/create" element={<CreateProject />} />
             <Route path="/projects/:id" element={<ProjectDetail />} />
             <Route path="/work" element={<WorkList />} />
             <Route path="/map" element={<SafetyMap />} />
             
             <Route path="/safety-info" element={<PagePlaceholder title="일일 안전 정보" />} />
             <Route path="/workers" element={<PagePlaceholder title="출역 현황" />} />
             <Route path="/notice" element={<PagePlaceholder title="공지사항" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
