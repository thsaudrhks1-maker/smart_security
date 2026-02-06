import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { workApi } from '@/api/workApi';
import { safetyApi } from '@/api/safetyApi';
import { Plus, Trash2, Calendar, MapPin, User, AlertTriangle, X } from 'lucide-react';

const WorkList = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Data (DB Driven)
  const [templates, setTemplates] = useState([]);
  const [zones, setZones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // New Plan Input
  const [newPlan, setNewPlan] = useState({
      template_id: "",
      zone_id: "",
      site_id: 1, // Default Site ID (?„ì‹œ)
      date: new Date().toISOString().split('T')[0],
      description: "",
      equipment_flags: []
  });

  // Fetch Data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
        setLoading(true);
        const [plansData, tmplData, zoneData] = await Promise.all([
            workApi.getPlans(),
            workApi.getTemplates(),
            safetyApi.getZones()
        ]);
        setPlans(plansData);
        setTemplates(tmplData);
        setZones(zoneData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
      e.preventDefault();
      if (!newPlan.template_id || !newPlan.zone_id) {
          alert("?‘ì—… ì¢…ë¥˜?€ êµ¬ì—­??? íƒ?´ì£¼?¸ìš”.");
          return;
      }
      
      try {
          await workApi.createPlan({
              ...newPlan,
              template_id: Number(newPlan.template_id),
              zone_id: Number(newPlan.zone_id),
              allocations: [] // ?‘ì—…??ë°°ì •?€ ì¶”í›„ êµ¬í˜„
          });
          alert("?‘ì—…???±ë¡?˜ì—ˆ?µë‹ˆ??");
          setShowForm(false);
          loadAllData(); // Refresh
      } catch (err) {
          alert("?±ë¡ ?¤íŒ¨: " + (err.response?.data?.detail || err.message));
      }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("?•ë§ ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?")) return;
      try {
          await workApi.deletePlan(id);
          // UI Optimistic Update or Refresh
          setPlans(plans.filter(p => p.id !== id));
      } catch(err) {
          alert("?? œ ?¤íŒ¨");
      }
  }

  const getRiskColor = (score) => {
      if (score >= 70) return 'var(--accent-danger)';
      if (score >= 40) return 'var(--accent-warning)';
      return 'var(--success)';
  }

  if (loading) return <div style={{padding:'2rem', textAlign:'center'}}>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '1rem', maxWidth:'1200px', margin:'0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ê¸ˆì¼ ?‘ì—… ?„í™©</h2>
           <p className="text-muted">{new Date().toLocaleDateString()} Daily Work Plan</p>
        </div>
        
        {user?.role === 'manager' && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={18} />
            ?‘ì—… ?±ë¡
          </button>
        )}
      </div>

      {/* Write Form (Toggle) */}
      {showForm && (
          <div className="glass-panel animate-fade-in" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--primary-color)' }}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
                  <h3>???‘ì—… ?±ë¡</h3>
                  <button onClick={() => setShowForm(false)} className="btn-icon"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  
                  {/* ? ì§œ */}
                  <div>
                      <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.9rem'}}>? ì§œ</label>
                      <input type="date" className="input-field" 
                        value={newPlan.date} 
                        onChange={e => setNewPlan({...newPlan, date: e.target.value})} 
                      />
                  </div>

                  {/* ?‘ì—… ?œí”Œë¦?(DB ?°ë™) */}
                  <div>
                      <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.9rem'}}>?‘ì—… ì¢…ë¥˜ <span style={{color:'red'}}>*</span></label>
                      <select className="input-field" 
                        value={newPlan.template_id}
                        onChange={e => setNewPlan({...newPlan, template_id: e.target.value})}
                      >
                          <option value="">? íƒ?˜ì„¸??/option>
                          {templates.map(t => (
                              <option key={t.id} value={t.id}>
                                  {t.work_type} (?„í—˜?? {t.base_risk_score})
                              </option>
                          ))}
                      </select>
                  </div>

                  {/* êµ¬ì—­ (DB ?°ë™) */}
                  <div>
                      <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.9rem'}}>?‘ì—… êµ¬ì—­ <span style={{color:'red'}}>*</span></label>
                      <select className="input-field"
                        value={newPlan.zone_id}
                        onChange={e => setNewPlan({...newPlan, zone_id: e.target.value})}
                      >
                          <option value="">? íƒ?˜ì„¸??/option>
                          {zones.length === 0 && <option disabled>?±ë¡??êµ¬ì—­???†ìŠµ?ˆë‹¤</option>}
                          {zones.map(z => (
                              <option key={z.id} value={z.id}>{z.name} ({z.type})</option>
                          ))}
                      </select>
                  </div>

                  {/* ?¤ëª… */}
                  <div style={{gridColumn:'1/-1'}}>
                      <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.9rem'}}>?‘ì—… ?´ìš© ?ì„¸</label>
                      <input type="text" className="input-field" placeholder="?? 2ì¸?Aêµ¬ì—­ ê±°í‘¸ì§?ì¡°ë¦½ ?‘ì—…"
                        value={newPlan.description}
                        onChange={e => setNewPlan({...newPlan, description: e.target.value})}
                      />
                  </div>

                  <div style={{gridColumn:'1/-1', textAlign:'right', marginTop:'1rem'}}>
                      <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary" style={{marginRight:'0.5rem'}}>ì·¨ì†Œ</button>
                      <button type="submit" className="btn btn-primary">?±ë¡?˜ê¸°</button>
                  </div>
              </form>
          </div>
      )}

      {/* Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {plans.length === 0 && (
            <div style={{gridColumn:'1/-1', textAlign:'center', padding:'3rem', color:'var(--text-muted)'}}>
                ?±ë¡???‘ì—…???†ìŠµ?ˆë‹¤.
            </div>
        )}
        
        {plans.map(plan => (
          <div key={plan.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${getRiskColor(plan.calculated_risk_score)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom:'1rem' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{plan.work_type}</span>
                {user?.role === 'manager' && (
                    <button onClick={() => handleDelete(plan.id)} className="btn-icon" style={{ color: 'var(--text-muted)' }}><Trash2 size={16}/></button>
                )}
            </div>
            
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{plan.description || plan.work_type}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} /> {plan.zone_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <User size={16} /> {plan.allocations?.length || 0}ëª??¬ì…
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <AlertTriangle size={16} color={getRiskColor(plan.calculated_risk_score)} /> 
                     ?„í—˜?? {plan.calculated_risk_score} 
                </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {plan.allocations && plan.allocations.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {plan.allocations.map(a => (
                            <div key={a.id} style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', display:'flex', alignItems:'center', gap:'4px' }}>
                                {a.role === '?”ê¸°ê°ì‹œ' || a.role === '?€?? ? 'â­? : ''} {a.worker_name}
                            </div>
                        ))}
                    </div>
                ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>?‘ì—…??ë¯¸ë°°??/span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkList;
