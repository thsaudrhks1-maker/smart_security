
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '@/api/projectApi';
import { companyApi } from '@/api/companyApi';
import { userApi } from '@/api/userApi';
import { 
  Building2, Users, MapPin, Calendar, Grid, 
  ArrowLeft, Rocket, Plus, ShieldCheck, Map as MapIcon, 
  Layers, ChevronDown, CheckCircle2, UserCheck, Wrench
} from 'lucide-react';

import LocationPicker from '@/components/common/LocationPicker';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [safetyManagerOptions, setSafetyManagerOptions] = useState([]);
  
  // 오늘 날짜와 6개월 후 날짜 계산
  const today = new Date();
  const sixMonthsLater = new Date(today);
  sixMonthsLater.setMonth(today.getMonth() + 6);
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // 폼 상태 (초기값 설정)
  const [formData, setFormData] = useState({
    name: '강남 테헤란로 데이터센터 신축공사',
    budget: '50000000',
    client_id: '',
    constructor_id: '',
    manager_id: '',
    safety_manager_id: '',
    location_address: '',
    lat: 37.5665,
    lng: 126.9780,
    start_date: formatDate(today),
    end_date: formatDate(sixMonthsLater),
    grid_cols: 5,
    grid_rows: 5,
    grid_spacing: 10,
    floors_above: 1,
    floors_below: 0
  });

  // 직접 입력 모드
  const [directInput, setDirectInput] = useState({ client: false, constructor: false });
  const [newCompany, setNewCompany] = useState({ client: '', constructor: '' });

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await companyApi.getCompanies();
        const all = res.data.data || [];
        setClients(all.filter(c => c.type === 'CLIENT'));
        setConstructors(all.filter(c => c.type === 'CONSTRUCTOR'));
      } catch (e) { console.error('업체 로드 실패', e); }
    };
    loadCompanies();
  }, []);

  // 시공사 선택 시 해당 회사 소속 관리자들만 필터링해서 가져옴
  useEffect(() => {
    if (formData.constructor_id && !directInput.constructor) {
      const loadUsers = async () => {
        try {
          const res = await userApi.getUsersByCompany(formData.constructor_id);
          const users = res.data.data || [];
          // 역할별로 분리해서 보여줄 수도 있지만, 여기서는 소속 인원 전체를 보여줌
          setManagerOptions(users.filter(u => u.role === 'manager' || u.role === 'admin'));
          setSafetyManagerOptions(users.filter(u => u.role === 'manager' || u.role === 'admin'));
        } catch (e) { console.error('사용자 로드 실패', e); }
      };
      loadUsers();
    } else {
      setManagerOptions([]);
      setSafetyManagerOptions([]);
    }
  }, [formData.constructor_id, directInput.constructor]);

  // LocationPicker에서 위치 선택 시 호출
  const handleLocationSelect = (lat, lng, address) => {
    setFormData(prev => ({
      ...prev,
      lat,
      lng,
      location_address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)} (선택된 좌표)`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalData = { ...formData };

      // 직접 입력한 업체가 있다면 먼저 생성
      if (directInput.client && newCompany.client) {
        const res = await companyApi.createCompany({ name: newCompany.client, type: 'CLIENT', trade_type: '민간' });
        finalData.client_id = res.data.data.id;
      }
      if (directInput.constructor && newCompany.constructor) {
        const res = await companyApi.createCompany({ name: newCompany.constructor, type: 'CONSTRUCTOR', trade_type: '종합건설' });
        finalData.constructor_id = res.data.data.id;
      }

      const res = await projectApi.createProject(finalData);
      if (res.data.success) {
        alert('프로젝트가 생성되었습니다. 구역(Zone)이 자동 생성되었습니다!');
        navigate('/admin/dashboard');
      }
    } catch (e) {
      alert('생성 실패: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#1e293b' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', color: '#64748b', fontWeight: '700', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> 이전으로
      </button>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '16px' }}>
            <Building2 size={32} color="#3b82f6" />
          </div>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>새 프로젝트 등록</h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>스마트 안전 시스템을 적용할 새로운 현장을 개설합니다.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Section 1: 기본 정보 */}
        <FormSection title="프로젝트 기본 정보" icon={<Wrench size={18} color="#3b82f6"/>}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Label>프로젝트 명 *</Label>
            <Input 
              placeholder="예: 강남 테헤란로 데이터센터 신축공사" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
          <div>
            <Label>공사 유형</Label>
            <Select>
              <option>건축 (Architecture)</option>
              <option>토목 (Civil)</option>
              <option>플랜트 (Plant)</option>
            </Select>
          </div>
          <div>
            <Label>예산 (원)</Label>
            <Input 
              type="number" 
              placeholder="50000000" 
              value={formData.budget} 
              onChange={e => setFormData({...formData, budget: e.target.value})}
            />
          </div>
        </FormSection>

        {/* Section 2: 발주처 및 시공사 */}
        <FormSection title="발주처 및 시공사" icon={<Building2 size={18} color="#f59e0b"/>}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Label>발주처 (Client)</Label>
              <button 
                type="button" 
                onClick={() => setDirectInput({...directInput, client: !directInput.client})}
                style={{ fontSize: '0.75rem', color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '700' }}
              >
                {directInput.client ? '목록에서 선택' : '+ 직접 등록'}
              </button>
            </div>
            {directInput.client ? (
              <Input placeholder="발주처 회사명 입력" value={newCompany.client} onChange={e => setNewCompany({...newCompany, client: e.target.value})} />
            ) : (
              <Select value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                <option value="">업체 선택</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Label>시공사 (Constructor)</Label>
              <button 
                type="button" 
                onClick={() => setDirectInput({...directInput, constructor: !directInput.constructor})}
                style={{ fontSize: '0.75rem', color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '700' }}
              >
                {directInput.constructor ? '목록에서 선택' : '+ 직접 등록'}
              </button>
            </div>
            {directInput.constructor ? (
              <Input placeholder="시공사 회사명 입력" value={newCompany.constructor} onChange={e => setNewCompany({...newCompany, constructor: e.target.value})} />
            ) : (
              <Select value={formData.constructor_id} onChange={e => setFormData({...formData, constructor_id: e.target.value})}>
                <option value="">업체 선택</option>
                {constructors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            )}
          </div>
        </FormSection>

        {/* Section 3: 현장 핵심 인력 배정 */}
        <div style={{ background: '#f8fafc', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
           <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '32px', height: '32px', background: '#ecfdf5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Users size={18} color="#10b981" />
             </div>
             현장 핵심 인력 배정
           </h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
             <div>
               <Label style={{ color: '#1e40af' }}>현장소장 (Manager)</Label>
               <Select value={formData.manager_id} onChange={e => setFormData({...formData, manager_id: e.target.value})} disabled={directInput.constructor}>
                 <option value="">(인원 선택)</option>
                 {managerOptions.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.username})</option>)}
               </Select>
               {!directInput.constructor && managerOptions.length === 0 && <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>시공사를 먼저 선택해 주세요.</p>}
             </div>
             <div>
               <Label style={{ color: '#15803d' }}>안전관리자 (Safety Manager)</Label>
               <Select value={formData.safety_manager_id} onChange={e => setFormData({...formData, safety_manager_id: e.target.value})} disabled={directInput.constructor}>
                 <option value="">(인원 선택)</option>
                 {safetyManagerOptions.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.username})</option>)}
               </Select>
               {!directInput.constructor && safetyManagerOptions.length === 0 && <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>시공사를 먼저 선택해 주세요.</p>}
             </div>
           </div>
        </div>

        {/* Section 4: 위치 및 기간 */}
        <FormSection title="위치 및 기간" icon={<MapPin size={18} color="#ef4444" />}>
          <div style={{ gridColumn: '1/-1' }}>
            <Label>현장 위치 및 그리드 미리보기</Label>
            <LocationPicker 
              onLocationSelect={handleLocationSelect}
              initialLat={formData.lat}
              initialLng={formData.lng}
              gridConfig={{
                grid_rows: parseInt(formData.grid_rows) || 5,
                grid_cols: parseInt(formData.grid_cols) || 5,
                grid_spacing: parseInt(formData.grid_spacing) || 10
              }}
            />
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: '700', margin: 0 }}>
                <MapIcon size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                선택된 주소: {formData.location_address || '지도를 클릭하거나 주소를 검색하세요'}
              </p>
            </div>
          </div>
          <div>
            <Label>착공일</Label>
            <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
          </div>
          <div>
            <Label>준공 예정일</Label>
            <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
          </div>
        </FormSection>

        {/* Section 5: 프로젝트 그리드 및 층수 설정 */}
        <FormSection title="프로젝트 그리드 및 층수 설정" icon={<Grid size={18} color="#6366f1" />}>
           <p style={{ gridColumn: '1 / -1', color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
             현장을 바둑판 모양의 격자(Grid)로 구분하여 작업 위치를 할당하고 위험 구역을 관리합니다. 설정값에 따라 구역(Zone)이 자동 생성됩니다.
           </p>
           <div>
             <Label>가로 칸 수 (Cols)</Label>
             <Input type="number" value={formData.grid_cols} onChange={e => setFormData({...formData, grid_cols: e.target.value})} />
           </div>
           <div>
             <Label>세로 칸 수 (Rows)</Label>
             <Input type="number" value={formData.grid_rows} onChange={e => setFormData({...formData, grid_rows: e.target.value})} />
           </div>
           <div>
             <Label>격자 간격 (미터)</Label>
             <Select value={formData.grid_spacing} onChange={e => setFormData({...formData, grid_spacing: e.target.value})}>
               <option value="5">5m (정밀)</option>
               <option value="10">10m (보통)</option>
               <option value="20">20m (대형)</option>
             </Select>
           </div>
           <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              <div>
                <Label>지하 층수</Label>
                <Input type="number" value={formData.floors_below} onChange={e => setFormData({...formData, floors_below: e.target.value})} />
              </div>
              <div>
                <Label>지상 층수</Label>
                <Input type="number" value={formData.floors_above} onChange={e => setFormData({...formData, floors_above: e.target.value})} />
              </div>
           </div>
        </FormSection>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            height: '60px', borderRadius: '16px', background: '#3b82f6', color: 'white', 
            fontSize: '1.1rem', fontWeight: '800', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)', marginTop: '2rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {loading ? '프로젝트 초기화 및 생성 중...' : <><Rocket size={20} /> 프로젝트 생성</>}
        </button>
      </form>
    </div>
  );
};

// Internal Styled Components
const FormSection = ({ title, icon, children }) => (
  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      {title}
    </h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem' }}>
      {children}
    </div>
  </div>
);

const Label = ({ children, style }) => (
  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '800', color: '#475569', marginBottom: '0.75rem', ...style }}>{children}</label>
);

const Input = (props) => (
  <input 
    {...props} 
    style={{ 
      width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', 
      fontSize: '1rem', color: '#1e293b', boxSizing: 'border-box', background: '#fcfcfc',
      outline: 'none', transition: 'border-color 0.2s'
    }} 
    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
  />
);

const Select = (props) => (
  <select 
    {...props} 
    style={{ 
      width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', 
      fontSize: '1rem', color: '#1e293b', boxSizing: 'border-box', background: '#fcfcfc',
      cursor: 'pointer', outline: 'none'
    }}
  >
    {props.children}
  </select>
);

export default CreateProject;
