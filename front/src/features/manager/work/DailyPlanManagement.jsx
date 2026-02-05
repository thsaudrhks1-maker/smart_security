import React, { useState, useEffect, useMemo } from 'react';
import ZoneStatusSidePanel from './ZoneStatusSidePanel';
import UniversalBlueprintMap from '../../../components/common/map/UniversalBlueprintMap';
import 'leaflet/dist/leaflet.css';
import { workApi } from '../../../api/workApi';
import { getMyWorkers } from '../../../api/managerApi';
import { safetyApi } from '../../../api/safetyApi';
import { getManagerDashboard } from '../../../api/managerApi';
import { getProjectById, getProjectSites } from '../../../api/projectApi';
import apiClient from '../../../api/client';
import { Calendar, Plus, MapPin, HardHat, Users, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, X, ShieldAlert, Trash2, Map, LayoutDashboard } from 'lucide-react';

const WORK_TYPE_COLORS = ['#2563eb', '#15803d', '#d97706', '#6d28d9', '#be185d', '#0d9488', '#ea580c', '#4f46e5'];

const RISK_TYPES = [
  { value: 'HEAVY_EQUIPMENT', label: '중장비' },
  { value: 'FIRE', label: '화재' },
  { value: 'FALL', label: '낙하물' },
  { value: 'ETC', label: '기타' },
];

const globalStyles = `
  .thin-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .thin-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .thin-scroll::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
`;

const DailyPlanManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [zones, setZones] = useState([]);
  const [dangerZones, setDangerZones] = useState([]);
  const [project, setProject] = useState(null);
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState(null);
  const [openWorkAreas, setOpenWorkAreas] = useState(true);
  const [openDangerZones, setOpenDangerZones] = useState(true);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [editPlanId, setEditPlanId] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [expandedZoneId, setExpandedZoneId] = useState(null);
  const [initialZoneId, setInitialZoneId] = useState('');

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await workApi.getPlans({ date: selectedDate });
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadZones = async () => {
    try {
      const data = siteId != null ? await safetyApi.getZones(siteId) : await safetyApi.getZones();
      setZones(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDangerZones = async () => {
    try {
      const data = await safetyApi.getDailyDangerZones(selectedDate);
      setDangerZones(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const dash = await getManagerDashboard();
        const pid = dash?.project_info?.id;
        if (!pid) return;
        const [proj, siteList] = await Promise.all([getProjectById(pid), getProjectSites(pid)]);
        setProject(proj);
        setSites(siteList || []);
        if (siteList?.length > 0 && siteId == null) setSiteId(siteList[0].id);
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  useEffect(() => { loadPlans(); }, [selectedDate]);
  useEffect(() => { loadZones(); }, [siteId]);
  useEffect(() => { loadDangerZones(); }, [selectedDate]);

  const filteredPlans = useMemo(() => (siteId != null ? plans.filter((p) => p.site_id === siteId) : plans), [plans, siteId]);
  const dangerZonesInSite = useMemo(() => {
    const zoneIds = new Set(zones.map((z) => z.id));
    return dangerZones.filter((d) => zoneIds.has(d.zone_id));
  }, [dangerZones, zones]);

  const handleDateChange = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <style>{globalStyles}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar color="#3b82f6" size={28} /> 일일 작업 계획
          </h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>작업 위치(구역)를 선택해 근무자에게 배정합니다.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {sites.length > 0 && (
            <select
              value={siteId ?? ''}
              onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : null)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '160px' }}
            >
              <option value="">현장 전체</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name || `현장 ${s.id}`}</option>
              ))}
            </select>
          )}
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '5px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <button onClick={() => handleDateChange(-1)} style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer' }}><ChevronLeft size={20}/></button>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ border: 'none', fontSize: '1rem', fontWeight: '700', outline: 'none' }} />
            <button onClick={() => handleDateChange(1)} style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer' }}><ChevronRight size={20}/></button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1rem', padding: '0.85rem 1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HardHat size={18} color="#3b82f6" /> <strong>현장 작업</strong> <span style={{ color: '#3b82f6', fontWeight: '800' }}>{filteredPlans.length}건</span></span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={18} color="#ea580c" /> <strong>위험 구역</strong> <span style={{ color: '#ea580c', fontWeight: '800' }}>{dangerZonesInSite.length}건</span></span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} color="#64748b" /> <strong>배정 인원</strong> <span style={{ color: '#475569', fontWeight: '800' }}>{filteredPlans.reduce((acc, p) => acc + (p.allocations?.length ?? 0), 0)}명</span></span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1rem' }}>
          {project && siteId && (
            <div style={{ width: '60%', minWidth: 400, display: 'flex', flexDirection: 'column', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '420px', position: 'relative', overflow: 'hidden' }}>
                <UniversalBlueprintMap 
                  role="MANAGER"
                  zones={zones}
                  plans={filteredPlans}
                  risks={dangerZonesInSite}
                  height="420px"
                  onZoneClick={(zone) => { setInitialZoneId(zone.id.toString()); setShowModal(true); }}
                />
                <ZoneStatusSidePanel 
                  zones={zones} filteredPlans={filteredPlans} isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)}
                  expandedZoneId={expandedZoneId} setExpandedZoneId={setExpandedZoneId} WORK_TYPE_COLORS={WORK_TYPE_COLORS}
                />
                {!isSidePanelOpen && (
                  <button onClick={() => setIsSidePanelOpen(true)} style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 999, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LayoutDashboard size={14} /> 목록 보기
                  </button>
                )}
              </div>
              <DailyPlanMapLegend plans={filteredPlans} dangerZones={dangerZonesInSite} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', background: '#f1f5f9' }}>
                <HardHat size={20} color="#3b82f6" /> <span style={{ marginLeft: '10px', fontWeight: '700' }}>일일 작업 구역</span>
                <button onClick={() => setShowModal(true)} style={{ marginLeft: 'auto', padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Plus size={16} /></button>
              </div>
              <div style={{ padding: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                {filteredPlans.map(plan => <PlanCard key={plan.id} plan={plan} dangerZones={dangerZonesInSite} onEdit={() => setEditPlanId(plan.id)} onDelete={async () => { await workApi.deletePlan(plan.id); loadPlans(); }} />)}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', background: '#fff7ed' }}>
                <ShieldAlert size={20} color="#ea580c" /> <span style={{ marginLeft: '10px', fontWeight: '700' }}>위험 구역</span>
                <button onClick={() => setShowDangerModal(true)} style={{ marginLeft: 'auto', padding: '6px 12px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Plus size={16} /></button>
              </div>
              <div style={{ padding: '1rem' }}>
                {dangerZonesInSite.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '8px', borderLeft: '4px solid #ea580c', background: '#fffaf5' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{zones.find(z => z.id === d.zone_id)?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{d.description}</div>
                    </div>
                    <button onClick={async () => { if (window.confirm('삭제하시겠습니까?')) { await safetyApi.deleteDailyDangerZone(d.id); loadDangerZones(); } }} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && <CreatePlanModal onClose={() => { setShowModal(false); setInitialZoneId(''); }} currDate={selectedDate} zones={zones} initialZoneId={initialZoneId} onSuccess={() => { setShowModal(false); setInitialZoneId(''); loadPlans(); }} />}
      {showDangerModal && <DangerZoneModal selectedDate={selectedDate} zones={zones} onClose={() => setShowDangerModal(false)} onSuccess={() => { loadDangerZones(); setShowDangerModal(false); }} />}
      {editPlanId != null && <EditPlanModal planId={editPlanId} zones={zones} onClose={() => setEditPlanId(null)} onSuccess={() => { setEditPlanId(null); loadPlans(); }} />}
    </div>
  );
};

const DailyPlanMapLegend = ({ plans, dangerZones }) => {
  const workTypes = [...new Set(plans.map((p) => p.work_type))];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', padding: '10px 16px', fontSize: '0.85rem', background: 'white' }}>
      {workTypes.map((wt, i) => (
        <span key={wt} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: WORK_TYPE_COLORS[i % WORK_TYPE_COLORS.length] }} /> {wt}
        </span>
      ))}
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }} /> 위험 구역</span>
    </div>
  );
};

const PlanCard = ({ plan, dangerZones, onEdit, onDelete }) => (
  <div style={{ background: 'white', borderRadius: '10px', padding: '1rem', marginBottom: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{plan.zone_name}</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem' }}>수정</button>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>삭제</button>
      </div>
    </div>
    <div style={{ fontWeight: '800', marginBottom: '0.5rem' }}>{plan.work_type}</div>
    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{plan.description}</div>
    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {plan.allocations?.map(a => <span key={a.id} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{a.worker_name}</span>)}
    </div>
  </div>
);

const DangerZoneModal = ({ selectedDate, zones, onClose, onSuccess }) => {
  const [form, setForm] = useState({ zone_id: '', risk_type: 'HEAVY_EQUIPMENT', description: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await safetyApi.createDailyDangerZone({ ...form, date: selectedDate, zone_id: parseInt(form.zone_id) });
      onSuccess();
    } catch (err) { alert(err.message); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px' }}>
        <h3>위험 구역 등록</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <select value={form.zone_id} onChange={e => setForm({ ...form, zone_id: e.target.value })} style={{ padding: '10px' }} required>
            <option value="">구역 선택</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
          <input type="text" placeholder="위험 설명" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '10px' }} required />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px' }}>취소</button>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#ea580c', color: 'white', border: 'none' }}>등록</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditPlanModal = ({ planId, zones, onClose, onSuccess }) => {
  const [form, setForm] = useState({ description: '', worker_ids: [] });
  const [workers, setWorkers] = useState([]);
  useEffect(() => {
    const load = async () => {
      const [p, w] = await Promise.all([workApi.getPlan(planId), getMyWorkers()]);
      setForm({ description: p.description || '', worker_ids: (p.allocations || []).map(a => a.worker_id) });
      setWorkers(w || []);
    };
    load();
  }, [planId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await workApi.updatePlan(planId, { description: form.description, allocations: form.worker_ids.map(id => ({ worker_id: id, role: '작업자' })) });
      onSuccess();
    } catch (err) { alert(err.message); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px' }}>
        <h3>작업 계획 수정</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '10px' }} />
          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '8px' }}>
            {workers.map(w => (
              <label key={w.id} style={{ display: 'block' }}>
                <input type="checkbox" checked={form.worker_ids.includes(w.id)} onChange={e => setForm({ ...form, worker_ids: e.target.checked ? [...form.worker_ids, w.id] : form.worker_ids.filter(id => id !== w.id) })} /> {w.full_name}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px' }}>취소</button>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none' }}>저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreatePlanModal = ({ onClose, currDate, zones, initialZoneId, onSuccess }) => {
  const [form, setForm] = useState({ date: currDate, zone_id: initialZoneId || '', template_id: '', description: '', worker_ids: [] });
  const [templates, setTemplates] = useState([]);
  const [workers, setWorkers] = useState([]);
  useEffect(() => {
    const load = async () => {
      const [t, w] = await Promise.all([workApi.getTemplates(), getMyWorkers()]);
      setTemplates(t);
      setWorkers(w);
    };
    load();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await workApi.createPlan({ ...form, zone_id: parseInt(form.zone_id), template_id: parseInt(form.template_id), allocations: form.worker_ids.map(id => ({ worker_id: id, role: '작업자' })) });
      onSuccess();
    } catch (err) { alert(err.message); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px' }}>
        <h3>작업 배정</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <select value={form.zone_id} onChange={e => setForm({ ...form, zone_id: e.target.value })} style={{ padding: '10px' }} required>
            <option value="">구역 선택</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
          <select value={form.template_id} onChange={e => setForm({ ...form, template_id: e.target.value })} style={{ padding: '10px' }} required>
            <option value="">작업 선택</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.work_type}</option>)}
          </select>
          <input type="text" placeholder="상세 설명" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '10px' }} />
          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '8px' }}>
            {workers.map(w => (
              <label key={w.id} style={{ display: 'block' }}>
                <input type="checkbox" checked={form.worker_ids.includes(w.id)} onChange={e => setForm({ ...form, worker_ids: e.target.checked ? [...form.worker_ids, w.id] : form.worker_ids.filter(id => id !== w.id) })} /> {w.full_name}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px' }}>취소</button>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none' }}>배정</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyPlanManagement;
