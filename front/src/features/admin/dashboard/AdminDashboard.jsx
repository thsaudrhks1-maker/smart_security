import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects } from '../../../api/projectApi';
import SafetyControlCenter from './SafetyControlCenter';
import { 
  Briefcase, Plus, MapPin, Users, AlertTriangle, 
  Database, FileText, TrendingUp, Settings 
} from 'lucide-react';
import './AdminDashboard.css';

/**
 * 관리자 메인 대시보드 (프로젝트 중심)
 * - 상단: 스마트 안전 관제 센터 (실시간 모니터링)
 * - 하단: 프로젝트 현황 요약 및 관리
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 프로젝트 상태별 개수
  const activeCount = projects.filter(p => p.status === 'ACTIVE').length;
  const plannedCount = projects.filter(p => p.status === 'PLANNED').length;
  const doneCount = projects.filter(p => p.status === 'DONE').length;

  // 최근 프로젝트 (최대 3개)
  const recentProjects = projects.slice(0, 3);

  const getStatusBadge = (status) => {
    const statusMap = {
      PLANNED: { label: '계획', color: '#ffc107' },
      ACTIVE: { label: '진행 중', color: '#4caf50' },
      DONE: { label: '완료', color: '#9e9e9e' },
    };
    const { label, color } = statusMap[status] || { label: status, color: '#666' };
    return (
      <span style={{ 
        padding: '0.35rem 0.75rem', 
        borderRadius: '20px', 
        fontSize: '0.85rem', 
        fontWeight: '600',
        background: color,
        color: 'white'
      }}>
        {label}
      </span>
    );
  };

  if (loading) {
    return <div className="admin-dashboard-white" style={{ padding: '2rem', textAlign: 'center' }}>데이터를 불러오는 중...</div>;
  }

  return (
    <div className="admin-dashboard-white" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 1. 스마트 안전 관제 센터 (상단 배치) */}
      <section style={{ marginBottom: '3rem' }}>
        <SafetyControlCenter />
      </section>

      {/* 구분선 */}
      <div style={{ height: '1px', background: '#e2e8f0', margin: '0 0 3rem 0' }}></div>

      {/* 2. 프로젝트 관리 영역 */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
          🏗️ 프로젝트 관리
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          진행 중인 모든 건설 현장의 프로젝트를 통합 관리합니다.
        </p>
      </div>

      {/* 프로젝트 현황 요약 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <SummaryCard 
          title="진행 중" 
          count={activeCount} 
          icon={TrendingUp} 
          color="#4caf50" 
          onClick={() => navigate('/projects?filter=active')}
        />
        <SummaryCard 
          title="계획 단계" 
          count={plannedCount} 
          icon={FileText} 
          color="#ffc107" 
          onClick={() => navigate('/projects?filter=planned')}
        />
        <SummaryCard 
          title="완료" 
          count={doneCount} 
          icon={Briefcase} 
          color="#9e9e9e" 
          onClick={() => navigate('/projects?filter=done')}
        />
        <SummaryCard 
          title="전체 프로젝트" 
          count={projects.length} 
          icon={Database} 
          color="#667eea" 
          onClick={() => navigate('/projects')}
        />
      </div>

      {/* 빠른 작업 */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
          🚀 빠른 작업
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <QuickActionButton 
            icon={Plus} 
            label="새 프로젝트 생성" 
            color="#667eea" 
            onClick={() => navigate('/projects/create')}
          />
          <QuickActionButton 
            icon={Briefcase} 
            label="프로젝트 목록" 
            color="#10b981" 
            onClick={() => navigate('/projects')}
          />
          <QuickActionButton 
            icon={AlertTriangle} 
            label="위험지역 설정" 
            color="#ef4444" 
            onClick={() => navigate('/map')}
          />
          <QuickActionButton 
            icon={Users} 
            label="작업자 관리" 
            color="#3b82f6" 
            onClick={() => navigate('/work')}
          />
        </div>
      </div>

      {/* 최근 활동 프로젝트 */}
      {recentProjects.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
            📌 최근 프로젝트 ({recentProjects.length}개)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentProjects.map(project => (
              <ProjectCard key={project.id} project={project} navigate={navigate} getStatusBadge={getStatusBadge} />
            ))}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {projects.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          background: 'white', 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '1rem' }}>
            등록된 프로젝트가 없습니다
          </h3>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            첫 프로젝트를 생성하여 시작하세요!
          </p>
          <button
            onClick={() => navigate('/projects/create')}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s'
            }}
          >
            + 첫 프로젝트 만들기
          </button>
        </div>
      )}
    </div>
  );
};

// 요약 카드 컴포넌트
const SummaryCard = ({ title, count, icon: Icon, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: '1.5rem',
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-3px)')}
    onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>{title}</span>
      <Icon size={20} color={color} />
    </div>
    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>{count}</div>
  </div>
);

// 빠른 작업 버튼
const QuickActionButton = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '1rem',
      background: 'white',
      border: `2px solid ${color}`,
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontWeight: '600',
      color: color,
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = color;
      e.currentTarget.style.color = 'white';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'white';
      e.currentTarget.style.color = color;
    }}
  >
    <Icon size={20} />
    {label}
  </button>
);

// 프로젝트 카드
const ProjectCard = ({ project, navigate, getStatusBadge }) => (
  <div style={{
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s',
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          {project.name}
        </h3>
        {getStatusBadge(project.status)}
      </div>
      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
        📍 {project.location_address || '위치 미정'} | 
        🏢 {project.constructor_company || '-'} | 
        📅 {project.start_date || '미정'} ~ {project.end_date || '미정'}
      </p>
    </div>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button
        onClick={() => navigate(`/projects/${project.id}`)}
        style={{
          padding: '0.6rem 1.2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        상세보기
      </button>
    </div>
  </div>
);

export default AdminDashboard;
