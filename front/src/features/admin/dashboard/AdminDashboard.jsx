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
  // UI State
  const [showMapSection, setShowMapSection] = useState(false);

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
      
      {/* 1. 빠른 작업 (최상단) */}
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
            onClick={() => navigate('/admin/projects/create')}
          />
          <QuickActionButton 
            icon={Briefcase} 
            label="프로젝트 목록" 
            color="#10b981" 
            onClick={() => navigate('/admin/projects')}
          />
          <QuickActionButton 
            icon={MapPin} 
            label={showMapSection ? "안전 지도 숨기기" : "안전 지도 보기"}
            color="#ef4444" 
            onClick={() => setShowMapSection(!showMapSection)}
          />
          <QuickActionButton 
            icon={Users} 
            label="작업자 관리" 
            color="#3b82f6" 
            onClick={() => navigate('/admin/workers')} // 라우트 없으면 /admin/projects 로 대체 가능
          />
        </div>
      </div>

      {/* 2. 최근 프로젝트 (상단) */}
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

      {/* 3. 스마트 안전 관제 센터 (토글 섹션) */}
      {showMapSection && (
        <section style={{ marginBottom: '3rem', animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight:'800', color: '#1e293b' }}>🗺️ 전체 현장 관제</h2>
             <button onClick={() => setShowMapSection(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>접기</button>
          </div>
          <SafetyControlCenter />
        </section>
      )}

      {/* 구분선 */}
      <div style={{ height: '1px', background: '#e2e8f0', margin: '0 0 3rem 0' }}></div>

      {/* 4. 프로젝트 통계 */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
          📊 통합 현황
        </h1>
      </div>

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
          onClick={() => navigate('/admin/projects?filter=active')}
        />
        <SummaryCard 
          title="계획 단계" 
          count={plannedCount} 
          icon={FileText} 
          color="#ffc107" 
          onClick={() => navigate('/admin/projects?filter=planned')}
        />
        <SummaryCard 
          title="완료" 
          count={doneCount} 
          icon={Briefcase} 
          color="#9e9e9e" 
          onClick={() => navigate('/admin/projects?filter=done')}
        />
        <SummaryCard 
          title="전체 프로젝트" 
          count={projects.length} 
          icon={Database} 
          color="#667eea" 
          onClick={() => navigate('/admin/projects')}
        />
      </div>

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
            onClick={() => navigate('/admin/projects/create')}
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
      border: '1px solid #f1f5f9',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-5px)')}
    onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
  >
    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}>
      <Icon size={80} color={color} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
      <div style={{ padding: '8px', borderRadius: '8px', background: `${color}15` }}>
        <Icon size={20} color={color} />
      </div>
      <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>{title}</span>
    </div>
    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', paddingLeft: '4px' }}>
      {count}
    </div>
  </div>
);

// 빠른 작업 버튼 (세련된 아웃라인 스타일)
const QuickActionButton = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '1.25rem',
      background: 'white',
      border: `1px solid ${color}`,
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      fontWeight: '600',
      color: color,
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      fontSize: '0.95rem'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = `${color}08`; // 아주 연한 배경색
      e.currentTarget.style.boxShadow = `0 4px 12px ${color}20`;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'white';
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <Icon size={22} strokeWidth={2} />
    {label}
  </button>
);

// 프로젝트 카드 (깔끔한 리스트 스타일)
const ProjectCard = ({ project, navigate, getStatusBadge }) => (
  <div style={{
    background: 'white',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    border: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s',
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          {project.name}
        </h3>
        {getStatusBadge(project.status)}
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          📍 {project.location_address || '위치 미정'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          🏢 {project.constructor_company || '-'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          📅 {project.start_date || '미정'} ~ {project.end_date || '미정'}
        </span>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button
        onClick={() => navigate(`/admin/projects/${project.id}`)}
        style={{
          padding: '0.6rem 1.4rem',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: '0.9rem',
          boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#4338ca'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#4f46e5'}
      >
        상세보기
      </button>
    </div>
  </div>
);

export default AdminDashboard;
