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
          
          {/* Dashboard는 독립적인 레이아웃 사용 (관리자 전용) */}
          <Route path="/dashboard" element={<AdminDashboard />} />
          
          {/* 프로젝트 관리 페이지는 MainLayout 사용 */}
          <Route element={<MainLayout />}>
             {/* <Route path="/dashboard" element={<Dashboard />} /> */}
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
