
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ManagerLayout from './features/manager/components/layout/ManagerLayout';
import WorkerLayout from './features/worker/components/layout/WorkerLayout';

// Auth
import Login from './features/auth/Login';
import Register from './features/auth/Register';

// Dashboards
import AdminDashboard from './features/admin/dashboard/AdminDashboard';
import ManagerDashboard from './features/manager/dashboard/ManagerDashboard';
import DailyPlanManagement from './features/manager/work/DailyPlanManagement';
import WorkerDashboard from './features/worker/dashboard/WorkerDashboard';

// Common
import AttendanceStatusPage from './components/common/AttendanceStatusPage';

// Manager Features
import WorkerManagement from './features/manager/workers/WorkerManagement';
import CompanyManagement from './features/manager/companies/CompanyManagement';
import ManagerContents from './features/manager/contents/ManagerContents';

// Admin Features
import ProjectList from './features/admin/projects/ProjectList';
import ProjectDetail from './features/admin/projects/ProjectDetail';
import CreateProject from './features/admin/projects/CreateProject';

const ProtectedRoute = ({ children, allowedRoles, layout: Layout = MainLayout }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#0f172a' }}>로딩 중...</div>;
  if (!user) return <Navigate to="/" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
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
                <Route path="attendance" element={<AttendanceStatusPage />} />
                {/* 나머지 페이지들도 여기에 추가 예정 */}
              </Routes>
            </ProtectedRoute>
          } />

          {/* Manager Routes: Smart Site 현장 관리자 레이아웃 */}
          <Route path="/manager/*" element={
            <ProtectedRoute allowedRoles={['manager']} layout={ManagerLayout}>
              <Routes>
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="work" element={<DailyPlanManagement />} />
                <Route path="contents" element={<ManagerContents />} />
                <Route path="locations" element={<ManagerDashboard />} />
                <Route path="companies" element={<CompanyManagement />} />
                <Route path="workers" element={<WorkerManagement />} />
                <Route path="attendance" element={<AttendanceStatusPage />} />

                <Route path="safety-info" element={<ManagerDashboard />} />
                <Route path="violations" element={<ManagerDashboard />} />
                <Route path="location" element={<ManagerDashboard />} />
                <Route path="education" element={<ManagerDashboard />} />
                <Route path="notices" element={<ManagerDashboard />} />
                <Route path="emergency" element={<ManagerDashboard />} />
                <Route path="" element={<Navigate to="/manager/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Worker Routes */}
          <Route path="/worker/*" element={
            <ProtectedRoute allowedRoles={['worker']} layout={WorkerLayout}>
              <Routes>
                <Route path="dashboard" element={<WorkerDashboard />} />
                <Route path="attendance" element={<AttendanceStatusPage />} />
                <Route path="" element={<Navigate to="/worker/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
