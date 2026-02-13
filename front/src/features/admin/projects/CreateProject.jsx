
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import { companyApi } from '@/api/companyApi';
import { userApi } from '@/api/userApi';
import { 
  Building2, Users, MapPin, Calendar, Grid, 
  ArrowLeft, Rocket, Plus, ShieldCheck, Map as MapIcon, 
  Layers, ChevronDown, CheckCircle2, UserCheck, Wrench, Beaker
} from 'lucide-react';

import CommonMap from '@/components/common/CommonMap';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // 데이터 옵션
  const [clients, setClients] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [partners, setPartners] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [safetyManagerOptions, setSafetyManagerOptions] = useState([]);
  
  // 오늘 날짜와 6개월 후 날짜 계산용 헬퍼
  const getToday = () => new Date().toISOString().split('T')[0];
  const getFuture = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '강남 테헤란로 데이터센터 신축공사',
    budget: '50000000',
    client_id: '',
    constructor_id: '',
    partner_ids: [],
    manager_id: '',
    safety_manager_id: '',
    location_address: '',
    lat: 37.5665,
    lng: 126.9780,
    start_date: getToday(),
    end_date: getFuture(6),
    grid_cols: 5,
    grid_rows: 5,
    grid_spacing: 10,
    floors_above: 1,
    floors_below: 0,
    grid_angle: 0
  });

  // 직접 입력 모드
  const [directInput, setDirectInput] = useState({ client: false, constructor: false, partner: false });
  const [newCompany, setNewCompany] = useState({ client: '', constructor: '', partner: '' });

  // 초기 로드
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await companyApi.getCompanies();
        const all = res.data.data || [];
        setClients(all.filter(c => c.type === 'CLIENT'));
        setConstructors(all.filter(c => c.type === 'CONSTRUCTOR'));
        setPartners(all.filter(c => c.type === 'PARTNER'));
      } catch (e) { console.error('업체 로드 실패', e); }
    };
    loadCompanies();
  }, []);

  // 시공사 선택 시 관리자 목록 필터링
  useEffect(() => {
    if (formData.constructor_id && !directInput.constructor) {
      const loadUsers = async () => {
        try {
          const res = await userApi.getUsersByCompany(formData.constructor_id);
          const users = res.data.data || [];
          const mgrs = users.filter(u => u.role === 'manager' || u.role === 'admin');
          setManagerOptions(mgrs);
          setSafetyManagerOptions(mgrs);
        } catch (e) { console.error('사용자 로드 실패', e); }
      };
      loadUsers();
    } else {
      setManagerOptions([]);
      setSafetyManagerOptions([]);
    }
  }, [formData.constructor_id, directInput.constructor]);

  // 테스트 데이터 퀵 입력
  const fillTestData = () => {
    setFormData(prev => ({
      ...prev,
      name: `스마트 안전 테스트 현장_${Math.floor(Math.random() * 1000)}`,
      budget: '150000000',
      grid_cols: 8,
      grid_rows: 8,
      grid_spacing: 20,
      floors_above: 2,
      floors_below: 1
    }));
  };

  const handleMapClick = async (latlng) => {
    // 1. 좌표 우선 업데이트
    setFormData(prev => ({
      ...prev,
      lat: latlng.lat,
      lng: latlng.lng,
      location_address: '주소 검색 중...' // 피드백 제공
    }));

    // 2. 역지오코딩 (Reverse Geocoding) - OpenStreetMap Nominatim 활용
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        // 주소에서 불필요한 부분 제거 및 깔끔하게 포맷팅
        const addr = data.display_name;
        setFormData(prev => ({ ...prev, location_address: addr }));
      } else {
        setFormData(prev => ({ ...prev, location_address: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}` }));
      }
    } catch (e) {
      console.error('주소 변환 실패', e);
      setFormData(prev => ({ ...prev, location_address: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}` }));
    }
  };

  const togglePartner = (id) => {
    setFormData(prev => ({
      ...prev,
      partner_ids: prev.partner_ids.includes(id) 
        ? prev.partner_ids.filter(p => p !== id) 
        : [...prev.partner_ids, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('프로젝트 명을 입력해주세요.');

    setLoading(true);
    try {
      let finalData = { ...formData };
      
      // 직접 입력 업체 생성 (순차적 처리)
      if (directInput.client && newCompany.client) {
        const res = await companyApi.createCompany({ name: newCompany.client, type: 'CLIENT', trade_type: '민간' });
        finalData.client_id = res.data.data.id;
      }
      if (directInput.constructor && newCompany.constructor) {
        const res = await companyApi.createCompany({ name: newCompany.constructor, type: 'CONSTRUCTOR', trade_type: '종합건설' });
        finalData.constructor_id = res.data.data.id;
      }
      // 직접 입력 파트너 (선택사항)
      if (directInput.partner && newCompany.partner) {
        const res = await companyApi.createCompany({ name: newCompany.partner, type: 'PARTNER', trade_type: '전문건설' });
        finalData.partner_ids = [...finalData.partner_ids, res.data.data.id];
      }

      const res = await projectApi.createProject(finalData);
      if (res.data.success) {
        alert('프로젝트가 성공적으로 생성되었습니다. 구역(Zone) 정보가 자동 구축되었습니다.');
        navigate('/admin/dashboard');
      }
    } catch (e) {
      alert('생성 실패: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '5rem', color: '#1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>
          <ArrowLeft size={18} /> 이전으로
        </button>
        <button 
          onClick={fillTestData}
          type="button" 
          style={{ padding: '0.6rem 1.2rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', color: '#475569', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Beaker size={16} /> 테스트 데이터 채우기
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>새 프로젝트 등록</h1>
        <p style={{ color: '#64748b' }}>현장의 위치와 격자 설정을 통해 Digital Twin 관제를 시작합니다.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* 기본 정보 */}
        <FormSection title="기본 정보" icon={<Wrench size={18} color="#3b82f6"/>}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Label>프로젝트 명 *</Label>
            <Input 
              placeholder="예: 강남 데이터센터 신축공사" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div>
            <Label>예산 (원)</Label>
            <Input type="number" placeholder="50000000" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
          </div>
          <div>
             <Label>착공 / 준공일</Label>
             <div style={{ display: 'flex', gap: '10px' }}>
               <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
               <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
             </div>
          </div>
        </FormSection>

        {/* 업체 배정 */}
        <FormSection title="참여 업체 배정" icon={<Building2 size={18} color="#f59e0b"/>}>
          <div>
            <Label>발주처 (Client) {directInput.client && '(직접 입력)'}</Label>
            {!directInput.client ? (
              <Select value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                <option value="">업체 선택</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            ) : (
              <Input placeholder="회사명 입력" value={newCompany.client} onChange={e => setNewCompany({...newCompany, client: e.target.value})} />
            )}
            <ToggleButton onClick={() => setDirectInput({...directInput, client: !directInput.client})} label={directInput.client ? '목록 선택' : '+ 직접 등록'} />
          </div>
          <div>
            <Label>시공사 (Constructor) {directInput.constructor && '(직접 입력)'}</Label>
            {!directInput.constructor ? (
              <Select value={formData.constructor_id} onChange={e => setFormData({...formData, constructor_id: e.target.value})}>
                <option value="">업체 선택</option>
                {constructors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            ) : (
              <Input placeholder="회사명 입력" value={newCompany.constructor} onChange={e => setNewCompany({...newCompany, constructor: e.target.value})} />
            )}
            <ToggleButton onClick={() => setDirectInput({...directInput, constructor: !directInput.constructor})} label={directInput.constructor ? '목록 선택' : '+ 직접 등록'} />
          </div>
          
          {/* 다중 협력사 선택 */}
          <div style={{ gridColumn: '1 / -1' }}>
             <Label>협력사 (Partners) - 다중 선택</Label>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginTop: '10px' }}>
                {partners.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => togglePartner(p.id)}
                    style={{ 
                      padding: '12px', borderRadius: '12px', border: '1.5px solid', 
                      borderColor: formData.partner_ids.includes(p.id) ? '#3b82f6' : '#e2e8f0',
                      background: formData.partner_ids.includes(p.id) ? '#eff6ff' : 'white',
                      cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem', fontWeight: '700',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {formData.partner_ids.includes(p.id) && <CheckCircle2 size={14} color="#3b82f6" />}
                    {p.name}
                  </div>
                ))}
                
                {/* 파트너 직접 등록 토글 */}
                <div 
                    onClick={() => setDirectInput({...directInput, partner: !directInput.partner})}
                    style={{ 
                      padding: '12px', borderRadius: '12px', border: '1.5px dashed #cbd5e1', 
                      background: directInput.partner ? '#fffbeb' : 'white',
                      cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem', fontWeight: '700',
                      color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                  <Plus size={14} /> {directInput.partner ? '직접 등록 취소' : '새 협력사 추가'}
                </div>
             </div>
             {directInput.partner && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <Label style={{ fontSize: '0.8rem', color: '#92400e' }}>새로 추가할 협력사 명</Label>
                  <Input placeholder="협력사명 입력" value={newCompany.partner} onChange={e => setNewCompany({...newCompany, partner: e.target.value})} />
                </div>
             )}
          </div>
        </FormSection>

        {/* 인력 배정 */}
        <FormSection title="핵심 인력" icon={<Users size={18} color="#10b981" />}>
           <div>
             <Label>현장 소장 (Manager)</Label>
             <Select value={formData.manager_id} onChange={e => setFormData({...formData, manager_id: e.target.value})} disabled={directInput.constructor}>
               <option value="">인원 선택</option>
               {managerOptions.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.username})</option>)}
             </Select>
           </div>
           <div>
             <Label>안전 관리자 (Safety Manager)</Label>
             <Select value={formData.safety_manager_id} onChange={e => setFormData({...formData, safety_manager_id: e.target.value})} disabled={directInput.constructor}>
               <option value="">인원 선택</option>
               {safetyManagerOptions.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.username})</option>)}
             </Select>
           </div>
        </FormSection>

        {/* 위치 및 격자 */}
        <FormSection title="현장 위치 및 격자(Grid) 시뮬레이션" icon={<Grid size={18} color="#6366f1" />}>
           <div style={{ gridColumn: '1 / -1' }}>
             <Label>현장 위치 (지도 클릭 시 격자 중심점 이동)</Label>
             <div style={{ height: '400px', marginBottom: '1.5rem' }}>
                <CommonMap 
                   center={[formData.lat, formData.lng]} 
                   zoom={16}
                   onMapClick={handleMapClick}
                   gridConfig={{ 
                      rows: parseInt(formData.grid_rows), 
                      cols: parseInt(formData.grid_cols), 
                      spacing: parseFloat(formData.grid_spacing),
                      angle: parseFloat(formData.grid_angle)
                   }}
                   markers={[{ lat: formData.lat, lng: formData.lng, title: '격자 중심점' }]}
                />
             </div>
             <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ marginBottom: '6px' }}>
                  <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  선택된 좌표: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                </div>
                {formData.location_address && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                    주소 (project_master에 자동 저장): {formData.location_address}
                  </div>
                )}
             </div>
           </div>
           
           <div>
             <Label>격자 규모 (가로 x 세로 칸 수)</Label>
             <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>가로 (Cols)</span>
                  <Input type="number" value={formData.grid_cols} onChange={e => setFormData({...formData, grid_cols: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>세로 (Rows)</span>
                  <Input type="number" value={formData.grid_rows} onChange={e => setFormData({...formData, grid_rows: e.target.value})} />
                </div>
             </div>
           </div>
           <div>
             <Label>격자 한 칸 간격 (미터)</Label>
             <Select value={formData.grid_spacing} onChange={e => setFormData({...formData, grid_spacing: e.target.value})}>
               <option value="5">5m (정밀)</option>
               <option value="10">10m (보통)</option>
               <option value="20">20m (대형)</option>
               <option value="50">50m (광역)</option>
             </Select>
           </div>
           
           <div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <Label>격자 방위각 (회전)</Label>
               <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#3b82f6' }}>{formData.grid_angle}°</span>
             </div>
             <input 
               type="range" 
               min="-180" 
               max="180" 
               step="1"
               value={formData.grid_angle} 
               onChange={e => setFormData({...formData, grid_angle: e.target.value})}
               style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
             />
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                <span>-180°</span>
                <span>0° (정북)</span>
                <span>180°</span>
             </div>
           </div>

           <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              <div>
                <Label>지하 층수 (Basement)</Label>
                <Input type="number" value={formData.floors_below} onChange={e => setFormData({...formData, floors_below: e.target.value})} />
              </div>
              <div>
                <Label>지상 층수 (Floors)</Label>
                <Input type="number" value={formData.floors_above} onChange={e => setFormData({...formData, floors_above: e.target.value})} />
              </div>
           </div>
        </FormSection>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            height: '65px', borderRadius: '20px', background: '#3b82f6', color: 'white', 
            fontSize: '1.1rem', fontWeight: '800', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            boxShadow: '0 12px 24px rgba(59, 130, 246, 0.3)', marginTop: '2rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {loading ? '인프라 및 구역 자동 생성 중...' : <><Rocket size={22} /> 프로젝트 생성하기</>}
        </button>
      </form>
    </div>
  );
};

// 재사용 스타일 컴포넌트
const FormSection = ({ title, icon, children }) => (
  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      {title}
    </h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem' }}>{children}</div>
  </div>
);

const Label = ({ children, styleSplit }) => (
  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '800', color: '#475569', marginBottom: '0.75rem', ...styleSplit }}>{children}</label>
);

const Input = (props) => (
  <input {...props} style={{ width: '100%', padding: '0.9rem 1.1rem', borderRadius: '14px', border: '1.5px solid #cbd5e1', fontSize: '1rem', color: '#1e293b', boxSizing: 'border-box', background: '#fcfcfc', outline: 'none' }} />
);

const Select = (props) => (
  <select {...props} style={{ width: '100%', padding: '0.9rem 1.1rem', borderRadius: '14px', border: '1.5px solid #cbd5e1', fontSize: '1rem', color: '#1e293b', boxSizing: 'border-box', background: '#fcfcfc', cursor: 'pointer', outline: 'none' }}>{props.children}</select>
);

const ToggleButton = ({ label, onClick }) => (
  <button type="button" onClick={onClick} style={{ fontSize: '0.75rem', color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800', marginTop: '8px', textDecoration: 'underline' }}>{label}</button>
);

export default CreateProject;
