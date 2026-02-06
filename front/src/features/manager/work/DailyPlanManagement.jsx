import React, { useState, useEffect, useMemo } from 'react';
import ZoneStatusSidePanel from './ZoneStatusSidePanel';
import BuildingSectionView from './BuildingSectionView';
import UniversalBlueprintMap from '@/components/common/map/UniversalBlueprintMap';
import DangerReportApprovalModal from './DangerReportApprovalModal';
import 'leaflet/dist/leaflet.css';
import { workApi } from '@/api/workApi';
import { getMyWorkers } from '@/api/managerApi';
import { safetyApi } from '@/api/safetyApi';
import { getManagerDashboard } from '@/api/managerApi';
import { getProjectById, getProjectSites } from '@/api/projectApi';
import apiClient from '@/api/client';
import { Calendar, Plus, MapPin, HardHat, Users, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, X, ShieldAlert, Trash2, Map, LayoutDashboard } from 'lucide-react';

const WORK_TYPE_COLORS = ['#2563eb', '#15803d', '#d97706', '#6d28d9', '#be185d', '#0d9488', '#ea580c', '#4f46e5'];

const RISK_TYPES = [
  { value: 'HEAVY_EQUIPMENT', label: 'ì¤‘ì¥ë¹? },
  { value: 'FIRE', label: '?”ì¬' },
  { value: 'FALL', label: '?™í•˜ë¬? },
  { value: 'ETC', label: 'ê¸°í?' },
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
  const [selectedLevel, setSelectedLevel] = useState('1F');
  const [showZoneActionModal, setShowZoneActionModal] = useState(false);
  const [selectedZoneForAction, setSelectedZoneForAction] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedPendingReport, setSelectedPendingReport] = useState(null);

  const filteredZones = useMemo(() => {
    return selectedLevel === 'ALL' 
      ? zones 
      : zones.filter(z => z.level === selectedLevel);
  }, [zones, selectedLevel]);

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

  // 1. ?„ì¥ë³??„í„°ë§?(ê±´ë¬¼ ?¨ë©´???µê³„??
  const plansInSite = useMemo(() => (siteId != null ? plans.filter((p) => p.site_id === siteId) : plans), [plans, siteId]);
  const risksInSite = useMemo(() => {
    const siteZoneIds = new Set(zones.map(z => z.id));
    return dangerZones.filter(d => siteZoneIds.has(d.zone_id));
  }, [dangerZones, zones]);

  // 2. ì¸µë³„ ?„í„°ë§?(ë§?ë°??°ì¸¡ ë¦¬ìŠ¤?¸ìš©)
  const plansInLevel = useMemo(() => {
    const levelZoneIds = new Set(filteredZones.map(z => z.id));
    return plansInSite.filter(p => levelZoneIds.has(p.zone_id));
  }, [plansInSite, filteredZones]);

  const risksInLevel = useMemo(() => {
    const levelZoneIds = new Set(filteredZones.map(z => z.id));
    return risksInSite.filter(d => levelZoneIds.has(d.zone_id));
  }, [risksInSite, filteredZones]);

  const handleDateChange = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', color: '#1e293b' }}>
      <style>{globalStyles}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#000000', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar color="#3b82f6" size={28} /> ?¼ì¼ ?‘ì—… ê³„íš
          </h1>
          <p style={{ color: '#1e293b', marginTop: '5px', fontWeight: '600' }}>?‘ì—… ?„ì¹˜(êµ¬ì—­)ë¥?? íƒ??ê·¼ë¬´?ì—ê²?ë°°ì •?©ë‹ˆ??</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {sites.length > 0 && (
            <select
              value={siteId ?? ''}
              onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : null)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '160px' }}
            >
              <option value="">?„ì¥ ?„ì²´</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name || `?„ì¥ ${s.id}`}</option>
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
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HardHat size={18} color="#3b82f6" /> <strong>?„ì¥ ?‘ì—…</strong> <span style={{ color: '#3b82f6', fontWeight: '800' }}>{plansInSite.length}ê±?/span></span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={18} color="#ea580c" /> <strong>?„í—˜ êµ¬ì—­</strong> <span style={{ color: '#ea580c', fontWeight: '800' }}>{risksInSite.length}ê±?/span></span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} color="#64748b" /> <strong>ë°°ì • ?¸ì›</strong> <span style={{ color: '#475569', fontWeight: '800' }}>{plansInSite.reduce((acc, p) => acc + (p.allocations?.length ?? 0), 0)}ëª?/span></span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1rem', height: '100%', minHeight: '520px' }}>
          
          {/* [NEW] ê±´ë¬¼ ?¨ë©´??? íƒê¸?*/}
          {project && (
            <BuildingSectionView 
              project={project}
              selectedLevel={selectedLevel}
              onLevelSelect={setSelectedLevel}
              allZones={zones}
              allPlans={plansInSite}
              allRisks={risksInSite}
            />
          )}

          {project && siteId && (
            <div style={{ flex: 1, minWidth: 400, display: 'flex', flexDirection: 'column', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '520px', position: 'relative', overflow: 'hidden' }}>
                <UniversalBlueprintMap 
                  role="MANAGER"
                  zones={filteredZones}
                  plans={plansInLevel}
                  risks={risksInLevel}
                  height="100%"
                  zoom={19}
                  onZoneClick={(zone) => { 
                    // Zone??PENDING ?„í—˜???ˆëŠ”ì§€ ?•ì¸
                    const pendingDangers = risksInLevel.filter(r => r.zone_id === zone.id && r.status === 'PENDING');
                    console.log('?” [ë§¤ë‹ˆ?€] Zone ?´ë¦­:', zone.id, '| PENDING ? ê³ :', pendingDangers);
                    
                    if (pendingDangers.length > 0) {
                      // ?´ë‹¹ Zone??ëª¨ë“  PENDING ? ê³ ë¥??„ë‹¬ (?¬ì§„ ?µí•© ?œì‹œ??
                      const reportWithZone = {
                        ...pendingDangers[0], // ì²?ë²ˆì§¸ ? ê³ ??ê¸°ë³¸ ?•ë³´ ?¬ìš©
                        zoneName: zone.name,
                        zoneLevel: zone.level,
                        allPendingReports: pendingDangers // ëª¨ë“  PENDING ? ê³  ?¬í•¨
                      };
                      console.log('?” ?„ë‹¬???°ì´??', reportWithZone);
                      
                      // PENDING ?„í—˜ ???¹ì¸ ëª¨ë‹¬
                      setSelectedPendingReport(reportWithZone);
                      setShowApprovalModal(true);
                    } else {
                      // ?¼ë°˜ Zone ???‘ì—…/?„í—˜ ? íƒ ëª¨ë‹¬
                      setSelectedZoneForAction(zone); 
                      setShowZoneActionModal(true); 
                    }
                  }}
                />
                <ZoneStatusSidePanel 
                  zones={filteredZones} filteredPlans={plansInLevel} isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)}
                  expandedZoneId={expandedZoneId} setExpandedZoneId={setExpandedZoneId} WORK_TYPE_COLORS={WORK_TYPE_COLORS}
                />
                {!isSidePanelOpen && (
                  <button onClick={() => setIsSidePanelOpen(true)} style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 999, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LayoutDashboard size={14} /> ëª©ë¡ ë³´ê¸°
                  </button>
                )}
              </div>
              <DailyPlanMapLegend plans={plansInLevel} dangerZones={risksInLevel} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', background: '#f1f5f9' }}>
                <HardHat size={20} color="#3b82f6" /> <span style={{ marginLeft: '10px', fontWeight: '700' }}>?¼ì¼ ?‘ì—… ({selectedLevel})</span>
                <button onClick={() => setShowModal(true)} style={{ marginLeft: 'auto', padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Plus size={16} /></button>
              </div>
              <div style={{ padding: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                {plansInLevel.map(plan => <PlanCard key={plan.id} plan={plan} onEdit={() => setEditPlanId(plan.id)} onDelete={async () => { await workApi.deletePlan(plan.id); loadPlans(); }} />)}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', background: '#fff7ed' }}>
                <ShieldAlert size={20} color="#ea580c" /> <span style={{ marginLeft: '10px', fontWeight: '700' }}>?„í—˜ êµ¬ì—­ ({selectedLevel})</span>
                <button onClick={() => { setInitialZoneId(''); setShowDangerModal(true); }} style={{ marginLeft: 'auto', padding: '6px 12px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Plus size={16} /></button>
              </div>
              <div style={{ padding: '1rem' }}>
                {risksInLevel.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '8px', borderLeft: '4px solid #ea580c', background: '#fffaf5' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#000000' }}>{zones.find(z => z.id === d.zone_id)?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{d.description}</div>
                    </div>
                    <button onClick={async () => { if (window.confirm('?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) { await safetyApi.deleteDailyDangerZone(d.id); loadDangerZones(); } }} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showZoneActionModal && selectedZoneForAction && (
        <ZoneActionModal 
          zone={selectedZoneForAction}
          onClose={() => { setShowZoneActionModal(false); setSelectedZoneForAction(null); }}
          onSelectWorkPlan={() => {
            setInitialZoneId(selectedZoneForAction.id.toString());
            setShowZoneActionModal(false);
            setShowModal(true);
          }}
          onSelectDangerZone={() => {
            setInitialZoneId(selectedZoneForAction.id.toString());
            setShowZoneActionModal(false);
            setShowDangerModal(true);
          }}
        />
      )}
      {showModal && <CreatePlanModal onClose={() => { setShowModal(false); setInitialZoneId(''); }} currDate={selectedDate} zones={zones} initialZoneId={initialZoneId} siteId={siteId} onSuccess={() => { setShowModal(false); setInitialZoneId(''); loadPlans(); }} />}
      {showDangerModal && <DangerZoneModal selectedDate={selectedDate} zones={zones} onClose={() => { setShowDangerModal(false); setInitialZoneId(''); }} onSuccess={() => { loadDangerZones(); setShowDangerModal(false); setInitialZoneId(''); }} initialZoneId={initialZoneId} />}
      {editPlanId != null && <EditPlanModal planId={editPlanId} zones={zones} onClose={() => setEditPlanId(null)} onSuccess={() => { setEditPlanId(null); loadPlans(); }} />}
      
      {/* ê·¼ë¡œ??? ê³  ?¹ì¸ ëª¨ë‹¬ */}
      {showApprovalModal && selectedPendingReport && (
        <DangerReportApprovalModal 
          open={showApprovalModal}
          onClose={() => { setShowApprovalModal(false); setSelectedPendingReport(null); }}
          report={selectedPendingReport}
          onSuccess={() => {
            setShowApprovalModal(false);
            setSelectedPendingReport(null);
            loadDangerZones();
          }}
        />
      )}
    </div>
  );
};

const DailyPlanMapLegend = ({ plans, dangerZones }) => {
  const workTypes = [...new Set(plans.map((p) => p.work_type))];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', padding: '10px 16px', fontSize: '0.85rem', background: 'white', color: '#1e293b' }}>
      {workTypes.map((wt, i) => (
        <span key={wt} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: '600' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: WORK_TYPE_COLORS[i % WORK_TYPE_COLORS.length] }} /> {wt}
        </span>
      ))}
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: '600' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }} /> ?„í—˜ êµ¬ì—­</span>
    </div>
  );
};

const PlanCard = ({ plan, dangerZones, onEdit, onDelete }) => (
  <div style={{ background: 'white', borderRadius: '10px', padding: '1rem', marginBottom: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', color: '#1e293b' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>{plan.zone_name}</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem' }}>?˜ì •</button>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>?? œ</button>
      </div>
    </div>
    <div style={{ fontWeight: '800', marginBottom: '0.5rem', color: '#1e293b' }}>{plan.work_type}</div>
    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>{plan.description}</div>
    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {plan.allocations?.map(a => <span key={a.id} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#64748b' }}>{a.worker_name}</span>)}
    </div>
  </div>
);

const ZoneActionModal = ({ zone, onClose, onSelectWorkPlan, onSelectDangerZone }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', color: '#1e293b' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: '700' }}>êµ¬ì—­ ?¤ì •</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <MapPin size={16} style={{ display: 'inline', marginRight: '4px' }} />
          {zone.name} ({zone.level})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={onSelectWorkPlan}
            style={{ 
              padding: '1rem', 
              background: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#2563eb'}
            onMouseOut={(e) => e.target.style.background = '#3b82f6'}
          >
            <HardHat size={20} /> ?‘ì—… ë°°ì •
          </button>
          <button 
            onClick={onSelectDangerZone}
            style={{ 
              padding: '1rem', 
              background: '#ea580c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#c2410c'}
            onMouseOut={(e) => e.target.style.background = '#ea580c'}
          >
            <ShieldAlert size={20} /> ?„í—˜ êµ¬ì—­ ?±ë¡
          </button>
          <button 
            onClick={onClose}
            style={{ 
              padding: '0.75rem', 
              background: '#f1f5f9', 
              color: '#475569', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            ì·¨ì†Œ
          </button>
        </div>
      </div>
    </div>
  );
};

const DangerZoneModal = ({ selectedDate, zones, onClose, onSuccess, initialZoneId = '' }) => {
  const [form, setForm] = useState({ zone_id: initialZoneId, risk_type: 'HEAVY_EQUIPMENT', description: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await safetyApi.createDailyDangerZone({ ...form, date: selectedDate, zone_id: parseInt(form.zone_id) });
      onSuccess();
    } catch (err) { alert(err.message); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', color: '#1e293b' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>?„í—˜ êµ¬ì—­ ?±ë¡</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <select value={form.zone_id} onChange={e => setForm({ ...form, zone_id: e.target.value })} style={{ padding: '10px', color: '#1e293b', borderRadius: '6px', border: '1px solid #e2e8f0' }} required>
            <option value="">êµ¬ì—­ ? íƒ</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.name} ({z.level})</option>)}
          </select>
          <select value={form.risk_type} onChange={e => setForm({ ...form, risk_type: e.target.value })} style={{ padding: '10px', color: '#1e293b', borderRadius: '6px', border: '1px solid #e2e8f0' }} required>
            <option value="">?„í—˜ ? í˜• ? íƒ</option>
            {RISK_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
          </select>
          <input type="text" placeholder="?„í—˜ ?¤ëª… (?? ?¬ë ˆ???‘ì—… ì¤?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '10px', color: '#1e293b', borderRadius: '6px', border: '1px solid #e2e8f0' }} required />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer' }}>ì·¨ì†Œ</button>
            <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#ea580c', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}>?±ë¡</button>
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
      await workApi.updatePlan(planId, { description: form.description, allocations: form.worker_ids.map(id => ({ worker_id: id, role: '?‘ì—…?? })) });
      onSuccess();
    } catch (err) { alert(err.message); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', color: '#1e293b' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>?‘ì—… ê³„íš ?˜ì •</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '10px', color: '#1e293b' }} />
          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '8px', color: '#1e293b' }}>
            {workers.map(w => (
              <label key={w.id} style={{ display: 'block', color: '#1e293b' }}>
                <input type="checkbox" checked={form.worker_ids.includes(w.id)} onChange={e => setForm({ ...form, worker_ids: e.target.checked ? [...form.worker_ids, w.id] : form.worker_ids.filter(id => id !== w.id) })} /> {w.full_name}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px' }}>ì·¨ì†Œ</button>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none' }}>?€??/button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreatePlanModal = ({ onClose, currDate, zones, initialZoneId, onSuccess, siteId }) => {
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
      const payload = {
        site_id: siteId,
        zone_id: parseInt(form.zone_id),
        template_id: parseInt(form.template_id),
        date: form.date,
        description: form.description || '',
        equipment_flags: [],
        status: 'PLANNED',
        allocations: form.worker_ids.map(id => ({ worker_id: id, role: '?‘ì—…?? }))
      };
      await workApi.createPlan(payload);
      onSuccess();
    } catch (err) { 
      console.error('?‘ì—… ë°°ì • ?ëŸ¬:', err);
      alert(err.message || '?‘ì—… ë°°ì • ?¤íŒ¨'); 
    }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px', color: '#1e293b' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>?‘ì—… ë°°ì •</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <select value={form.zone_id} onChange={e => setForm({ ...form, zone_id: e.target.value })} style={{ padding: '10px', color: '#1e293b' }} required>
            <option value="">êµ¬ì—­ ? íƒ</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
          <select value={form.template_id} onChange={e => setForm({ ...form, template_id: e.target.value })} style={{ padding: '10px', color: '#1e293b' }} required>
            <option value="">?‘ì—… ? íƒ</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.work_type}</option>)}
          </select>
          <input type="text" placeholder="?ì„¸ ?¤ëª…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '10px', color: '#1e293b' }} />
          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '8px', color: '#1e293b' }}>
            {workers.map(w => (
              <label key={w.id} style={{ display: 'block', color: '#1e293b' }}>
                <input type="checkbox" checked={form.worker_ids.includes(w.id)} onChange={e => setForm({ ...form, worker_ids: e.target.checked ? [...form.worker_ids, w.id] : form.worker_ids.filter(id => id !== w.id) })} /> {w.full_name}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px' }}>ì·¨ì†Œ</button>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none' }}>ë°°ì •</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyPlanManagement;
