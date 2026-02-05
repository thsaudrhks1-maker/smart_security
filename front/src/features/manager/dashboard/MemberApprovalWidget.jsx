import React, { useEffect, useState } from 'react';
import { UserCheck, CheckCircle } from 'lucide-react';
import { getProjectMembers, approveProjectMembers } from '@/api/projectApi';

const MemberApprovalWidget = ({ projectId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await getProjectMembers(projectId, 'PENDING');
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch pending members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleApprove = async (userId) => {
    if (!window.confirm('이 근로자를 승인하시겠습니까?')) return;
    
    try {
      await approveProjectMembers(projectId, [userId], 'APPROVE');
      // 목록 갱신 (Optimistic update)
      setMembers(prev => prev.filter(m => m.user_id !== userId));
    } catch (err) {
      alert('처리에 실패했습니다.');
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '1rem', color: '#64748b' }}>데이터 조회 중...</div>;
  
  if (members.length === 0) {
      return (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', minHeight: '200px' }}>
              <CheckCircle size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <p style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>승인 대기 인원이 없습니다.</p>
              <span style={{ fontSize: '0.85rem', marginTop: '4px', color: '#1e293b' }}>모든 근로자가 작업 투입 가능 상태입니다.</span>
          </div>
      );
  }

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <UserCheck size={20} color="#f59e0b" /> 
        승인 대기 인원 <span style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{members.length}</span>
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
        {members.map(member => (
          <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
            <div>
              <div style={{ fontWeight: '800', color: '#000000' }}>{member.full_name} <span style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '500' }}>({member.username})</span></div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                <span style={{ fontWeight: '600', color: '#3b82f6' }}>{member.role_name}</span> | {member.company_name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#1e293b', marginTop: '2px' }}>
                 신청일: {new Date(member.joined_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                    onClick={() => handleApprove(member.user_id)}
                    style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.target.style.background = '#2563eb'}
                    onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                >
                    승인
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberApprovalWidget;
