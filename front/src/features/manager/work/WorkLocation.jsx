import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { ZoneSquare } from './ZoneSquareLayer';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Plus, Pencil, Map, Building2, X } from 'lucide-react';
import { getManagerDashboard } from '@/api/managerApi';
import { getProjectById, getProjectSites } from '@/api/projectApi';
import { safetyApi } from '@/api/safetyApi';
import LocationPicker from '@/components/common/LocationPicker';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ZONE_TYPES = [
  { value: 'INDOOR', label: '실내' },
  { value: 'OUTDOOR', label: '실외' },
  { value: 'ROOF', label: '옥상' },
  { value: 'PIT', label: 'PIT/지하' },
  { value: 'DANGER', label: '위험구역' },
];

const LEVELS = ['1F', '2F', '3F', 'B1', 'B2', 'ROOF'];

export default function WorkLocation() {
  const [projectId, setProjectId] = useState(null);
  const [project, setProject] = useState(null);
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '1F',
    type: 'INDOOR',
    lat: '',
    lng: '',
    default_hazards_text: '',
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  const filteredZones = selectedLevel === 'ALL' 
    ? zones 
    : zones.filter(z => z.level === selectedLevel);

  const centerLat = project?.location_lat != null ? project.location_lat : 37.5665;
  const centerLng = project?.location_lng != null ? project.location_lng : 126.978;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const dash = await getManagerDashboard();
        const pid = dash?.project_info?.id;
        if (!pid) {
          setLoading(false);
          return;
        }
        setProjectId(pid);
        const [proj, siteList] = await Promise.all([
          getProjectById(pid),
          getProjectSites(pid),
        ]);
        setProject(proj);
        setSites(siteList || []);
        if (siteList?.length > 0 && !siteId) {
          const first = siteList[0].id;
          setSiteId(first);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!siteId) {
      setZones([]);
      return;
    }
    safetyApi.getZones(siteId).then((data) => setZones(data || [])).catch(() => setZones([]));
  }, [siteId]);

  const resetForm = () => {
    setFormData({
      name: '',
      level: '1F',
      type: 'INDOOR',
      lat: '',
      lng: '',
      default_hazards_text: '',
    });
    setEditingZone(null);
    setShowForm(false);
    setShowMapPicker(false);
  };

  const handleMapPick = (lat, lng) => {
    setFormData((prev) => ({ ...prev, lat: lat != null ? String(lat) : prev.lat, lng: lng != null ? String(lng) : prev.lng }));
    setShowMapPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('구역명을 입력해주세요.');
      return;
    }
    if (!siteId) {
      alert('현장을 선택해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const default_hazards = formData.default_hazards_text
        ? formData.default_hazards_text.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
        : null;
      const payload = {
        name: formData.name.trim(),
        level: formData.level,
        type: formData.type,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        default_hazards: default_hazards && default_hazards.length ? default_hazards : null,
      };
      if (editingZone) {
        await safetyApi.updateZone(editingZone.id, payload);
      } else {
        await safetyApi.createZone({ ...payload, site_id: siteId });
      }
      resetForm();
      const data = await safetyApi.getZones(siteId);
      setZones(data || []);
    } catch (err) {
      alert('저장 실패: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (z) => {
    setEditingZone(z);
    setFormData({
      name: z.name || '',
      level: z.level || '1F',
      type: z.type || 'INDOOR',
      lat: z.lat != null ? String(z.lat) : '',
      lng: z.lng != null ? String(z.lng) : '',
      default_hazards_text: Array.isArray(z.default_hazards) ? z.default_hazards.join(', ') : '',
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        로딩 중...
      </div>
    );
  }

  if (!projectId || !project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        배정된 프로젝트가 없습니다. 관리자에게 문의하세요.
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin color="#3b82f6" size={28} /> 작업 위치 설정
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px' }}>
            프로젝트 위치 기반으로 작업 구역(층·구역명·좌표·타입)을 등록하면, 일일 작업 계획에서 근무자에게 위치·작업을 배분할 수 있습니다.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: '600', color: '#475569' }}>프로젝트</span>
        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={16} /> {project.name}
        </span>
        {project.location_address && (
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>📍 {project.location_address}</span>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: '600', color: '#475569', marginRight: '8px' }}>현장</label>
        <select
          value={siteId || ''}
          onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : null)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '200px' }}
        >
          <option value="">선택</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {siteId && (
          <button
            onClick={async () => {
              if (window.confirm('기존 그리드 구역에 덮어씌워질 수 있습니다. 프로젝트 설정 기반으로 그리드를 자동 생성하시겠습니까?')) {
                try {
                  setLoading(true);
                  await safetyApi.generateSiteGrid(siteId);
                  alert('그리드 생성이 완료되었습니다.');
                  const data = await safetyApi.getZones(siteId);
                  setZones(data || []);
                } catch (e) {
                  alert('생성 실패: ' + e.message);
                } finally {
                  setLoading(false);
                }
              }
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #3b82f6', background: 'white', color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}
          >
            🔄 그리드 자동 생성
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '8px' }}>
        <button 
          onClick={() => setSelectedLevel('ALL')}
          style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid #cbd5e1', background: selectedLevel === 'ALL' ? '#1e293b' : 'white', color: selectedLevel === 'ALL' ? 'white' : '#64748b', fontSize: '0.9rem', cursor: 'pointer' }}
        >전체</button>
        {LEVELS.map(l => (
          <button 
            key={l}
            onClick={() => setSelectedLevel(l)}
            style={{ padding: '6px 16px', borderRadius: '20px', border: '1px solid #cbd5e1', background: selectedLevel === l ? '#1e293b' : 'white', color: selectedLevel === l ? 'white' : '#64748b', fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >{l}</button>
        ))}
      </div>

      {!siteId && (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
          위에서 현장을 선택하면 지도와 구역 목록이 표시됩니다.
        </div>
      )}

      {siteId && (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Map size={18} /> 현재 프로젝트 위치 (지도)
            </div>
            <div style={{ height: '480px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <MapOnly center={[centerLat, centerLng]} zones={filteredZones} />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
              좌표: {centerLat.toFixed(5)}, {centerLng.toFixed(5)} (구역 등록 시 지도에서 클릭해 좌표를 넣을 수 있습니다)
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#334155', margin: 0 }}>작업 구역 목록 ({selectedLevel})</h2>
            <button
              type="button"
              onClick={() => { resetForm(); setShowForm(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              <Plus size={18} /> 구역 추가
            </button>
          </div>

          {filteredZones.length === 0 && !showForm && (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
              해당 층에 등록된 작업 구역이 없습니다.
            </div>
          )}

          {filteredZones.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {filteredZones.map((z) => (
                <div
                  key={z.id}
                  style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <div>
                    <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>[{z.level}] {z.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{ZONE_TYPES.find((t) => t.value === z.type)?.label || z.type}</div>
                    {(z.lat != null && z.lng != null) && (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>📍 {Number(z.lat).toFixed(5)}, {Number(z.lng).toFixed(5)}</div>
                    )}
                    {z.default_hazards?.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {z.default_hazards.map((h, i) => (
                          <span key={i} style={{ background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{h}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => startEdit(z)} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} title="수정">
                    <Pencil size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showForm && (
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: '700', marginBottom: '1rem', color: '#334155' }}>
                {editingZone ? '구역 수정' : '구역 추가'}
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                <label>
                  <span style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem' }}>구역명 *</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 1Room, A구역"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label>
                    <span style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem' }}>층</span>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem' }}>타입</span>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      {ZONE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'flex-end' }}>
                  <label>
                    <span style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem' }}>위도</span>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      placeholder="37.5665"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </label>
                  <label>
                    <span style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem' }}>경도</span>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      placeholder="126.978"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    style={{ padding: '10px 14px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    지도에서 선택
                  </button>
                </div>
                <label>
                  <span style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem' }}>고정 위험요소 (쉼표 구분)</span>
                  <input
                    type="text"
                    value={formData.default_hazards_text}
                    onChange={(e) => setFormData({ ...formData, default_hazards_text: e.target.value })}
                    placeholder="예: 추락위험, 환기불량"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={submitting} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                    {submitting ? '저장 중...' : editingZone ? '수정' : '등록'}
                  </button>
                  <button type="button" onClick={resetForm} style={{ padding: '10px 20px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          {showMapPicker && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: '700' }}>지도에서 좌표 선택</span>
                  <button type="button" onClick={() => setShowMapPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>
                <LocationPicker
                  onLocationSelect={handleMapPick}
                  initialLat={formData.lat ? parseFloat(formData.lat) : centerLat}
                  initialLng={formData.lng ? parseFloat(formData.lng) : centerLng}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MapOnly({ center, zones }) {
  const zonesWithCoords = (zones || []).filter((z) => z.lat != null && z.lng != null);
  return (
    <MapContainer center={center} zoom={15} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.20} />
      <Marker position={center} />
      {zonesWithCoords.map((z) => (
        <ZoneSquare
          key={z.id}
          zone={z}
          fillColor="#ffffff"
          fillOpacity={0.55}
          strokeColor="rgba(0,0,0,0.4)"
          strokeWidth={2}
        />
      ))}
    </MapContainer>
  );
}
