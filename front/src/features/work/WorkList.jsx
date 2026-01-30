import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workApi } from '../../api/workApi';
import { Plus, Trash2, Calendar, MapPin, User, AlertTriangle } from 'lucide-react';

const WorkList = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Plans
  useEffect(() => {
    fetchPlans();
  }, []); // Run once on mount

  const fetchPlans = async () => {
    try {
        // workApi.getPlans()는 response.data를 반환
        const data = await workApi.getPlans();
        setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
      if (score >= 70) return 'var(--accent-danger)';
      if (score >= 40) return 'var(--accent-warning)';
      return 'var(--success)';
  }

  const handleDelete = async (id) => {
      if(!window.confirm("정말 삭제하시겠습니까? (관련 로그와 할당 정보도 삭제됩니다)")) return;
      try {
          await workApi.deletePlan(id);
          fetchPlans(); // Refresh
      } catch(err) {
          alert("삭제 실패");
      }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>금일 작업 현황</h2>
           <p className="text-muted">Today's Work Plan</p>
        </div>
        
        {/* 관리자(manager)만 버튼 보임 */}
        {user?.role === 'manager' && (
          <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={18} />
            작업 등록
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {plans.map(plan => (
          <div key={plan.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${getRiskColor(plan.calculated_risk_score)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom:'1rem' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{plan.work_type}</span>
                {user?.role === 'manager' && (
                    <button onClick={() => handleDelete(plan.id)} className="btn-icon" style={{ color: 'var(--text-muted)' }}><Trash2 size={16}/></button>
                )}
            </div>
            
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{plan.description || "작업 내용 없음"}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} /> {plan.zone_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <User size={16} /> {plan.allocations.length}명 투입
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <AlertTriangle size={16} color={getRiskColor(plan.calculated_risk_score)} /> 
                     위험도: {plan.calculated_risk_score} 
                </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {plan.allocations.map(a => (
                        <div key={a.id} style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', display:'flex', alignItems:'center', gap:'4px' }}>
                             {a.role === '화기감시' || a.role === '팀장' ? '⭐' : ''} {a.worker_name}
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkList;
