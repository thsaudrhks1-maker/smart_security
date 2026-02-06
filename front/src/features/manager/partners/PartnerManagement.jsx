import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  MoreVertical, 
  Briefcase 
} from 'lucide-react';
import { getActiveProjects, getProjectParticipants, addProjectParticipant } from '@/api/projectApi';

const PartnerManagement = () => {
  const [projectId, setProjectId] = useState(null); // ???ÑÎ°ú?ùÌä∏ ID
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ?ëÎ†•??Ï∂îÍ? Î™®Îã¨ ?ÅÌÉú
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerRole, setNewPartnerRole] = useState('PARTNER'); // PARTNER or CONSTRUCTOR

  // 1. ???ÑÎ°ú?ùÌä∏ & ?ëÎ†•??Î™©Î°ù Î°úÎî©
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. ?úÏÑ± ?ÑÎ°ú?ùÌä∏ Ï°∞Ìöå
      const projects = await getActiveProjects();
      if (projects.length > 0) {
        const myProject = projects[0];
        setProjectId(myProject.id);
        
        // 2. ?ëÎ†•??Î™©Î°ù Ï°∞Ìöå
        const parts = await getProjectParticipants(myProject.id);
        setPartners(parts);
      }
    } catch (error) {
      console.error("Failed to fetch partners:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. ?ëÎ†•??Ï∂îÍ? ?∏Îì§??
  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!newPartnerName.trim() || !projectId) return;

    try {
      await addProjectParticipant(projectId, newPartnerName, newPartnerRole);
      alert('?ëÎ†•?¨Í? ?±Î°ù?òÏóà?µÎãà??');
      setIsModalOpen(false);
      setNewPartnerName('');
      fetchData(); // Î™©Î°ù Í∞±Ïã†
    } catch (error) {
      console.error(error);
      alert('?±Î°ù Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!projectId) return <div style={{ padding: '2rem' }}>ÏßÑÌñâ Ï§ëÏù∏ ?ÑÎ°ú?ùÌä∏Í∞Ä ?ÜÏäµ?àÎã§.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ?§Îçî */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '12px' }}>
            <Briefcase size={24} color="#0284c7" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>?ëÎ†•??Í¥ÄÎ¶?/h1>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
              ?ÑÏû•??Ï∞∏Ïó¨ Ï§ëÏù∏ ?úÍ≥µ??Î∞??ëÎ†•?ÖÏ≤¥Î•?Í¥ÄÎ¶¨Ìï©?àÎã§.
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: '#0284c7', color: 'white', border: 'none', 
            padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.4)'
          }}
        >
          <Plus size={18} /> ?ëÎ†•???±Î°ù
        </button>
      </div>

      {/* Í≤Ä??Î∞??ÑÌÑ∞ (UIÎß?Ï°¥Ïû¨) */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="?ÖÏ≤¥Î™??êÎäî Í≥µÏ¢Ö Í≤Ä??.." 
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
          />
        </div>
        <select style={{ padding: '0 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569' }}>
          <option>?ÑÏ≤¥ Í≥µÏ¢Ö</option>
          <option>?ÑÍ∏∞</option>
          <option>?§ÎπÑ</option>
          <option>Ï≤†Í∑º/ÏΩòÌÅ¨Î¶¨Ìä∏</option>
        </select>
      </div>

      {/* ?ëÎ†•??Î™©Î°ù ?åÏù¥Î∏?*/}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', width: '60px', textAlign: 'center', color: '#64748b' }}>No</th>
              <th style={{ padding: '1rem', color: '#475569' }}>?ÖÏ≤¥Î™?/th>
              <th style={{ padding: '1rem', color: '#475569' }}>Ï£?Í≥µÏ¢Ö</th>
              <th style={{ padding: '1rem', color: '#475569' }}>??ï†</th>
              <th style={{ padding: '1rem', color: '#475569' }}>?åÏÜç Í∑ºÎ°ú??/th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#475569' }}>Í¥ÄÎ¶?/th>
            </tr>
          </thead>
          <tbody>
            {partners.length > 0 ? (
              partners.map((p, index) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>{index + 1}</td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{p.company_name}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>
                    <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {p.trade_type || 'ÎØ∏Ï???}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Badge role={p.role} />
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>- Î™?/td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  ?±Î°ù???ëÎ†•?¨Í? ?ÜÏäµ?àÎã§.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ?ëÎ†•???±Î°ù Î™®Îã¨ */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1e293b' }}>?ëÎ†•???±Î°ù</h2>
            
            <form onSubmit={handleAddPartner}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>?ÖÏ≤¥Î™?/label>
                <input 
                  type="text" 
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="?? Î≤àÍ∞ú?ÑÍ∏∞(Ï£?"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>??ï† Íµ¨Î∂Ñ</label>
                <select 
                  value={newPartnerRole}
                  onChange={(e) => setNewPartnerRole(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="PARTNER">?ëÎ†•??(Partner)</option>
                  <option value="CONSTRUCTOR">?úÍ≥µ??(Constructor)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', cursor: 'pointer' }}
                >
                  Ï∑®ÏÜå
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#0284c7', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  ?±Î°ù
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const Badge = ({ role }) => {
  const isConstructor = role === 'CONSTRUCTOR';
  return (
    <span style={{
      background: isConstructor ? '#dbeafe' : '#f0fdf4',
      color: isConstructor ? '#1e40af' : '#166534',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: '600'
    }}>
      {isConstructor ? '?úÍ≥µ?? : '?ëÎ†•??}
    </span>
  );
};

export default PartnerManagement;
