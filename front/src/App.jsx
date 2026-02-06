
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

// Auth
import Login from './features/auth/Login';
import Register from './features/auth/Register';

// Dashboards
import AdminDashboard from './features/admin/dashboard/AdminDashboard';
import ManagerDashboard from './features/manager/dashboard/ManagerDashboard';
import WorkerDashboard from './features/worker/dashboard/WorkerDashboard';

// Projects
import ProjectList from './features/admin/projects/ProjectList';
import ProjectDetail from './features/admin/projects/ProjectDetail';
import CreateProject from './features/admin/projects/CreateProject';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>로딩 중...</div>;
  if (!user) return <Navigate to="/" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 레이아웃 적용
  return <MainLayout>{children}</MainLayout>;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/worker/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="projects" element={<ProjectList />} />
                <Route path="projects/create" element={<CreateProject />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                {/* 나머지 페이지들도 여기에 추가 예정 */}
              </Routes>
            </ProtectedRoute>
          } />

          {/* Manager/Worker Routes도 비슷한 방식으로 확장 가능 */}
          <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/worker/dashboard" element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
