
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { workApi } from '@/api/workApi';
import { Briefcase, Calendar, MapPin, Search, ChevronRight } from 'lucide-react';

const WorkList = () => {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await workApi.getPlans({ date: today });
                // 내 ID가 배정된 작업만 필터링
                const filtered = (res || []).filter(p => p.worker_ids?.includes(user?.id));
                setPlans(filtered);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [user]);

    return (
        <div style={{ padding: '1.5rem', color: '#1e293b', paddingBottom: '100px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>💼 내 작업 목록</h1>
                <p style={{ color: '#64748b' }}>오늘 나에게 할당된 작업과 장소를 확인하세요.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>작성된 작업 계획을 불러오는 중...</div>
            ) : plans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <div style={{ fontWeight: '800', color: '#64748b', fontSize: '1.1rem', marginBottom: '8px' }}>오늘 배정된 작업이 없습니다.</div>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>관리자에게 작업 배정 여부를 문의하세요.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {plans.map(plan => (
                        <div key={plan.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#3b82f6', marginBottom: '4px', textTransform: 'uppercase' }}>{plan.work_type}</div>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '900' }}>{plan.work_type} 작업</h3>
                                <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.85rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {plan.level} {plan.location || '지정 장소'}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {plan.date}</span>
                                </div>
                            </div>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkList;
