import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, Briefcase } from 'lucide-react';
import { getAllCompanies, createCompany } from '../../../api/companyApi';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // 입력 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    type: 'SPECIALTY', // 기본값: 협력사
    trade_type: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("협력사 목록 로드 실패", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name) return alert("업체명을 입력해주세요.");
      
      await createCompany(formData);
      alert("등록되었습니다.");
      setShowModal(false);
      setFormData({ name: '', type: 'SPECIALTY', trade_type: '' });
      loadCompanies(); // 목록 갱신
    } catch (err) {
      alert("등록 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem', display:'flex', alignItems:'center', gap:'10px' }}>
            <Building2 size={32} color="#3b82f6"/> 협력사(고객사) 관리
          </h1>
          <p style={{ color: '#64748b' }}>프로젝트에 참여하는 모든 시공사 및 협력업체를 관리합니다.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            padding: '0.8rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
          }}
        >
          <Plus size={20} /> 업체 등록
        </button>
      </div>

      {/* 목록 테이블 */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>업체명</th>
              <th style={{ padding: '16px', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>구분</th>
              <th style={{ padding: '16px', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>주 공종</th>
              <th style={{ padding: '16px', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>데이터를 불러오는 중...</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>등록된 업체가 없습니다.</td></tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#334155' }}>{company.name}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      background: company.type === 'GENERAL' ? '#dbeafe' : '#f1f5f9',
                      color: company.type === 'GENERAL' ? '#1e40af' : '#475569',
                      fontWeight: '600'
                    }}>
                      {company.type === 'GENERAL' ? '원청/종합' : '협력/전문'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{company.trade_type || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <button style={{ padding: '6px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize:'0.85rem' }}>수정</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 등록 모달 */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>새 업체 등록</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>업체명</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="예: 현대건설, XX설비"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>기업 구분</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                >
                  <option value="SPECIALTY">전문건설 (협력사)</option>
                  <option value="GENERAL">종합건설 (원청/시행사)</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>주 공종 (선택)</label>
                <input 
                  type="text" 
                  value={formData.trade_type}
                  onChange={e => setFormData({...formData, trade_type: e.target.value})}
                  placeholder="예: 철근, 토목, 설비"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight:'600' }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight:'600' }}
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
