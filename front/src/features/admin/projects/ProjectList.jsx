import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, getActiveProjects, deleteProject } from '@/api/projectApi';
import './ProjectList.css';

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'active'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [filter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = filter === 'active' 
        ? await getActiveProjects() 
        : await getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
      alert('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId, projectName) => {
    if (!confirm(`"${projectName}" 프로젝트를 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      alert('프로젝트가 삭제되었습니다.');
      loadProjects();
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
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

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  if (loading) {
    return <div className="loading">프로젝트 목록을 불러오는 중...</div>;
  }

  return (
    <div className="project-list-container">
      <div className="project-header">
        <h1>프로젝트 관리</h1>
        <div className="header-actions">
          <div className="filter-buttons">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              전체 프로젝트
            </button>
            <button
              className={filter === 'active' ? 'active' : ''}
              onClick={() => setFilter('active')}
            >
              진행 중
            </button>
          </div>
          <button className="btn-create" onClick={() => navigate('/admin/projects/create')}>
            + 새 프로젝트 생성
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>등록된 프로젝트가 없습니다.</p>
          <button onClick={() => navigate('/admin/projects/create')}>
            첫 프로젝트 만들기
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="card-header">
                <h3>{project.name}</h3>
                {getStatusBadge(project.status)}
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">📍 위치</span>
                  <span className="value">{project.location_address || '-'}</span>
                </div>

                <div className="info-row">
                  <span className="label">🏢 발주처</span>
                  <span className="value">{project.client_company || '-'}</span>
                </div>

                <div className="info-row">
                  <span className="label">🏗️ 시공사</span>
                  <span className="value">{project.constructor_company || '-'}</span>
                </div>

                <div className="info-row">
                  <span className="label">💰 공사 금액</span>
                  <span className="value">{formatCurrency(project.budget_amount)}</span>
                </div>

                <div className="info-row">
                  <span className="label">📅 공사 기간</span>
                  <span className="value">
                    {project.start_date || '미정'} ~ {project.end_date || '미정'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">🔧 공사 유형</span>
                  <span className="value">{project.project_type || '-'}</span>
                </div>

                <div className="info-row">
                  <span className="label">🤝 참여 업체</span>
                  <span className="value">
                    {project.participants?.length > 0 
                      ? `${project.participants.filter(p => p.role === 'PARTNER').length}개 협력사 참여 중`
                      : '등록된 협력사 없음'}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button
                  className="btn-detail"
                  onClick={() => navigate(`/admin/projects/${project.id}`)}
                >
                  상세보기
                </button>
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                >
                  수정
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(project.id, project.name)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
