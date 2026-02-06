
import React, { useState, useEffect } from 'react';
import apiClient from '@/api/client';
import { Bell, Megaphone, Plus, Trash2, Calendar } from 'lucide-react';

const ManagerNotice = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotices();
    }, []);

    const loadNotices = async () => {
        try {
            const res = await apiClient.get('/sys/notices');
            setNotices(res.data.data || []);
        } catch (e) {
            console.error('공지사항 로드 실패', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Megaphone size={28} color="#3b82f6" /> 현장 공지사항 관리
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>근로자들에게 전달할 중요한 안전 수칙 및 현장 소식을 게시합니다.</p>
                </div>
                <button style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> 새 공지 작성
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {notices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                        등록된 공지사항이 없습니다.
                    </div>
                ) : notices.map(notice => (
                    <div key={notice.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '800' }}>{notice.title}</h3>
                            <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.85rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {notice.created_at?.split('T')[0]}</span>
                                <span>작성자: 관리자</span>
                            </div>
                        </div>
                        <button style={{ padding: '8px', color: '#ef4444', background: '#fef2f2', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagerNotice;
