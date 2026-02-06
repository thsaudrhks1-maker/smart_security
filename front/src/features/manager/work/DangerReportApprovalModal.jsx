
import React, { useState } from 'react';
import { X, Check, AlertTriangle, MessageSquare } from 'lucide-react';
import apiClient from '@/api/client';

const DangerReportApprovalModal = ({ open, onClose, report, onSuccess }) => {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!open || !report) return null;

    const handleAction = async (status) => {
        setLoading(true);
        try {
            await apiClient.patch(`/safety/reports/${report.id}/status`, {
                status: status,
                manager_comment: comment
            });
            alert(status === 'APPROVED' ? '위험 신고가 승인되었습니다.' : '위험 신고가 반려되었습니다.');
            onSuccess();
            onClose();
        } catch (e) {
            console.error('상태 변경 실패', e);
            alert('중복 처리되었거나 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={24} color="#ef4444" />
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900' }}>위험 신고 검토 및 승인</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>신고 내용</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', lineHeight: 1.5 }}>{report.description}</div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', fontSize: '0.9rem', color: '#475569' }}>
                        <MessageSquare size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> 관리자 검토 의견
                    </label>
                    <textarea 
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="승인 또는 반려 사유를 입력하세요."
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '100px', outline: 'none', fontSize: '0.9rem' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => handleAction('REJECTED')}
                        disabled={loading}
                        style={{ flex: 1, padding: '1rem', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}
                    >
                        반려 처리
                    </button>
                    <button 
                        onClick={() => handleAction('APPROVED')}
                        disabled={loading}
                        style={{ flex: 1, padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Check size={20} /> 신고 승인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DangerReportApprovalModal;
