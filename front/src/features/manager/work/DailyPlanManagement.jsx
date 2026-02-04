import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { workApi } from '../../../api/workApi';
import { getMyWorkers } from '../../../api/managerApi';
import { safetyApi } from '../../../api/safetyApi';
import { getManagerDashboard } from '../../../api/managerApi';
import { getProjectById, getProjectSites } from '../../../api/projectApi';
import apiClient from '../../../api/client';
import { Calendar, Plus, MapPin, HardHat, Users, AlertTriangle, ChevronLeft, ChevronRight, X, ShieldAlert, Trash2, Map } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const WORK_TYPE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

const RISK_TYPES = [
  { value: 'HEAVY_EQUIPMENT', label: '중장비' },
  { value: 'FIRE', label: '화재' },
  { value: 'FALL', label: '낙하물' },
  { value: 'ETC', label: '기타' },
];

const DailyPlanManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [zones, setZones] = useState([]);
  const [dangerZones, setDangerZones] = useState([]);
  const [dangerForm, setDangerForm] = useState({ zone_id: '', risk_type: 'HEAVY_EQUIPMENT', description: '' });
  const [dangerSubmitting, setDangerSubmitting] = useState(false);
  const [project, setProject] = useState(null);
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState(null);

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

  const handleAddDangerZone = async (e) => {
    e.preventDefault();
    if (!dangerForm.zone_id || !dangerForm.description.trim()) {
      alert('구역과 위험 설명을 입력해주세요.');
      return;
    }
    setDangerSubmitting(true);
    try {
      await safetyApi.createDailyDangerZone({
        date: selectedDate,
        zone_id: parseInt(dangerForm.zone_id),
        risk_type: dangerForm.risk_type,
        description: dangerForm.description.trim(),
      });
      setDangerForm({ zone_id: '', risk_type: 'HEAVY_EQUIPMENT', description: '' });
      loadDangerZones();
    } catch (err) {
      alert('등록 실패: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDangerSubmitting(false);
    }
  };

  // 날짜 이동
  const handleDateChange = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
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

          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: '#3b82f6', color: 'white', padding: '10px 20px', 
              borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' 
            }}
          >
            <Plus size={20} /> 작업 등록
          </button>
        </div>
      </div>

      {/* 오늘의 위험 구역 (작업자에게 데일리로 전달) */}
      <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fcd34d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontWeight: '700', color: '#92400e' }}>
          <ShieldAlert size={20} /> 그날 위험 구역 (날짜별)
        </div>
        <p style={{ fontSize: '0.85rem', color: '#b45309', marginBottom: '1rem' }}>
          선택한 날짜에 특정 구역에서만 발생하는 위험(중장비, 화재 등)을 등록하면 작업자 앱에 표시됩니다.
        </p>
        <form onSubmit={handleAddDangerZone} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <label style={{ minWidth: '140px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#92400e', display: 'block', marginBottom: '4px' }}>구역</span>
            <select
              value={dangerForm.zone_id}
              onChange={e => setDangerForm({ ...dangerForm, zone_id: e.target.value })}
              style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #fcd34d', width: '100%' }}
              required
            >
              <option value="">선택</option>
              {zones.map(z => <option key={z.id} value={z.id}>[{z.level}] {z.name}</option>)}
            </select>
          </label>
          <label style={{ minWidth: '100px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#92400e', display: 'block', marginBottom: '4px' }}>유형</span>
            <select
              value={dangerForm.risk_type}
              onChange={e => setDangerForm({ ...dangerForm, risk_type: e.target.value })}
              style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #fcd34d', width: '100%' }}
            >
              {RISK_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>
          <label style={{ flex: '1', minWidth: '200px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#92400e', display: 'block', marginBottom: '4px' }}>설명</span>
            <input
              type="text"
              value={dangerForm.description}
              onChange={e => setDangerForm({ ...dangerForm, description: e.target.value })}
              placeholder="예: 이동식 크레인 인양 작업 중 (접근 금지)"
              style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #fcd34d', width: '100%' }}
              required
            />
          </label>
          <button type="submit" disabled={dangerSubmitting} style={{ padding: '8px 16px', background: '#b45309', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: dangerSubmitting ? 'not-allowed' : 'pointer' }}>
            {dangerSubmitting ? '등록 중...' : '추가'}
          </button>
        </form>
        {dangerZones.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#78350f', listStyle: 'none' }}>
            {dangerZones.map(d => (
              <li key={d.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ flex: 1 }}>
                  <strong>{RISK_TYPES.find(r => r.value === d.risk_type)?.label || d.risk_type}</strong> — {d.description}
                  {zones.find(z => z.id === d.zone_id) && <span style={{ color: '#92400e' }}> (구역: {zones.find(z => z.id === d.zone_id).name})</span>}
                </span>
                <button
                  type="button"
                  onClick={async () => { if (window.confirm('이 위험 구역을 삭제할까요?')) { await safetyApi.deleteDailyDangerZone(d.id); loadDangerZones(); } }}
                  title="삭제"
                  style={{ padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={14} /> 삭제
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#a16207' }}>해당 날짜에 등록된 위험 구역이 없습니다.</div>
        )}
      </div>

      {/* 작업 구역 지도 (좌표 기반, 색깔별 작업·위험 구역 표기) */}
      {project && siteId && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontWeight: '700', color: '#334155' }}>
            <Map size={20} /> 작업 구역 지도 (날짜·현장 기준)
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
            선택한 현장의 구역 좌표로 작업 위치와 그날 위험 구역이 표시됩니다. 색상은 작업(공종)별, 빨간 마커는 위험 구역입니다.
          </p>
          <div
            style={{
              height: '320px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              background: '#f1f5f9',
            }}
            className="daily-plan-map-wrapper"
          >
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%', background: 'transparent' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={0.88}
              />
              <DailyPlanMapMarkers zones={zones} plans={filteredPlans} dangerZones={dangerZonesInSite} />
            </MapContainer>
          </div>
          <DailyPlanMapLegend plans={filteredPlans} />
        </div>
      )}

      {/* 작업 리스트 (Kanban Card Style) */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>데이터 로딩 중...</div>
        ) : filteredPlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#94a3b8' }}>
                <HardHat size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>등록된 작업 계획이 없습니다.</p>
                <p>상단의 버튼을 눌러 작업을 추가하세요.</p>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {filteredPlans.map(plan => (
                    <PlanCard key={plan.id} plan={plan} onDelete={async () => { await workApi.deletePlan(plan.id); loadPlans(); }} />
                ))}
            </div>
        )}
      </div>

      {showModal && (
        <CreatePlanModal 
            onClose={() => setShowModal(false)} 
            currDate={selectedDate}
            zones={zones}
            onSuccess={() => { setShowModal(false); loadPlans(); }} 
        />
      )}
    </div>
  );
};

// 지도: 작업 구역·위험 구역 마커 (좌표 기반, 색깔별 작업 리스트·위험 위치 표기)
function DailyPlanMapMarkers({ zones, plans, dangerZones }) {
  const zonesWithCoords = useMemo(() => zones.filter((z) => z.lat != null && z.lng != null), [zones]);
  const workTypeOrder = useMemo(() => [...new Set(plans.map((p) => p.work_type))], [plans]);

  const getWorkTypeColor = (workType) => {
    const i = workTypeOrder.indexOf(workType);
    return WORK_TYPE_COLORS[i % WORK_TYPE_COLORS.length];
  };

  const dangerIcon = L.divIcon({
    className: 'daily-plan-danger-marker',
    html: '<div style="width:24px;height:24px;border-radius:50%;background:#dc2626;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <>
      {zonesWithCoords.map((zone) => {
        const zonePlans = plans.filter((p) => p.zone_id === zone.id);
        const zoneDangers = dangerZones.filter((d) => d.zone_id === zone.id);
        const hasWork = zonePlans.length > 0;
        const hasDanger = zoneDangers.length > 0;
        if (!hasWork && !hasDanger) return null;

        const color = hasWork ? getWorkTypeColor(zonePlans[0].work_type) : '#dc2626';
        const icon = hasDanger && !hasWork
          ? dangerIcon
          : L.divIcon({
              className: 'daily-plan-zone-marker',
              html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

        return (
          <Marker key={`zone-${zone.id}`} position={[zone.lat, zone.lng]} icon={icon}>
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <strong style={{ display: 'block', marginBottom: '6px' }}>[{zone.level}] {zone.name}</strong>
                {zonePlans.length > 0 && (
                  <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span style={{ color: '#64748b' }}>작업:</span>
                    {zonePlans.map((p) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: getWorkTypeColor(p.work_type), flexShrink: 0 }} />
                        {p.work_type} (주의 {p.calculated_risk_score})
                      </div>
                    ))}
                  </div>
                )}
                {zoneDangers.length > 0 && (
                  <div style={{ fontSize: '0.85rem', color: '#b91c1c' }}>
                    <span style={{ fontWeight: '600' }}>위험 구역:</span>
                    {zoneDangers.map((d) => (
                      <div key={d.id} style={{ marginTop: '4px' }}>
                        {RISK_TYPES.find((r) => r.value === d.risk_type)?.label || d.risk_type} — {d.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

// 지도 범례 (색깔별 작업 리스트 + 위험 구역)
function DailyPlanMapLegend({ plans }) {
  const workTypes = useMemo(() => [...new Set(plans.map((p) => p.work_type))], [plans]);
  if (workTypes.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', marginTop: '10px', fontSize: '0.85rem', color: '#475569' }}>
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
    </div>
  );
}

// 개별 작업 카드 컴포넌트
const PlanCard = ({ plan, onDelete }) => {
    const riskColor = plan.calculated_risk_score >= 80 ? '#ef4444' : plan.calculated_risk_score >= 50 ? '#f59e0b' : '#22c55e';
    const riskText = plan.calculated_risk_score >= 80 ? '고위험' : plan.calculated_risk_score >= 50 ? '주의' : '양호';

    const handleDelete = () => {
        if (!window.confirm('이 작업 계획을 삭제할까요? 배정된 인원 정보도 함께 삭제됩니다.')) return;
        onDelete?.();
    };

    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: `5px solid ${riskColor}`, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ 
                    background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', 
                    fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' 
                }}>
                    <MapPin size={12} /> {plan.zone_name}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: riskColor, fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} /> {riskText} ({plan.calculated_risk_score})
                    </span>
                    {onDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            title="삭제"
                            style={{ padding: '6px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                {plan.work_type}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                {plan.description || "상세 설명이 없습니다."}
            </p>
            {plan.daily_hazards && plan.daily_hazards.length > 0 && (
                <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#b45309', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <AlertTriangle size={14} />
                    {plan.daily_hazards.map((h, i) => (
                        <span key={i} style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: '6px' }}>{h}</span>
                    ))}
                </div>
            )}

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>배정 인원</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {plan.allocations.length > 0 ? plan.allocations.map(a => (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '6px' }}>
                            <div style={{ width: '24px', height: '24px', background: '#cbd5e1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={14} color="white" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{a.worker_name}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{a.role}</span>
                            </div>
                        </div>
                    )) : (
                        <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>배정된 인원이 없습니다.</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// 작업 등록 모달 (zones 부모에서 넘기면 사용, 없으면 자체 로드)
const CreatePlanModal = ({ onClose, currDate, onSuccess, zones: zonesProp = null }) => {
    const [formData, setFormData] = useState({
        date: currDate,
        zone_id: '',
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

    useEffect(() => {
        const loadRest = async () => {
            const t = await workApi.getTemplates();
            const w = await getMyWorkers();
            setTemplates(t);
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

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', width: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>위치 + 작업 배정</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                    작업 위치(구역)와 DB 작업 목록 중 하나를 선택한 뒤, 배정할 근무자를 고르면 해당 날짜에 자동 배정됩니다.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* 날짜 */}
                    <label>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569' }}>작업일자</div>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </label>

                    {/* 작업 위치(구역) */}
                    <label>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569' }}>작업 위치 (구역)</div>
                        <select value={formData.zone_id} onChange={e => setFormData({...formData, zone_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required>
                            <option value="">선택하세요</option>
                            {zones.map(z => <option key={z.id} value={z.id}>[{z.level}] {z.name}</option>)}
                        </select>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>작업 위치 탭에서 등록한 구역입니다.</div>
                    </label>

                    {/* 작업 목록(DB) 중 1건 선택 */}
                    <label>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569' }}>작업 목록 (공종 1건 선택)</div>
                        <select value={formData.template_id} onChange={e => setFormData({...formData, template_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required>
                            <option value="">선택하세요</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.work_type} (위험도: {t.base_risk_score})</option>)}
                        </select>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>DB에 등록된 작업(공종) 목록 중 하나를 선택합니다.</div>
                    </label>

                    {/* 배정 요약 */}
                    {selectedZoneName && selectedTemplateName && (
                        <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.9rem', color: '#1e40af' }}>
                            <strong>배정 요약:</strong> 근무자 {workerCount}명에게 <strong>위치 [{selectedZoneName}]</strong> + <strong>작업 [{selectedTemplateName}]</strong> 을 배정합니다.
                        </div>
                    )}

                    {/* 내용 */}
                    <label>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569' }}>상세 내용</div>
                        <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="예: 2층 A구역 벽체 미장 작업" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </label>

                    {/* 그날 위험요소 (작업자에게 데일리로 전달) */}
                    <label>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={16} color="#f59e0b" /> 그날 위험요소
                        </div>
                        <textarea
                            value={formData.daily_hazards_text}
                            onChange={e => setFormData({ ...formData, daily_hazards_text: e.target.value })}
                            placeholder="쉼표 또는 줄바꿈으로 구분 (예: 화재위험, 낙하물 주의, 고소 작업)"
                            rows={2}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                        />
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>작업자 앱에 오늘의 주의사항으로 표시됩니다.</div>
                    </label>

                    {/* 근무자 선택: 승인 완료된 사람만 배정 가능 */}
                    <div>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569' }}>근무자 (배정 대상)</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ✓ 승인 완료된 근로자만 배정할 수 있습니다.
                        </div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                            {approvableWorkers.length === 0 ? (
                                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
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
                                                {w.full_name} <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({w.job_type})</span>
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
