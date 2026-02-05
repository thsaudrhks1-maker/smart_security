import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Popup } from 'react-leaflet';
import { ZoneSquareStyled } from './ZoneSquareLayer';
import ZoneStatusSidePanel from './ZoneStatusSidePanel';
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

// 툴팁 배경 제거 및 투명 스크롤바 글로벌 스타일 주입 (Worker 스타일 통합)
const globalStyles = `
  .transparent-tooltip, .worker-clean-tooltip {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  .transparent-tooltip::before, .worker-clean-tooltip::before {
    display: none !important;
  }
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
  const [showWorkerLabels, setShowWorkerLabels] = useState(true);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [expandedZoneId, setExpandedZoneId] = useState(null);

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

  useEffect(() => {
    loadPlans();
  }, [selectedDate]);

  useEffect(() => {
    loadZones();
  }, [siteId]);

  useEffect(() => {
    loadDangerZones();
  }, [selectedDate]);

  const filteredPlans = useMemo(() => (siteId != null ? plans.filter((p) => p.site_id === siteId) : plans), [plans, siteId]);
  const dangerZonesInSite = useMemo(() => {
    const zoneIds = new Set(zones.map((z) => z.id));
    return dangerZones.filter((d) => zoneIds.has(d.zone_id));
  }, [dangerZones, zones]);

  const mapCenter = project?.location_lat != null && project?.location_lng != null
    ? [project.location_lat, project.location_lng]
    : [37.5665, 126.978];

  // 작업 등록 시 기본 선택할 구역 state (자식으로부터 받을 수도 있으나 CreatePlanModal에서 사용)
  const [initialZoneId, setInitialZoneId] = useState('');

  // 날짜 이동
  const handleDateChange = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <style>{globalStyles}</style>
      
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar color="#3b82f6" size={28} /> 일일 작업 계획
          </h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>작업 위치(구역)와 DB 작업 목록 중 하나를 선택해 근무자에게 배정합니다.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* 현장 선택 (지도·필터용) */}
          {sites.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
              <Map size={18} color="#64748b" />
              <span style={{ color: '#64748b', fontWeight: '600' }}>현장</span>
              <select
                value={siteId ?? ''}
                onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : null)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '160px' }}
              >
                <option value="">전체</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name || `현장 ${s.id}`}</option>
                ))}
              </select>
            </label>
          )}
          {/* 날짜 네비게이터 */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '5px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <button onClick={() => handleDateChange(-1)} style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer', color: '#64748b' }}><ChevronLeft size={20}/></button>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', fontSize: '1rem', fontWeight: '700', color: '#334155', padding: '0 10px', outline: 'none' }}
            />
            <button onClick={() => handleDateChange(1)} style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer', color: '#64748b' }}><ChevronRight size={20}/></button>
          </div>
        </div>
      </div>

      {/* 금일 요약 (작업·위험·배정 인원) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1rem', padding: '0.85rem 1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
          <HardHat size={18} color="#3b82f6" />
          <strong>현장 작업</strong> <span style={{ color: '#3b82f6', fontWeight: '800' }}>{filteredPlans.length}건</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
          <ShieldAlert size={18} color="#ea580c" />
          <strong>위험 구역</strong> <span style={{ color: '#ea580c', fontWeight: '800' }}>{dangerZonesInSite.length}건</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
          <Users size={18} color="#64748b" />
          <strong>배정 인원</strong> <span style={{ color: '#475569', fontWeight: '800' }}>{filteredPlans.reduce((acc, p) => acc + (p.allocations?.length ?? 0), 0)}명</span>
        </span>

        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
          <Users size={18} color="#64748b" />
          <strong>배정 인원</strong> <span style={{ color: '#475569', fontWeight: '800' }}>{filteredPlans.reduce((acc, p) => acc + (p.allocations?.length ?? 0), 0)}명</span>
        </span>
      </div>

      {/* 본문: 스크롤 영역 */}
      <div className="daily-plan-body-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', gap: '1.5rem', minHeight: 'min-content', paddingBottom: '1rem' }}>
          {/* 왼쪽: 지도 */}
          {project && siteId && (
            <div style={{ 
              width: '60%', 
              minWidth: 400, 
              display: 'flex', 
              flexDirection: 'column', 
              background: '#f8fafc', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              overflow: 'hidden', 
              flexShrink: 0,
              position: 'relative'
            }}>
              <div style={{ height: '420px', position: 'relative', overflow: 'hidden' }}>
                <MapContainer center={[37.5665, 126.9780]} zoom={17} style={{ height: '420px', width: '100%', background: '#f1f5f9' }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.20} />
                  <DailyPlanMapMarkers 
                    zones={zones} 
                    plans={filteredPlans} 
                    dangerZones={dangerZonesInSite} 
                    showLabels={showWorkerLabels}
                    onZoneClick={(zone) => {
                      setInitialZoneId(zone.id.toString());
                      setShowModal(true);
                    }}
                  />
                </MapContainer>

                 <ZoneStatusSidePanel 
                   zones={zones}
                   filteredPlans={filteredPlans}
                   isOpen={isSidePanelOpen}
                   onClose={() => setIsSidePanelOpen(false)}
                   expandedZoneId={expandedZoneId}
                   setExpandedZoneId={setExpandedZoneId}
                   WORK_TYPE_COLORS={WORK_TYPE_COLORS}
                 />

                {/* 패널 열기 버튼 (접혀있을 때 표시) */}
                {!isSidePanelOpen && (
                  <button 
                    onClick={() => setIsSidePanelOpen(true)}
                    style={{ 
                      position: 'absolute', top: '12px', right: '12px', zIndex: 999,
                      background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                      padding: '8px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700',
                      display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <LayoutDashboard size={14} /> 목록 보기
                  </button>
                )}
              </div>
              <DailyPlanMapLegend plans={filteredPlans} dangerZones={dangerZonesInSite} />
            </div>
          )}

          {/* 오른쪽: 일일 작업 구역 / 위험 구역 (토글) */}
          <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>
            {/* 토글: 일일 작업 구역 */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.25rem 0 0', background: '#f1f5f9', borderBottom: openWorkAreas ? '1px solid #e2e8f0' : 'none' }}>
                <button
                  type="button"
                  onClick={() => setOpenWorkAreas(!openWorkAreas)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 1.25rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '700', color: '#1e293b', textAlign: 'left' }}
                >
                  {openWorkAreas ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  <HardHat size={20} color="#3b82f6" /> 일일 작업 구역
                  <span style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>{filteredPlans.length}건</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '0.5rem', padding: '8px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <Plus size={18} /> 작업 등록
                </button>
              </div>
              {openWorkAreas && (
                <div className="daily-plan-thin-scroll" style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', maxHeight: '420px', overflowY: 'auto', overflowX: 'hidden', background: '#f8fafc' }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>로딩 중...</div>
                  ) : filteredPlans.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                      등록된 작업 계획이 없습니다. 위 <strong>작업 등록</strong> 버튼으로 추가하세요.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {filteredPlans.map(plan => (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          dangerZones={dangerZonesInSite}
                          onEdit={() => setEditPlanId(plan.id)}
                          onDelete={async () => { await workApi.deletePlan(plan.id); loadPlans(); }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 토글: 위험 구역 (날짜별) */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.25rem 0 0', background: '#fff7ed', borderBottom: openDangerZones ? '1px solid #fed7aa' : 'none' }}>
                <button
                  type="button"
                  onClick={() => setOpenDangerZones(!openDangerZones)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 1.25rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '700', color: '#9a3412', textAlign: 'left' }}
                >
                  {openDangerZones ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  <ShieldAlert size={20} color="#ea580c" /> 위험 구역 (날짜별)
                  <span style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: '600', color: '#ea580c' }}>{dangerZonesInSite.length}건</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowDangerModal(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '0.5rem', padding: '8px 14px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <Plus size={18} /> 추가
                </button>
              </div>
              {openDangerZones && (
                <div className="daily-plan-thin-scroll" style={{ padding: '1rem', background: '#fffaf5', maxHeight: '420px', overflowY: 'auto', overflowX: 'hidden' }}>
                  <p style={{ fontSize: '0.85rem', color: '#b45309', marginBottom: '1rem', paddingLeft: '4px' }}>
                    해당 날짜에 특정 구역에서 발생하는 위험입니다. 작업자 앱에 실시간 전파됩니다.
                  </p>
                  {dangerZonesInSite.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {dangerZonesInSite.map(d => {
                        const workersInThisZone = filteredPlans
                          .filter(p => p.zone_id === d.zone_id)
                          .flatMap(p => p.allocations || []);
                        
                        return (
                          <div key={d.id} style={{ 
                            background: 'white', padding: '12px', borderRadius: '10px', 
                            border: '1px solid #e2e8f0', borderLeft: '5px solid #ea580c', 
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                  <span style={{ background: '#fff1f2', color: '#e11d48', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #ffe4e6' }}>
                                    {RISK_TYPES.find(r => r.value === d.risk_type)?.label || d.risk_type}
                                  </span>
                                  <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.9rem' }}>
                                    {zones.find(z => z.id === d.zone_id)?.name || '알 수 없는 구역'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500', lineHeight: '1.4' }}>{d.description}</div>
                              </div>
                              <button 
                                type="button" 
                                onClick={async () => { if (window.confirm('삭제할까요?')) { await safetyApi.deleteDailyDangerZone(d.id); loadDangerZones(); } }} 
                                style={{ padding: '4px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                              >
                                <X size={18} />
                              </button>
                            </div>
                            
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px' }}>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                                <Users size={14} /> 진입 작업자: {workersInThisZone.length}명
                              </div>
                              {workersInThisZone.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                  {workersInThisZone.map((w, idx) => (
                                    <span key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                                      {w.worker_name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>현재 해당 구역 내 작업자 없음</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#a16207', textAlign: 'center', py: '2rem' }}>등록된 위험 구역이 없습니다.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
 {showModal && (
        <CreatePlanModal 
            onClose={() => { setShowModal(false); setInitialZoneId(''); }} 
            currDate={selectedDate}
            zones={zones}
            initialZoneId={initialZoneId}
            onSuccess={() => { setShowModal(false); setInitialZoneId(''); loadPlans(); }} 
        />
      )}

      {showDangerModal && (
        <DangerZoneModal
          selectedDate={selectedDate}
          zones={zones}
          onClose={() => setShowDangerModal(false)}
          onSuccess={() => { loadDangerZones(); setShowDangerModal(false); }}
        />
      )}

      {editPlanId != null && (
        <EditPlanModal
          planId={editPlanId}
          zones={zones}
          onClose={() => setEditPlanId(null)}
          onSuccess={() => { setEditPlanId(null); loadPlans(); }}
        />
      )}
    </div>
  );
};

// 지도: 모든 구역을 정사각형 컴포넌트로 표시
function DailyPlanMapMarkers({ zones, plans, dangerZones, onZoneClick, showLabels }) {
  const zonesWithCoords = useMemo(() => zones.filter((z) => z.lat != null && z.lng != null), [zones]);
  const workTypeOrder = useMemo(() => [...new Set(plans.map((p) => p.work_type))], [plans]);

  const getWorkTypeColor = (workType) => {
    const i = workTypeOrder.indexOf(workType);
    return WORK_TYPE_COLORS[i % WORK_TYPE_COLORS.length];
  };

  return (
    <>
      {zonesWithCoords.map((zone) => {
        const zonePlans = plans.filter((p) => p.zone_id === zone.id);
        const zoneDangers = dangerZones.filter((d) => d.zone_id === zone.id);
        const hasWork = zonePlans.length > 0;
        const hasDanger = zoneDangers.length > 0;
        const isOverlap = hasWork && hasDanger;

        const pathOptions = isOverlap
          ? { fillColor: getWorkTypeColor(zonePlans[0].work_type), fillOpacity: 0.78, color: '#dc2626', weight: 3 }
          : hasWork
            ? { fillColor: getWorkTypeColor(zonePlans[0].work_type), fillOpacity: 0.78, color: 'rgba(0,0,0,0.3)', weight: 1.5 }
            : hasDanger
              ? { fillColor: '#dc2626', fillOpacity: 0.7, color: 'rgba(0,0,0,0.3)', weight: 1.5 }
              : { fillColor: '#ffffff', fillOpacity: 0.55, color: 'rgba(0,0,0,0.25)', weight: 1.5 };

        const popupContent = (
          <div style={{ minWidth: '200px', padding: '4px' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px', fontWeight: '800', fontSize: '1rem', color: '#1e293b' }}>
              [{zone.level}] {zone.name}
            </div>
            
            {zonePlans.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '4px' }}>현장 작업</div>
                {zonePlans.map((p) => (
                  <div key={p.id} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#334155' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getWorkTypeColor(p.work_type) }} />
                      {p.work_type}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', paddingLeft: '14px' }}>
                      {p.allocations?.map(a => a.worker_name).join(', ') || '배정 인원 없음'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {zoneDangers.length > 0 && (
              <div style={{ marginBottom: '12px', background: '#fef2f2', padding: '8px', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <ShieldAlert size={14} /> 위험 구역
                </div>
                {zoneDangers.map((d) => (
                  <div key={d.id} style={{ fontSize: '0.8rem', color: '#991b1b', lineHeight: '1.4' }}>
                    • {d.description}
                  </div>
                ))}
              </div>
            )}

            {!hasWork && !hasDanger && (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '10px 0' }}>등록된 작업/위험 없음</div>
            )}

            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
               <button 
                 onClick={() => onZoneClick(zone)}
                 style={{ flex: 1, padding: '6px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
               >
                 작업/위험 추가
               </button>
            </div>
          </div>
        );

        // 상시 라벨 (배경 완전 제거 및 업체명 추가)
        const labelContent = (showLabels) ? (
            <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0px',
                pointerEvents: 'none',
                zIndex: 1000,
                textShadow: '0 0 2px white, 0 0 2px white, 0 0 2px white'
            }}>
                <div style={{ 
                    color: isOverlap ? '#ef4444' : hasWork ? getWorkTypeColor(zonePlans[0].work_type) : '#475569',
                    fontSize: '0.7rem', 
                    fontWeight: '900', 
                    marginBottom: '-2px'
                }}>
                    {zone.id}
                </div>
                <div style={{ fontSize: '0.55rem', fontWeight: '800', color: '#1e293b', opacity: 0.9 }}>
                    {zone.name}
                </div>
                {hasWork && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', justifyContent: 'center', marginTop: '1px' }}>
                        {[...new Set(zonePlans.flatMap(p => p.allocations || []).map(a => a.company_name?.slice(0,3)))].map((comp, idx) => (
                            <span key={idx} style={{ 
                                fontSize: '0.45rem', color: '#3b82f6', fontWeight: '900', 
                                background: 'rgba(255,255,255,0.6)', padding: '0 2px', borderRadius: '2px' 
                            }}>
                                {comp}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        ) : null;

        return (
            <ZoneSquareStyled 
                key={`zone-${zone.id}`} 
                zone={zone} 
                pathOptions={pathOptions} 
                popupContent={popupContent} 
                tooltipContent={labelContent}
                tooltipOptions={{ 
                    permanent: true, 
                    direction: 'center', 
                    className: 'transparent-tooltip', 
                    opacity: 1,
                    offset: [0, 0]
                }}
            />
        );
      })}
    </>
  );
}

// 지도 범례 (작업 유형 + 위험 + 겹침)
function DailyPlanMapLegend({ plans, dangerZones }) {
  const workTypes = useMemo(() => [...new Set(plans.map((p) => p.work_type))], [plans]);
  const hasOverlap = useMemo(() => {
    const zoneIdsWithWork = new Set(plans.map((p) => p.zone_id));
    return dangerZones.some((d) => zoneIdsWithWork.has(d.zone_id));
  }, [plans, dangerZones]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginTop: '10px', fontSize: '0.85rem', color: '#475569' }}>
      {workTypes.map((wt, i) => (
        <span key={wt} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: WORK_TYPE_COLORS[i % WORK_TYPE_COLORS.length] }} />
          {wt}
        </span>
      ))}
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c' }}>
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }} />
        위험 구역
      </span>
      {hasOverlap && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991b1b' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#3b82f6', border: '2px solid #dc2626', boxSizing: 'border-box' }} />
          작업+위험
        </span>
      )}
    </div>
  );
}

// 개별 작업 카드 컴포넌트
const PlanCard = ({ plan, dangerZones, onEdit, onDelete }) => {
    const riskColor = plan.calculated_risk_score >= 80 ? '#ef4444' : plan.calculated_risk_score >= 50 ? '#f59e0b' : '#22c55e';
    const riskText = plan.calculated_risk_score >= 80 ? '고위험' : plan.calculated_risk_score >= 50 ? '주의' : '양호';

    // 해당 구역에 등록된 사이트 전체 위험(DangerZone)이 있는지 확인
    const zoneDangers = (dangerZones || []).filter(d => d.zone_id === plan.zone_id);

    const handleDelete = () => {
        if (!window.confirm('이 작업 계획을 삭제할까요? 배정된 인원 정보도 함께 삭제됩니다.')) return;
        onDelete?.();
    };

    return (
        <div style={{ 
            background: 'white', borderRadius: '12px', padding: '1.25rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${riskColor}`, 
            position: 'relative', border: '1px solid #e2e8f0'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ 
                    background: '#f8fafc', color: '#64748b', padding: '4px 10px', borderRadius: '6px', 
                    fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px',
                    border: '1px solid #f1f5f9'
                }}>
                    <MapPin size={12} /> {plan.zone_name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: riskColor, fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} /> {riskText}
                    </span>
                    <div style={{ width: '1px', height: '12px', background: '#e2e8f0', margin: '0 4px' }} />
                    <button
                        type="button"
                        onClick={onEdit}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: '2px 4px' }}
                    >
                        수정
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: '2px 4px' }}
                    >
                        삭제
                    </button>
                </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                {plan.work_type}
            </h3>
            
            {/* ⚠️ 실시간 위험 구역 알림 연동 */}
            {zoneDangers.length > 0 && (
                <div style={{ 
                    background: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '8px', 
                    padding: '8px 10px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '4px'
                }}>
                    {zoneDangers.map(d => (
                        <div key={d.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#be123c', fontSize: '0.8rem', fontWeight: '700' }}>
                           <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> <span>[긴급위험] {d.description}</span>
                        </div>
                    ))}
                </div>
            )}

            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                {plan.description || "상세 설명이 없습니다."}
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>배정 인원 ({plan.allocations?.length || 0})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {plan.allocations && plan.allocations.length > 0 ? plan.allocations.map(a => (
                        <div key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '20px', height: '20px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={12} color="white" />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>{a.worker_name}</span>
                        </div>
                    )) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>배정 인원 없음</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// 위험 구역 추가 모달 (작업 등록과 동일한 패턴)
const DangerZoneModal = ({ selectedDate, zones, onClose, onSuccess }) => {
  const [form, setForm] = useState({ zone_id: '', risk_type: 'HEAVY_EQUIPMENT', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.zone_id || !form.description.trim()) {
      alert('구역과 위험 설명을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await safetyApi.createDailyDangerZone({
        date: selectedDate,
        zone_id: parseInt(form.zone_id),
        risk_type: form.risk_type,
        description: form.description.trim(),
      });
      onSuccess();
    } catch (err) {
      alert('등록 실패: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '420px', padding: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={22} color="#b45309" /> 위험 구역 추가
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={22} /></button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
          선택한 날짜({selectedDate})에 특정 구역의 위험을 등록합니다.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>구역</span>
            <select value={form.zone_id} onChange={e => setForm({ ...form, zone_id: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required>
              <option value="">선택</option>
              {zones.map(z => <option key={z.id} value={z.id}>[{z.level}] {z.name}</option>)}
            </select>
          </label>
          <label>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>유형</span>
            <select value={form.risk_type} onChange={e => setForm({ ...form, risk_type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {RISK_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>
          <label>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>설명</span>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="예: 이동식 크레인 인양 작업 중 (접근 금지)" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600' }}>취소</button>
            <button type="submit" disabled={submitting} style={{ flex: 1, padding: '10px', background: '#b45309', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? '등록 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 일일 작업 수정 모달 (안전공구 제외/추가, 상세·위험요소·배정 수정)
const EditPlanModal = ({ planId, zones, onClose, onSuccess }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templateContents, setTemplateContents] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({
    description: '',
    daily_hazards_text: '',
    excluded_resource_ids: [],
    additional_resource_ids: [],
    worker_ids: []
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [planData, contents, resources, w] = await Promise.all([
          workApi.getPlan(planId),
          workApi.getTemplatesContents(),
          workApi.getSafetyResources(),
          getMyWorkers()
        ]);
        setPlan(planData);
        setTemplateContents(Array.isArray(contents) ? contents : []);
        setAllResources(Array.isArray(resources) ? resources : []);
        setWorkers(w || []);
        setForm({
          description: planData.description || '',
          daily_hazards_text: Array.isArray(planData.daily_hazards) ? planData.daily_hazards.join('\n') : '',
          excluded_resource_ids: [...(planData.excluded_resource_ids || [])],
          additional_resource_ids: [...(planData.additional_resource_ids || [])],
          worker_ids: (planData.allocations || []).map(a => a.worker_id)
        });
      } catch (e) {
        console.error(e);
        alert('계획 정보를 불러오지 못했습니다.');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [planId, onClose]);

  const templateResourceIds = useMemo(() => {
    if (!plan) return [];
    const t = templateContents.find(c => c.id === plan.template_id);
    return (t?.required_resources || []).map(r => r.id);
  }, [plan, templateContents]);

  // 폼 상태 기준 적용 안전공구: (공정 기본 − 제외) + 추가
  const effectiveResources = useMemo(() => {
    if (!plan) return [];
    const t = templateContents.find(c => c.id === plan.template_id);
    const fromTemplate = (t?.required_resources || []).filter(r => !form.excluded_resource_ids.includes(r.id));
    const fromAdditional = form.additional_resource_ids.map(id => allResources.find(r => r.id === id)).filter(Boolean);
    return [...fromTemplate, ...fromAdditional];
  }, [plan, templateContents, form.excluded_resource_ids, form.additional_resource_ids, allResources]);

  const approvableWorkers = workers.filter(w => w.member_status === 'ACTIVE');
  const canAddResourceIds = allResources
    .map(r => r.id)
    .filter(id => !effectiveResources.some(rr => rr.id === id));

  const handleExcludeOrRemove = (resourceId) => {
    if (templateResourceIds.includes(resourceId)) {
      setForm(f => ({
        ...f,
        excluded_resource_ids: f.excluded_resource_ids.includes(resourceId)
          ? f.excluded_resource_ids.filter(x => x !== resourceId)
          : [...f.excluded_resource_ids, resourceId]
      }));
    } else {
      setForm(f => ({
        ...f,
        additional_resource_ids: f.additional_resource_ids.filter(x => x !== resourceId)
      }));
    }
  };

  const isFromTemplate = (resourceId) => templateResourceIds.includes(resourceId);

  const handleAddResource = (resourceId) => {
    if (!resourceId || form.additional_resource_ids.includes(Number(resourceId))) return;
    setForm(f => ({
      ...f,
      additional_resource_ids: [...f.additional_resource_ids, Number(resourceId)]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plan) return;
    setSubmitting(true);
    try {
      const daily_hazards = form.daily_hazards_text
        ? form.daily_hazards_text.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
        : [];
      await workApi.updatePlan(planId, {
        description: form.description || null,
        daily_hazards: daily_hazards.length ? daily_hazards : null,
        excluded_resource_ids: form.excluded_resource_ids,
        additional_resource_ids: form.additional_resource_ids,
        allocations: form.worker_ids.map(id => ({ worker_id: Number(id), role: '작업자' }))
      });
      onSuccess();
    } catch (err) {
      alert('수정 실패: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const modalLabel = { marginBottom: '5px', fontWeight: '600', color: '#1e293b' };
  const modalHint = { fontSize: '0.75rem', color: '#374151', marginTop: '4px' };
  const modalInput = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#1e293b' };

  if (loading || !plan) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', color: '#64748b' }}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '520px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', color: '#1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>일일 작업 수정</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b' }}><X size={22} /></button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
          {plan.zone_name} · {plan.work_type} (작업일: {typeof plan.date === 'string' ? plan.date : plan.date?.slice?.(0, 10) ?? ''})
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            <div style={modalLabel}>상세 내용</div>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="예: 2층 A구역 벽체 미장 작업" style={modalInput} />
          </label>
          <label>
            <div style={{ ...modalLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16} color="#f59e0b" /> 그날 위험요소</div>
            <textarea value={form.daily_hazards_text} onChange={e => setForm({ ...form, daily_hazards_text: e.target.value })} placeholder="쉼표 또는 줄바꿈으로 구분" rows={2} style={{ ...modalInput, resize: 'vertical' }} />
          </label>

          {/* 적용 안전공구: 제외/추가 */}
          <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardHat size={16} /> 이 일정 적용 안전공구 (제외·추가 가능)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {effectiveResources.map(r => (
                <span key={r.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', padding: '4px 8px', borderRadius: '6px', color: '#1e293b', fontSize: '0.85rem' }}>
                  {r.name}
                  <button type="button" onClick={() => handleExcludeOrRemove(r.id)} title={isFromTemplate(r.id) ? '공정 기본에서 제외' : '추가 항목 제거'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: '#b45309', fontSize: '1rem', lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ ...modalHint, marginBottom: '6px' }}>DB에 등록된 공구 추가:</div>
            <select value="" onChange={e => { handleAddResource(e.target.value); e.target.value = ''; }} style={{ ...modalInput, maxWidth: '100%' }}>
              <option value="">선택하여 추가</option>
              {canAddResourceIds.map(id => {
                const r = allResources.find(x => x.id === id);
                return r ? <option key={r.id} value={r.id}>{r.name}</option> : null;
              })}
            </select>
          </div>

          <div>
            <div style={modalLabel}>근무자 (배정 대상)</div>
            <div style={{ ...modalHint, marginBottom: '6px' }}>✓ 승인 완료된 근로자만 배정할 수 있습니다.</div>
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', maxHeight: '140px', overflowY: 'auto' }}>
              {approvableWorkers.length === 0 ? (
                <div style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>승인 완료된 근로자가 없습니다.</div>
              ) : (
                approvableWorkers.map(w => {
                  const isSelected = form.worker_ids.includes(w.id);
                  return (
                    <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px', borderRadius: '6px', background: isSelected ? '#eff6ff' : 'transparent', cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, worker_ids: isSelected ? f.worker_ids.filter(i => i !== w.id) : [...f.worker_ids, w.id] }))}>
                      <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer' }} />
                      <span style={{ fontSize: '0.9rem', color: '#1e293b' }}>{w.full_name} <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({w.job_type})</span></span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>취소</button>
            <button type="submit" disabled={submitting} style={{ flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 작업 등록 모달 (zones 부모에서 넘기면 사용, 없으면 자체 로드)
const CreatePlanModal = ({ onClose, currDate, onSuccess, zones: zonesProp = null, initialZoneId = '' }) => {
    const [formData, setFormData] = useState({
        date: currDate,
        zone_id: initialZoneId || '',
        template_id: '',
        description: '',
        daily_hazards_text: '',
        equipment_flags: [],
        worker_ids: []
    });

    const [zones, setZonesState] = useState(zonesProp || []);
    const [templates, setTemplates] = useState([]);
    const [workers, setWorkers] = useState([]);

    useEffect(() => {
        if (zonesProp && zonesProp.length > 0) {
            setZonesState(zonesProp);
            return;
        }
        const loadZones = async () => {
            const z = await apiClient.get('/safety/zones');
            setZonesState(z.data || []);
        };
        loadZones();
    }, [zonesProp]);

    const [templateContents, setTemplateContents] = useState([]);

    useEffect(() => {
        const loadRest = async () => {
            const [t, contents, w] = await Promise.all([
                workApi.getTemplates(),
                workApi.getTemplatesContents(),
                getMyWorkers(),
            ]);
            setTemplates(t);
            setTemplateContents(Array.isArray(contents) ? contents : []);
            setWorkers(w);
        };
        loadRest();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedZone = zones.find(z => z.id === parseInt(formData.zone_id));
        if (!selectedZone?.site_id) {
            alert('작업 위치(구역)를 선택해주세요.');
            return;
        }
        const daily_hazards = formData.daily_hazards_text
            ? formData.daily_hazards_text.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
            : [];
        const approvedIds = formData.worker_ids.filter(id =>
            workers.some(w => w.id === id && w.member_status === 'ACTIVE')
        );
        const payload = {
            site_id: selectedZone.site_id,
            zone_id: parseInt(formData.zone_id),
            template_id: parseInt(formData.template_id),
            date: formData.date,
            description: formData.description,
            daily_hazards: daily_hazards.length ? daily_hazards : null,
            equipment_flags: [],
            status: "PLANNED",
            allocations: approvedIds.map(id => ({ worker_id: parseInt(id), role: "작업자" }))
        };

        try {
            await workApi.createPlan(payload);
            onSuccess();
        } catch (err) {
            alert('등록 실패: ' + (err.response?.data?.detail || err.message));
            console.error(err);
        }
    };

    const selectedZoneName = formData.zone_id ? zones.find(z => z.id === parseInt(formData.zone_id))?.name : null;
    const selectedTemplateName = formData.template_id ? templates.find(t => t.id === parseInt(formData.template_id))?.work_type : null;
    // 이중 승인(프로젝트 멤버 승인) 완료된 근로자만 작업 배정 가능
    const approvableWorkers = workers.filter(w => w.member_status === 'ACTIVE');
    const workerCount = formData.worker_ids.filter(id => approvableWorkers.some(w => w.id === id)).length;

    const modalLabel = { marginBottom: '5px', fontWeight: '600', color: '#1e293b' };
    const modalHint = { fontSize: '0.75rem', color: '#374151', marginTop: '4px' };
    const modalInput = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#1e293b' };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', width: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', color: '#1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>위치 + 작업 배정</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b' }}><X /></button>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#1e293b', marginBottom: '1rem' }}>
                    일일 작업 구역(위치)과 작업(공종)을 선택한 뒤, 배정할 근무자를 고르면 해당 날짜에 자동 배정됩니다.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* 일일 작업 구역 · 위치 */}
                    <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>일일 작업 구역 · 위치</div>
                        <label>
                            <div style={modalLabel}>작업일자</div>
                            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={modalInput} />
                        </label>
                        <label style={{ display: 'block', marginTop: '1rem' }}>
                            <div style={modalLabel}>위치 (구역)</div>
                            <select value={formData.zone_id} onChange={e => setFormData({...formData, zone_id: e.target.value})} style={modalInput} required>
                                <option value="">선택하세요</option>
                                {zones.map(z => <option key={z.id} value={z.id}>[{z.level}] {z.name}</option>)}
                            </select>
                            <div style={modalHint}>작업 위치 탭에서 등록한 구역입니다.</div>
                        </label>
                    </div>

                    {/* 작업 (공종) */}
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>작업 (공종)</div>
                        <label>
                            <div style={modalLabel}>작업 목록 (1건 선택)</div>
                            <select value={formData.template_id} onChange={e => setFormData({...formData, template_id: e.target.value})} style={modalInput} required>
                                <option value="">선택하세요</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.work_type} (위험도: {t.base_risk_score})</option>)}
                            </select>
                            <div style={modalHint}>DB에 등록된 작업(공종) 목록 중 하나를 선택합니다.</div>
                        </label>
                    </div>

                    {/* 이 공정 필요 안전공구 (콘텐츠 기준) */}
                    {formData.template_id && (() => {
                        const content = templateContents.find(t => t.id === parseInt(formData.template_id));
                        const resources = content?.required_resources || [];
                        if (resources.length === 0) return null;
                        return (
                            <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <HardHat size={16} /> 이 공정 필요 안전공구 ({resources.length}종)
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#1e293b', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {resources.map(r => (
                                        <span key={r.id} style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: '6px', color: '#1e293b' }}>{r.name}</span>
                                    ))}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#374151', marginTop: '6px' }}>콘텐츠 열람에서 상세 안전수칙을 확인할 수 있습니다.</div>
                            </div>
                        );
                    })()}

                    {/* 배정 요약 */}
                    {selectedZoneName && selectedTemplateName && (
                        <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.9rem', color: '#1e293b' }}>
                            <strong>배정 요약:</strong> 근무자 {workerCount}명에게 <strong>위치 [{selectedZoneName}]</strong> + <strong>작업 [{selectedTemplateName}]</strong> 을 배정합니다.
                        </div>
                    )}

                    {/* 내용 */}
                    <label>
                        <div style={modalLabel}>상세 내용</div>
                        <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="예: 2층 A구역 벽체 미장 작업" style={modalInput} />
                    </label>

                    {/* 그날 위험요소 (작업자에게 데일리로 전달) */}
                    <label>
                        <div style={{ ...modalLabel, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={16} color="#f59e0b" /> 그날 위험요소
                        </div>
                        <textarea
                            value={formData.daily_hazards_text}
                            onChange={e => setFormData({ ...formData, daily_hazards_text: e.target.value })}
                            placeholder="쉼표 또는 줄바꿈으로 구분 (예: 화재위험, 낙하물 주의, 고소 작업)"
                            rows={2}
                            style={{ ...modalInput, resize: 'vertical' }}
                        />
                        <div style={modalHint}>작업자 앱에 오늘의 주의사항으로 표시됩니다.</div>
                    </label>

                    {/* 근무자 선택: 승인 완료된 사람만 배정 가능 */}
                    <div>
                        <div style={modalLabel}>근무자 (배정 대상)</div>
                        <div style={{ ...modalHint, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ✓ 승인 완료된 근로자만 배정할 수 있습니다.
                        </div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                            {approvableWorkers.length === 0 ? (
                                <div style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontSize: '0.9rem' }}>
                                    승인 완료된 근로자가 없습니다. <br />근로자 관리에서 승인을 완료한 후 배정해주세요.
                                </div>
                            ) : (
                                approvableWorkers.map(w => {
                                    const isSelected = formData.worker_ids.includes(w.id);
                                    return (
                                        <div 
                                            key={w.id} 
                                            style={{ 
                                                display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', 
                                                marginBottom: '4px',
                                                borderRadius: '6px',
                                                background: isSelected ? '#eff6ff' : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onClick={() => {
                                                const newIds = isSelected 
                                                    ? formData.worker_ids.filter(id => id !== w.id)
                                                    : [...formData.worker_ids, w.id];
                                                setFormData({...formData, worker_ids: newIds});
                                            }}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                readOnly
                                                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                            />
                                            <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? '600' : '400', color: '#1e293b' }}>
                                                {w.full_name} <span style={{ color: '#374151', fontSize: '0.85rem' }}>({w.job_type})</span>
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: '1rem', background: '#3b82f6', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                        {workerCount > 0 ? `위치+작업 배정 (${workerCount}명)` : '등록하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DailyPlanManagement;
