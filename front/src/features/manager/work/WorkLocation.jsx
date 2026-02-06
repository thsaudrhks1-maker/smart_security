import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { ZoneSquare } from './ZoneSquareLayer';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Plus, Pencil, Map, Building2, X } from 'lucide-react';
import { getManagerDashboard } from '@/api/managerApi';
import { getProjectById, getProjectSites, updateProject } from '@/api/projectApi';
import { safetyApi } from '@/api/safetyApi';
import LocationPicker from '@/components/common/LocationPicker';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const generateLevels = (project) => {
  if (!project) return ['1F'];
  const levels = [];
  for (let i = project.basement_floors; i >= 1; i--) {
    levels.push(`B${i}`);
  }
  for (let i = 1; i <= project.ground_floors; i++) {
    levels.push(`${i}F`);
  }
  return levels;
};

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
  const [showConfig, setShowConfig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  const [configData, setConfigData] = useState({
    grid_spacing: 10,
    grid_rows: 10,
    grid_cols: 10,
    basement_floors: 0,
    ground_floors: 1
  });

  const levels = generateLevels(project);

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
        
        if (proj) {
          setConfigData({
            grid_spacing: proj.grid_spacing || 10,
            grid_rows: proj.grid_rows || 10,
            grid_cols: proj.grid_cols || 10,
            basement_floors: proj.basement_floors || 0,
            ground_floors: proj.ground_floors || 1
          });
        }

        if (siteList?.length > 0 && !siteId) {
          setSiteId(siteList[0].id);
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
    if (!formData.name.trim()) return alert('Íµ¨Ïó≠Î™ÖÏùÑ ?ÖÎ†•?¥Ï£º?∏Ïöî.');
    if (!siteId) return alert('?ÑÏû•???†ÌÉù?¥Ï£º?∏Ïöî.');
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
      alert('?Ä???§Ìå®: ' + (err.response?.data?.detail || err.message));
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

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Î°úÎî© Ï§?..</div>;
  if (!projectId || !project) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Î∞∞Ï†ï???ÑÎ°ú?ùÌä∏Í∞Ä ?ÜÏäµ?àÎã§.</div>;

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin color="#3b82f6" size={28} /> ?ëÏóÖ ?ÑÏπò ?§Ï†ï
        </h1>
        <p style={{ color: '#64748b', marginTop: '6px' }}>?ÑÎ°ú?ùÌä∏ ?ÑÏπò Í∏∞Î∞ò Í∑∏Î¶¨??Î∞?Íµ¨Ïó≠??Í¥ÄÎ¶¨Ìï©?àÎã§.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: '600', color: '#475569' }}>?ÑÎ°ú?ùÌä∏:</span>
        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold' }}>{project.name}</span>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: '600', color: '#475569' }}>?ÑÏû•</label>
        <select
          value={siteId || ''}
          onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : null)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '150px' }}
        >
          <option value="">?†ÌÉù</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {siteId && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowConfig(!showConfig)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #64748b', background: 'white', cursor: 'pointer' }}
            >
              ?ôÔ∏è {showConfig ? '?§Ï†ï ?´Í∏∞' : 'Í∑∏Î¶¨???§Ï†ï'}
            </button>
            <button
              onClick={async () => {
                if (window.confirm('Í∏∞Ï°¥ Íµ¨Ïó≠???¨ÏÉù?±Îê©?àÎã§. Í≥ÑÏÜç?òÏãúÍ≤†Ïäµ?àÍπå?')) {
                  try {
                    setLoading(true);
                    await safetyApi.generateSiteGrid(siteId);
                    const data = await safetyApi.getZones(siteId);
                    setZones(data || []);
                    alert('?ÑÎ£å?òÏóà?µÎãà??');
                  } catch (e) { alert(e.message); } finally { setLoading(false); }
                }
              }}
              style={{ padding: '8px 12px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ?îÑ Í∑∏Î¶¨???¨ÏÉù??            </button>
          </div>
        )}
      </div>

      {showConfig && project && (
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>?ìê Í∑∏Î¶¨??Î∞?Ï∏µÏàò ?§Ï†ï</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <label><span>Í≤©Ïûê Í∞ÑÍ≤©</span><input type="number" value={configData.grid_spacing} onChange={e => setConfigData({...configData, grid_spacing: parseFloat(e.target.value)})} /></label>
            <label><span>Í∞ÄÎ°?/span><input type="number" value={configData.grid_cols} onChange={e => setConfigData({...configData, grid_cols: parseInt(e.target.value)})} /></label>
            <label><span>?∏Î°ú</span><input type="number" value={configData.grid_rows} onChange={e => setConfigData({...configData, grid_rows: parseInt(e.target.value)})} /></label>
            <label><span>ÏßÄ??/span><input type="number" value={configData.basement_floors} onChange={e => setConfigData({...configData, basement_floors: parseInt(e.target.value)})} /></label>
            <label><span>ÏßÄ??/span><input type="number" value={configData.ground_floors} onChange={e => setConfigData({...configData, ground_floors: parseInt(e.target.value)})} /></label>
            <button 
              onClick={async () => {
                await updateProject(projectId, configData);
                const up = await getProjectById(projectId);
                setProject(up);
                alert('?Ä?•Îêò?àÏäµ?àÎã§.');
              }}
              style={{ padding: '10px', background: '#1e293b', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            >?Ä??/button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', overflowX: 'auto' }}>
        <button onClick={() => setSelectedLevel('ALL')} style={{ padding: '6px 12px', borderRadius: '20px', background: selectedLevel === 'ALL' ? '#1e293b' : 'white', color: selectedLevel === 'ALL' ? 'white' : '#64748b', cursor: 'pointer' }}>?ÑÏ≤¥</button>
        {levels.map(l => (
          <button key={l} onClick={() => setSelectedLevel(l)} style={{ padding: '6px 12px', borderRadius: '20px', background: selectedLevel === l ? '#1e293b' : 'white', color: selectedLevel === l ? 'white' : '#64748b', cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {siteId && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <MapOnly center={[centerLat, centerLng]} zones={filteredZones} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Íµ¨Ïó≠ Î™©Î°ù ({selectedLevel})</h2>
            <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>+ Ï∂îÍ?</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {filteredZones.map(z => (
              <div key={z.id} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>[{z.level}] {z.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{z.type}</div>
                </div>
                <button onClick={() => startEdit(z)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Pencil size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
           <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '400px' }}>
              <h3>{editingZone ? '?òÏ†ï' : 'Ï∂îÍ?'}</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input placeholder="Íµ¨Ïó≠Î™? value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ padding: '8px' }} />
                <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} style={{ padding: '8px' }}>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px' }}>?Ä??/button>
                  <button type="button" onClick={resetForm} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px' }}>Ï∑®ÏÜå</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

function MapOnly({ center, zones }) {
  return (
    <MapContainer center={center} zoom={18} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {zones.filter(z => z.lat && z.lng).map(z => <ZoneSquare key={z.id} zone={z} />)}
    </MapContainer>
  );
}
