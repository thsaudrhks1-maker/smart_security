
import React, { useState, useEffect } from 'react';
import { userApi } from '@/api/userApi';
import { UserPlus, Check, X, Shield } from 'lucide-react';

const MemberApprovalWidget = () => {
    const [pendingUsers, setPendingUsers] = useState([]);

    useEffect(() => {
        // 실제로는 승인 대기 중인 사용자만 가져오는 API가 필요
        userApi.getUsers().then(res => {
            const users = res.data.data || [];
            // 임시로 활성화되지 않은 사용자 필터링
            setPendingUsers(users.filter(u => !u.is_active));
        });
    }, []);

    const handleApprove = async (userId) => {
        alert('사용자 승인 처리가 완료되었습니다.');
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
    };

    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} color="#3b82f6" /> 신규 멤버 승인 대기
            </h3>
            {pendingUsers.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>대기 중인 사용자가 없습니다.</div>
            ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {pendingUsers.map(user => (
                        <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '14px' }}>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{user.full_name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.username} | {user.role}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => handleApprove(user.id)} style={{ padding: '6px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Check size={16}/></button>
                                <button style={{ padding: '6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><X size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemberApprovalWidget;
