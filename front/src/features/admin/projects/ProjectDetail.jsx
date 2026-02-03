import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, getProjectWorkers } from '../../../api/projectApi';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './ProjectDetail.css';

// Leaflet 아이콘 이슈 해결
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [workers, setWorkers] = useState([]); // 작업자 목록 상태 추가
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const [projectData, workersData] = await Promise.all([
        getProjectById(id),
        getProjectWorkers(id)
      ]);
      setProject(projectData);
      setWorkers(workersData);
    } catch (error) {
      console.error('프로젝트 데이터 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!project?.start_date || !project?.end_date) return 0;
    
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const now = new Date();
    
    const total = end - start;
    const elapsed = now - start;
    
    const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    return Math.round(progress);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PLANNED: { label: '계획', className: 'status-planned' },
      ACTIVE: { label: '진행 중', className: 'status-active' },
      DONE: { label: '완료', className: 'status-done' },
    };
    const { label, className } = statusMap[status] || { label: status, className: '' };
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  if (loading) {
    return <div className="loading">프로젝트 정보를 불러오는 중...</div>;
  }

  if (!project) {
    return null;
  }

  const progress = calculateProgress();

  return (
    <div className="project-detail-container">
      {/* 헤더 */}
      <div className="project-header-section">
        <button className="btn-back" onClick={() => navigate('/projects')}>
          ← 목록으로
        </button>
        
        <div className="project-title-section">
          <div className="title-row">
            <h1>{project.name}</h1>
            {getStatusBadge(project.status)}
          </div>
          <div className="project-meta">
            <span>📍 {project.location_address || '위치 미정'}</span>
            <span>🏢 {project.constructor_company || '-'}</span>
            {project.participants?.filter(p => p.role === 'PARTNER').length > 0 && (
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                🤝 {Array.from(new Set(project.participants.filter(p => p.role === 'PARTNER').map(p => p.company_name))).join(', ')}
              </span>
            )}
            <span>📅 {project.start_date || '미정'} ~ {project.end_date || '미정'}</span>
          </div>
        </div>

        <button className="btn-edit" onClick={() => navigate(`/projects/${id}/edit`)}>
          ✏️ 수정
        </button>
      </div>

      {/* 진행률 바 */}
      {project.start_date && project.end_date && (
        <div className="progress-section">
          <div className="progress-header">
            <span>프로젝트 진행률</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* KPI 카드 */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">👷</div>
          <div className="kpi-content">
            <div className="kpi-value">12</div>
            <div className="kpi-label">총 작업자</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🏢</div>
          <div className="kpi-content">
            <div className="kpi-value">2</div>
            <div className="kpi-label">현장 수</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">📋</div>
          <div className="kpi-content">
            <div className="kpi-value">5</div>
            <div className="kpi-label">진행 중 작업</div>
          </div>
        </div>

        <div className="kpi-card alert">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-content">
            <div className="kpi-value">3</div>
            <div className="kpi-label">위험 구역</div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="tab-section">
        <div className="tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            📊 개요
          </button>
          <button
            className={activeTab === 'sites' ? 'active' : ''}
            onClick={() => setActiveTab('sites')}
          >
            🏗️ 현장 관리
          </button>
          <button
            className={activeTab === 'companies' ? 'active' : ''}
            onClick={() => setActiveTab('companies')}
          >
            🏢 협력사
          </button>
          <button
            className={activeTab === 'workers' ? 'active' : ''}
            onClick={() => setActiveTab('workers')}
          >
            👷 작업자
          </button>
          <button
            className={activeTab === 'danger' ? 'active' : ''}
            onClick={() => setActiveTab('danger')}
          >
            ⚠️ 위험지역
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="info-grid">
                <div className="info-card">
                  <h3>프로젝트 정보</h3>
                  <div className="info-row">
                    <span className="label">공사명</span>
                    <span className="value">{project.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">공사 유형</span>
                    <span className="value">{project.project_type || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">공사 금액</span>
                    <span className="value">{formatCurrency(project.budget_amount)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">착공일</span>
                    <span className="value">{project.start_date || '미정'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">준공 예정일</span>
                    <span className="value">{project.end_date || '미정'}</span>
                  </div>
                </div>

                <div className="info-card">
                  <h3>관계사 정보</h3>
                  <div className="info-row">
                    <span className="label">발주처</span>
                    <span className="value">{project.client_company || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">시공사</span>
                    <span className="value">{project.constructor_company || '-'}</span>
                  </div>
                  {project.participants?.filter(p => p.role === 'PARTNER').length > 0 && (
                    <div className="info-row" style={{ marginTop: '0.5rem' }}>
                      <span className="label">주요 협력사</span>
                      <div className="value-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {project.participants.filter(p => p.role === 'PARTNER').map((p, i) => (
                          <span key={i} style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                            {p.company_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* [NEW] 주요 담당자 (Manager/Safety) */}
                  {project.key_members && project.key_members.length > 0 && (
                     <div className="info-row" style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      <span className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>현장 핵심 인력</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {project.key_members.map((member, idx) => (
                           <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                             <span style={{ color: '#64748b' }}>{member.role_name}</span>
                             <span style={{ fontWeight: '600', color: '#334155' }}>{member.name}</span>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                  <div className="info-card" style={{ gridColumn: 'span 2' }}>
                    <h3>위치 정보</h3>
                    <div className="info-row">
                      <span className="label">주소</span>
                      <span className="value">{project.location_address || '-'}</span>
                    </div>
                    {project.location_lat && project.location_lng ? (
                      <div style={{ marginTop: '1rem', height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                        <MapContainer 
                          center={[project.location_lat, project.location_lng]} 
                          zoom={15} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[project.location_lat, project.location_lng]} />
                        </MapContainer>
                      </div>
                    ) : (
                       <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8' }}>
                         위치 좌표가 설정되지 않았습니다.
                       </div>
                    )}
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'sites' && (
            <div className="placeholder-content">
              <h3>🏗️ 현장 관리</h3>
              <p>이 프로젝트의 현장(Site) 및 구역(Zone)을 관리합니다.</p>
              <button className="btn-action">+ 현장 추가</button>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="companies-tab-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>🏢 참여 업체 관리</h3>
                <button className="btn-action" onClick={() => navigate(`/projects/${id}/edit`)}>+ 업체 추가/수정</button>
              </div>
              
              <div className="participant-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {project.participants && project.participants.length > 0 ? (
                  // 중복 제거 필터링 (동일 업체ID + 동일 역할인 경우 중복 렌더링 방지)
                  project.participants.filter((v, i, a) => a.findIndex(t => (t.company_id === v.company_id && t.role === v.role)) === i).map((part, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '700', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          background: part.role === 'CLIENT' ? '#eff6ff' : part.role === 'CONSTRUCTOR' ? '#ecfdf5' : '#f8fafc',
                          color: part.role === 'CLIENT' ? '#3b82f6' : part.role === 'CONSTRUCTOR' ? '#10b981' : '#64748b',
                          border: `1px solid ${part.role === 'CLIENT' ? '#bfdbfe' : part.role === 'CONSTRUCTOR' ? '#a7f3d0' : '#e2e8f0'}`
                        }}>
                          {part.role === 'CLIENT' ? '발주처' : part.role === 'CONSTRUCTOR' ? '원청(시공)' : '협력사'}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>{part.company_name}</h4>
                      <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        등록일: {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: 'span 3', padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8' }}>
                    등록된 참여 업체 정보가 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'workers' && (
            <div className="workers-tab-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>👷 참여 작업자 현황</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>참여 업체에 소속된 작업자 명단입니다.</p>
              </div>
              
              <div className="worker-list" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>이름</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>소속 업체</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>연락처</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.length > 0 ? workers.map((worker) => (
                      <tr key={worker.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px', fontWeight: '700', color: '#1e293b' }}>{worker.full_name}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>
                            {worker.company_name}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', color: '#334155', fontWeight: '500' }}>{worker.phone || '-'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>이 프로젝트에 투입된 작업자가 아직 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="placeholder-content">
              <h3>⚠️ 일일 위험지역 설정</h3>
              <p>안전관리자가 매일 위험지역을 실시간으로 설정합니다.</p>
              <button className="btn-action">+ 위험지역 추가</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
