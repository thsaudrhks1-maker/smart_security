import React, { useState, useEffect } from 'react';
import { noticeApi } from '@/api/noticeApi';
import { getManagerDashboard } from '@/api/managerApi';
import { Megaphone, Plus, X, Trash2, Edit3, AlertCircle, Clock, ChevronRight } from 'lucide-react';

const ManagerNotice = () => {
  const [notices, setNotices] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', content: '', is_important: false });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const dash = await getManagerDashboard();
      const pid = dash?.project_info?.id;
      if (pid) {
        setProjectId(pid);
        const data = await noticeApi.getProjectNotices(pid);
        setNotices(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      await noticeApi.createNotice({ ...formData, project_id: projectId });
      setFormData({ title: '', content: '', is_important: false });
      setShowModal(false);
      loadInitialData();
    } catch (err) {
      alert('Í≥µÏ? ?±Î°ù ?§Ìå®');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('??†ú?òÏãúÍ≤†Ïäµ?àÍπå?')) return;
    try {
      await noticeApi.deleteNotice(id);
      loadInitialData();
    } catch (err) {
      alert('??†ú ?§Ìå®');
    }
  };

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Megaphone color="#f59e0b" size={28} /> Í≥µÏ??¨Ìï≠ Í¥ÄÎ¶?
          </h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>?ÑÏû• Í∑ºÎ°ú?êÎì§?êÍ≤å ?§ÏãúÍ∞ÑÏúºÎ°??àÏ†Ñ Í≥µÏ? Î∞??àÎÇ¥ ?¨Ìï≠???ÑÎã¨?©Îãà??</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
        >
          <Plus size={20} /> Í≥µÏ? ?ëÏÑ±
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Î°úÎî© Ï§?..</div>
        ) : notices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
            <Megaphone size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>?±Î°ù??Í≥µÏ??¨Ìï≠???ÜÏäµ?àÎã§.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notices.map(notice => (
              <div key={notice.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: notice.is_important ? '2px solid #fecaca' : '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {notice.is_important && (
                      <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>IMPORTANT</span>
                    )}
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{notice.title}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleDelete(notice.id)} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{notice.content}</p>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {new Date(notice.created_at).toLocaleDateString()}</span>
                    <span>?çÔ∏è {notice.author_name || 'Í¥ÄÎ¶¨Ïûê'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '500px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>??Í≥µÏ??¨Ìï≠ ?ëÏÑ±</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <label>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px' }}>?úÎ™©</div>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Í≥µÏ? ?úÎ™©???ÖÎ†•?òÏÑ∏??
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                  required
                />
              </label>
              <label>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px' }}>?¥Ïö©</div>
                <textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  placeholder="?ÑÎã¨?òÏã§ ?¥Ïö©???ÖÎ†•?òÏÑ∏??.."
                  rows={5}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}
                  required
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.is_important}
                  onChange={e => setFormData({...formData, is_important: e.target.checked})}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ef4444' }}>Ï§ëÏöî Í≥µÏ?Î°??§Ï†ï (?ÅÎã® Í≥†Ï†ï Î∞?Í∞ïÏ°∞)</span>
              </label>
              <button 
                type="submit"
                style={{ marginTop: '1rem', padding: '14px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                ?±Î°ù?òÍ∏∞
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerNotice;
