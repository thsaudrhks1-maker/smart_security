
import React, { useState, useEffect } from 'react';
import { getMyAttendance } from '@/api/attendanceApi';
import { Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';

const WorkerAttendance = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getMyAttendance();
                setHistory(res.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    return (
        <div style={{ padding: '1.5rem', color: '#1e293b', paddingBottom: '100px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>🗓️ 나의 출역 기록</h1>
                <p style={{ color: '#64748b' }}>현장에 투입되어 기록된 나의 출석 리스트입니다.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>출결 데이터를 불러오는 중...</div>
            ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '24px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                    출역 기록이 존재하지 않습니다.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                   {history.map((item, idx) => (
                       <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', gap: '15px', alignItems: 'center' }}>
                           <div style={{ width: '50px', height: '50px', background: '#f0fdf4', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckCircle2 size={24} color="#10b981" />
                           </div>
                           <div style={{ flex: 1 }}>
                               <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a' }}>{item.project_name || '현장 투입'}</div>
                               <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', display: 'flex', gap: '8px' }}>
                                   <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> {new Date(item.check_in_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                   <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12}/> {item.check_in_time.split('T')[0]}</span>
                               </div>
                           </div>
                           <div style={{ padding: '6px 12px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>
                               {item.check_in_method === 'APP' ? '앱 인증' : '수동 승인'}
                           </div>
                       </div>
                   ))}
                </div>
            )}
        </div>
    );
};

export default WorkerAttendance;
