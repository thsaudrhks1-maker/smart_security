import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  MoreVertical, 
  Briefcase 
} from 'lucide-react';
import { getActiveProjects, getProjectParticipants, addProjectParticipant } from '@/api/projectApi';

const PartnerManagement = () => {
  const [projectId, setProjectId] = useState(null); // 내 프로젝트 ID
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 협력사 추가 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerRole, setNewPartnerRole] = useState('PARTNER'); // PARTNER or CONSTRUCTOR

  // 1. 내 프로젝트 & 협력사 목록 로딩
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. 활성 프로젝트 조회
      const projects = await getActiveProjects();
      if (projects.length > 0) {
        const myProject = projects[0];
        setProjectId(myProject.id);
        
        // 2. 협력사 목록 조회
        const parts = await getProjectParticipants(myProject.id);
        setPartners(parts);
      }
    } catch (error) {
      console.error("Failed to fetch partners:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 협력사 추가 핸들러
  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!newPartnerName.trim() || !projectId) return;

    try {
      await addProjectParticipant(projectId, newPartnerName, newPartnerRole);
      alert('협력사가 등록되었습니다.');
      setIsModalOpen(false);
      setNewPartnerName('');
      fetchData(); // 목록 갱신
    } catch (error) {
      console.error(error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!projectId) return <div style={{ padding: '2rem' }}>진행 중인 프로젝트가 없습니다.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '12px' }}>
            <Briefcase size={24} color="#0284c7" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>협력사 관리</h1>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
              현장에 참여 중인 시공사 및 협력업체를 관리합니다.
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: '#0284c7', color: 'white', border: 'none', 
            padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.4)'
          }}
        >
          <Plus size={18} /> 협력사 등록
        </button>
      </div>

      {/* 검색 및 필터 (UI만 존재) */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="업체명 또는 공종 검색..." 
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
          />
        </div>
        <select style={{ padding: '0 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569' }}>
          <option>전체 공종</option>
          <option>전기</option>
          <option>설비</option>
          <option>철근/콘크리트</option>
        </select>
      </div>

      {/* 협력사 목록 테이블 */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', width: '60px', textAlign: 'center', color: '#64748b' }}>No</th>
              <th style={{ padding: '1rem', color: '#475569' }}>업체명</th>
              <th style={{ padding: '1rem', color: '#475569' }}>주 공종</th>
              <th style={{ padding: '1rem', color: '#475569' }}>역할</th>
              <th style={{ padding: '1rem', color: '#475569' }}>소속 근로자</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#475569' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {partners.length > 0 ? (
              partners.map((p, index) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>{index + 1}</td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{p.company_name}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>
                    <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {p.trade_type || '미지정'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Badge role={p.role} />
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>- 명</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  등록된 협력사가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 협력사 등록 모달 */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1e293b' }}>협력사 등록</h2>
            
            <form onSubmit={handleAddPartner}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>업체명</label>
                <input 
                  type="text" 
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="예: 번개전기(주)"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>역할 구분</label>
                <select 
                  value={newPartnerRole}
                  onChange={(e) => setNewPartnerRole(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="PARTNER">협력사 (Partner)</option>
                  <option value="CONSTRUCTOR">시공사 (Constructor)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', cursor: 'pointer' }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#0284c7', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const Badge = ({ role }) => {
  const isConstructor = role === 'CONSTRUCTOR';
  return (
    <span style={{
      background: isConstructor ? '#dbeafe' : '#f0fdf4',
      color: isConstructor ? '#1e40af' : '#166534',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: '600'
    }}>
      {isConstructor ? '시공사' : '협력사'}
    </span>
  );
};

export default PartnerManagement;
