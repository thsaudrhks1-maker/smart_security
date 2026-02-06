
import React from 'react';
import { Users, Clock } from 'lucide-react';

const AttendanceListWidget = ({ attendance = [] }) => {
    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#6366f1" /> 실시간 출역 현황
            </h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gap: '10px' }}>
                {attendance.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>금일 출역 인원이 없습니다.</div>
                ) : (
                    attendance.map((at, idx) => (
                        <div key={idx} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ fontWeight: '700' }}>{at.user_name}</span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{at.company_name}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={14} /> {new Date(at.check_in_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AttendanceListWidget;
