import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../../../api/projectApi';
import { getAllCompanies, createCompany, getCompanyUsers } from '../../../api/companyApi'; // API 연동
import { MapPin, Calendar, Building2, Save, X, Plus, UserPlus } from 'lucide-react';
import LocationPicker from '../components/common/LocationPicker'; // 지도 컴포넌트 추가
import './CreateProject.css';

// 오늘 날짜 YYYY-MM-DD
const todayStr = () => new Date().toISOString().slice(0, 10);
// 오늘 기준 6개월 뒤 YYYY-MM-DD
const sixMonthsLaterStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().slice(0, 10);
};

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // 폼 데이터 (착공일=오늘, 준공예정일=6개월 뒤 기본값)
  const [formData, setFormData] = useState({
    name: '',
    location_address: '',
    location_lat: null,
    location_lng: null,
    client_company: '',     
    client_id: null,
    constructor_company: '', 
    constructor_id: null,
    start_date: todayStr(),
    end_date: sixMonthsLaterStr(),
    project_type: '건축',   
    budget_amount: 0,
    partner_ids: [], // 협력사 ID 목록 추가
    manager_id: '', // [NEW] 현장소장
    safety_manager_id: '' // [NEW] 안전관리자
  });

  // 회사 목록 상태
  const [companies, setCompanies] = useState([]);
  // 관리자 후보 목록 상태
  const [candidateManagers, setCandidateManagers] = useState([]);
  const [candidateSafeties, setCandidateSafeties] = useState([]);
  
  // 회사 등록 모달 상태
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({ name: '', type: 'SPECIALTY' });
  const [targetField, setTargetField] = useState(null); // 어느 필드(발주처/시공사)를 위해 등록 중인지

  // 직접 입력 모드 (Select에서 '직접 입력' 선택 시)
  const [isDirectClient, setIsDirectClient] = useState(false);
  const [isDirectConstructor, setIsDirectConstructor] = useState(false);

  // 지도 클릭/검색 시 좌표 + 주소(역지오코딩 또는 검색 결과) 반영 → 현장 주소 자동 기입
  const handleMapClick = (lat, lng, address = null) => {
    setFormData(prev => ({
      ...prev,
      location_lat: lat,
      location_lng: lng,
      ...(address != null && address !== '' ? { location_address: address } : {})
    }));
  };

  // 협력사(Partner) ID 토글 관리
  const handleTogglePartnerId = (companyId) => {
    setFormData(prev => {
      const exists = prev.partner_ids.includes(companyId);
      if (exists) {
        return { ...prev, partner_ids: prev.partner_ids.filter(id => id !== companyId) };
      } else {
        return { ...prev, partner_ids: [...prev.partner_ids, companyId] };
      }
    });
  };

  const [partners, setPartners] = useState([]); // 명칭 기반 (기존 호환용)
  const [partnerInput, setPartnerInput] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  // 시공사 선택 시 해당 회사의 관리자/안전관리자 목록 조회
  useEffect(() => {
    if (formData.constructor_id) {
      loadKeyPersonnel(formData.constructor_id);
    } else {
      setCandidateManagers([]);
      setCandidateSafeties([]);
    }
  }, [formData.constructor_id]);

  const loadCompanies = async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('회사 목록 로드 실패', err);
    }
  };

  const loadKeyPersonnel = async (companyId) => {
    try {
      // 1. 현장소장 후보 (role=manager)
      const managers = await getCompanyUsers(companyId, 'manager');
      setCandidateManagers(managers);

      // 2. 안전관리자 후보 (role=safety_manager)
      const safeties = await getCompanyUsers(companyId, 'safety_manager');
      setCandidateSafeties(safeties);
    } catch (err) {
      console.error('담당자 목록 로드 실패', err);
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
      const payload = {
        ...formData,
        budget_amount: formData.budget_amount ? parseInt(formData.budget_amount) : 0,
        partners: partners, // 수동 입력 협력사 명칭
        // 빈 문자열이면 null로 전송
        manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
        safety_manager_id: formData.safety_manager_id ? parseInt(formData.safety_manager_id) : null
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
    <div className="create-project-scroll-container" style={{ 
      height: '100vh', 
      overflowY: 'auto', 
      padding: '2rem',
      msOverflowStyle: 'none',  /* IE and Edge */
      scrollbarWidth: 'none'    /* Firefox */
    }}>
      {/* Chrome, Safari, Opera에서 스크롤바 숨기기 */}
      <style>{`
        .create-project-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>새 프로젝트 생성</h1>
          <p style={{ color: '#64748b' }}>새로운 현장을 개설하고 기본 정보를 설정합니다.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '5rem' }}>
        
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
                value={formData.client_id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__DIRECT__') {
                    setIsDirectClient(true);
                    setFormData({ ...formData, client_company: '', client_id: null });
                  } else {
                    const selected = companies.find(c => c.id === parseInt(val));
                    setFormData({ ...formData, client_company: selected?.name || '', client_id: selected?.id || null });
                  }
                }}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              >
                <option value="">선택하세요</option>
                {companies.filter(c => c.type === 'GENERAL').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <optgroup label="기타 업체">
                  {companies.filter(c => c.type !== 'GENERAL').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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
                value={formData.constructor_id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__DIRECT__') {
                    setIsDirectConstructor(true);
                    setFormData({ ...formData, constructor_company: '', constructor_id: null });
                  } else {
                    const selected = companies.find(c => c.id === parseInt(val));
                    setFormData({ ...formData, constructor_company: selected?.name || '', constructor_id: selected?.id || null });
                  }
                }}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              >
                <option value="">선택하세요</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.type === 'GENERAL' ? '(원청)' : '(협력)'}</option>
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

        {/* [NEW] 현장 담당자 배정 (시공사 선택 시에만 표시) */}
        {!isDirectConstructor && formData.constructor_id && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#1e40af', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} /> 현장 핵심 인력 배정 (선택 사항)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {/* 현장소장 선택 */}
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e40af', fontSize: '0.9rem' }}>
                  현장소장 (Manager)
                </label>
                <select
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #93c5fd', fontSize: '0.95rem' }}
                >
                  <option value="">(미지정)</option>
                  {candidateManagers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.username})
                    </option>
                  ))}
                </select>
                {candidateManagers.length === 0 && (
                   <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>* 해당 시공사에 등록된 '현장소장(manager)' 역할의 사용자가 없습니다.</p>
                )}
              </div>

              {/* 안전관리자 선택 */}
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#16a34a', fontSize: '0.9rem' }}>
                  안전관리자 (Safety Manager)
                </label>
                <select
                  name="safety_manager_id"
                  value={formData.safety_manager_id}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #86efac', fontSize: '0.95rem' }}
                >
                  <option value="">(미지정)</option>
                  {candidateSafeties.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.username})
                    </option>
                  ))}
                </select>
                {candidateSafeties.length === 0 && (
                   <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>* 해당 시공사에 등록된 '안전관리자(safety_manager)' 역할의 사용자가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 협력사 추가 (리스트) */}
        <div className="form-group" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
            협력사 (Partners) <span style={{fontWeight:'normal', fontSize:'0.9rem', color:'#94a3b8'}}>- DB 목록에서 선택 또는 직접 입력</span>
          </label>
          
          {/* DB 등록된 협력사 목록 (토글형) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem', maxHeight: '120px', overflowY: 'auto', padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {companies.filter(c => c.type === 'SPECIALTY').map(c => {
              const isActive = formData.partner_ids.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleTogglePartnerId(c.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isActive ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                    background: isActive ? '#eff6ff' : 'white',
                    color: isActive ? '#3b82f6' : '#64748b',
                    fontWeight: isActive ? '700' : '500'
                  }}
                >
                  {isActive ? '✓ ' : '+ '}{c.name}
                </button>
              );
            })}
            {companies.filter(c => c.type === 'SPECIALTY').length === 0 && (
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>등록된 협력사가 없습니다.</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="명단에 없는 업체 직접 입력 (Enter)" 
              value={partnerInput}
              onChange={(e) => setPartnerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (partnerInput.trim() && !partners.includes(partnerInput.trim())) {
                    setPartners([...partners, partnerInput.trim()]);
                    setPartnerInput('');
                  }
                }
              }}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {partners.map((p, idx) => (
              <div key={idx} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#334155' }}>
                {p} (직접입력)
                <button 
                  type="button" 
                  onClick={() => setPartners(partners.filter((_, i) => i !== idx))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#94a3b8' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
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
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', marginBottom: '0.5rem' }}
          />

          {/* 지도 클릭 좌표 설정 UI */}
          {/* 실제 지도 라이브러리 연동 (LocationPicker) */}
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
            지도를 클릭하거나 주소를 검색하면 위 현장 주소에 자동으로 기입됩니다.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <LocationPicker 
              onLocationSelect={handleMapClick} 
              initialLat={formData.location_lat}
              initialLng={formData.location_lng}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.75rem' }}>
            GPS 기반 도면은 프로젝트 저장 후 [프로젝트 상세 → 현장 관리]에서 업로드할 수 있습니다. 작업 구역·위험 구역 표시는 추후 도면 위 영역 지정 기능으로 확장 예정입니다.
          </p>
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

      </div> {/* maxWidth 컨테이너 닫기 */}
    </div> /* scroll 컨테이너 닫기 */
  );
};

export default CreateProject;
