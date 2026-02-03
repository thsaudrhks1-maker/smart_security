import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleRedirect from './components/common/RoleRedirect';
import ProtectedRoute from './components/common/ProtectedRoute';
import PagePlaceholder from './components/common/PagePlaceholder';
import Login from './features/auth/Login';
import Register from './features/auth/Register';

// 관리자 전용 (데스크탑)
import AdminLayout from './features/admin/components/layout/AdminLayout';
import AdminDashboard from './features/admin/dashboard/AdminDashboard';
import ProjectList from './features/admin/projects/ProjectList';
import CreateProject from './features/admin/projects/CreateProject';
import ProjectDetail from './features/admin/projects/ProjectDetail';
import CompanyList from './features/admin/companies/CompanyList';

// 중간 관리자 (현장 소장)
import ManagerLayout from './features/manager/components/layout/ManagerLayout';
import ManagerDashboard from './features/manager/dashboard/ManagerDashboard';
import PartnerManagement from './features/manager/partners/PartnerManagement';

// 작업자 전용 (모바일)
import WorkerLayout from './features/worker/components/layout/WorkerLayout';
import WorkerDashboard from './features/worker/dashboard/WorkerDashboard';
import WorkList from './features/worker/work/WorkList';
import SafetyMap from './features/worker/safety/SafetyMap';
import Emergency from './features/worker/components/Emergency';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 로그인 */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 대시보드 (역할 자동 분기) */}
          <Route path="/dashboard" element={<RoleRedirect />} />
          
          {/* 1. 관리자 전용 (데스크탑) - ADMIN only */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/create" element={<CreateProject />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="companies" element={<CompanyList />} />
          </Route>
          
          {/* 2. 중간 관리자 (현장 소장) - MANAGER & ADMIN */}
          <Route 
            path="/manager/*" 
            element={
              <ProtectedRoute allowedRoles={['manager', 'safety_manager', 'admin']}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerDashboard />} />
            <Route path="partners" element={<PartnerManagement />} />
          </Route>

          {/* 3. 작업자 전용 (모바일) - WORKER only */}
          <Route 
            path="/worker/*" 
            element={
              <ProtectedRoute allowedRoles={['worker', 'admin']}>
                <WorkerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<WorkerDashboard />} />
            <Route path="work" element={<WorkList />} />
            <Route path="safety" element={<SafetyMap />} />
            <Route path="emergency" element={<Emergency />} />
            <Route path="report" element={<PagePlaceholder title="위험 신고" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
