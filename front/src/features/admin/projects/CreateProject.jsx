import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../../../api/projectApi';
import { getAllCompanies, createCompany } from '../../../api/companyApi'; // API 연동
import { MapPin, Calendar, Building2, Save, X, Plus } from 'lucide-react';
import './CreateProject.css';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    location_address: '',
    client_company: '',     // 발주처 (이름)
    constructor_company: '', // 시공사 (이름)
    start_date: '',
    end_date: '',
    project_type: '건축',   // 기본값
    budget_amount: 0
  });

  // 회사 목록 상태
  const [companies, setCompanies] = useState([]);
  
  // 회사 등록 모달 상태
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({ name: '', type: 'SPECIALTY' });
  const [targetField, setTargetField] = useState(null); // 어느 필드(발주처/시공사)를 위해 등록 중인지

  // 직접 입력 모드 (Select에서 '직접 입력' 선택 시)
  const [isDirectClient, setIsDirectClient] = useState(false);
  const [isDirectConstructor, setIsDirectConstructor] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('회사 목록 로드 실패', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 새 업체 등록 처리
  const handleCreateCompany = async () => {
    if (!newCompanyData.name) return alert("업체명을 입력해주세요.");
    try {
      const created = await createCompany(newCompanyData);
      // 목록 갱신
      setCompanies(prev => [...prev, created]);
      // 폼에 자동 선택
      if (targetField) {
        setFormData(prev => ({ ...prev, [targetField]: created.name }));
        // 직접 입력 모드 해제
        if (targetField === 'client_company') setIsDirectClient(false);
        if (targetField === 'constructor_company') setIsDirectConstructor(false);
      }
      setShowCompanyModal(false);
      setNewCompanyData({ name: '', type: 'SPECIALTY' });
      alert(`${created.name} 등록 완료!`);
    } catch (err) {
      alert("업체 등록 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  const openCompanyModal = (field, defaultType) => {
    setTargetField(field);
    setNewCompanyData({ name: '', type: defaultType }); // 발주처면 GENERAL, 시공사면 GENERAL/SPECIALTY
    setShowCompanyModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) return alert('프로젝트명을 입력해주세요.');

    setLoading(true);
    try {
      // 숫자 변환 등 전처리
      const payload = {
        ...formData,
        budget_amount: formData.budget_amount ? parseInt(formData.budget_amount) : 0
      };

      await createProject(payload);
      alert('프로젝트가 성공적으로 생성되었습니다.');
      navigate('/admin/projects');
    } catch (error) {
      console.error('생성 실패:', error);
      alert('프로젝트 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>새 프로젝트 생성</h1>
        <p style={{ color: '#64748b' }}>새로운 현장을 개설하고 기본 정보를 설정합니다.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        
        {/* 1. 기본 정보 */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginBottom: '1rem', display:'flex', alignItems:'center', gap:'8px' }}>
          <Building2 size={20} /> 프로젝트 기본 정보
        </h3>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>프로젝트 명 *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="예: 강남 스마트 아파트 신축공사"
            required
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>공사 유형</label>
            <select
              name="project_type"
              value={formData.project_type}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            >
              <option value="건축">건축 (Architecture)</option>
              <option value="토목">토목 (Civil)</option>
              <option value="플랜트">플랜트 (Plant)</option>
              <option value="리모델링">리모델링</option>
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>예산 (원)</label>
            <input
              type="number"
              name="budget_amount"
              value={formData.budget_amount}
              onChange={handleChange}
              placeholder="0"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        {/* 2. 참여 업체 (핵심 기능) */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginBottom: '1rem', marginTop: '2rem', display:'flex', alignItems:'center', gap:'8px' }}>
          <Building2 size={20} /> 발주처 및 시공사
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* 발주처 선택 */}
          <div className="form-group">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: '600', color: '#475569' }}>발주처 (Client)</label>
              <button type="button" onClick={() => openCompanyModal('client_company', 'GENERAL')} style={{ fontSize:'0.8rem', color:'#3b82f6', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap: '4px' }}>
                <Plus size={14} /> 새 발주처 등록
              </button>
            </div>
            {!isDirectClient ? (
              <select
                name="client_company"
                value={formData.client_company}
                onChange={(e) => {
                  if (e.target.value === '__DIRECT__') {
                    setIsDirectClient(true);
                    setFormData({ ...formData, client_company: '' });
                  } else {
                    handleChange(e);
                  }
                }}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              >
                <option value="">선택하세요</option>
                {companies.filter(c => c.type === 'GENERAL').map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                <optgroup label="기타 업체">
                  {companies.filter(c => c.type !== 'GENERAL').map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </optgroup>
                <option value="__DIRECT__">+ 직접 입력</option>
              </select>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="client_company"
                  value={formData.client_company}
                  onChange={handleChange}
                  placeholder="발주처명 직접 입력"
                  autoFocus
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
                <button type="button" onClick={() => setIsDirectClient(false)} style={{ padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>취소</button>
              </div>
            )}
          </div>

          {/* 시공사 선택 */}
          <div className="form-group">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: '600', color: '#475569' }}>시공사 (Constructor)</label>
              <button type="button" onClick={() => openCompanyModal('constructor_company', 'GENERAL')} style={{ fontSize:'0.8rem', color:'#3b82f6', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap: '4px' }}>
                <Plus size={14} /> 새 시공사 등록
              </button>
            </div>
            {!isDirectConstructor ? (
              <select
                name="constructor_company"
                value={formData.constructor_company}
                onChange={(e) => {
                  if (e.target.value === '__DIRECT__') {
                    setIsDirectConstructor(true);
                    setFormData({ ...formData, constructor_company: '' });
                  } else {
                    handleChange(e);
                  }
                }}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              >
                <option value="">선택하세요</option>
                {companies.map(c => (
                  <option key={c.id} value={c.name}>{c.name} {c.type === 'GENERAL' ? '(원청)' : '(협력)'}</option>
                ))}
                <option value="__DIRECT__">+ 직접 입력</option>
              </select>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="constructor_company"
                  value={formData.constructor_company}
                  onChange={handleChange}
                  placeholder="시공사명 직접 입력"
                  autoFocus
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
                <button type="button" onClick={() => setIsDirectConstructor(false)} style={{ padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>취소</button>
              </div>
            )}
          </div>
        </div>

        {/* 3. 위치 및 기간 */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginBottom: '1rem', marginTop: '2rem', display:'flex', alignItems:'center', gap:'8px' }}>
          <MapPin size={20} /> 위치 및 기간
        </h3>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>현장 주소</label>
          <input
            type="text"
            name="location_address"
            value={formData.location_address}
            onChange={handleChange}
            placeholder="예: 서울시 강남구 역삼동 123-45"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>착공일</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>준공 예정일</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/projects')}
            style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', background: 'white', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: '600' }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ 
              padding: '0.8rem 2rem', 
              borderRadius: '8px', 
              background: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? '생성 중...' : <><Save size={18} /> 프로젝트 생성</>}
          </button>
        </div>
      </form>

      {/* 인라인 모달: 새 업체 등록 */}
      {showCompanyModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '360px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', color: '#1e293b' }}>
              {targetField === 'client_company' ? '새 발주처 등록' : '새 시공사 등록'}
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize:'0.9rem', color: '#64748b' }}>업체명</label>
              <input 
                type="text" 
                value={newCompanyData.name}
                onChange={e => setNewCompanyData({...newCompanyData, name: e.target.value})}
                placeholder="업체명 입력"
                autoFocus
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize:'0.9rem', color: '#64748b' }}>기업 구분</label>
              <select 
                value={newCompanyData.type}
                onChange={e => setNewCompanyData({...newCompanyData, type: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              >
                <option value="GENERAL">종합건설 (원청/시행사/발주처)</option>
                <option value="SPECIALTY">전문건설 (협력사)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => setShowCompanyModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight:'600' }}
              >
                취소
              </button>
              <button 
                type="button"
                onClick={handleCreateCompany}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight:'600' }}
              >
                등록 후 선택
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateProject;
