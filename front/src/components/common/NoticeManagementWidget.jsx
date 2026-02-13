import React, { useState, useEffect } from 'react';
import { noticeApi } from '@/api/noticeApi';
import { useAuth } from '@/context/AuthContext';
import { Bell, Send, AlertTriangle, Info, Megaphone, Trash2, Clock, ShieldAlert, CheckSquare } from 'lucide-react';

/**
 * NoticeManagementWidget: 공지사항 및 긴급 알람 작성/조회 위젯
 */
const NoticeManagementWidget = ({ projectId }) => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [noticeType, setNoticeType] = useState('NORMAL'); // NORMAL, IMPORTANT, EMERGENCY
    const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (projectId) {
            loadNotices();
        }
    }, [projectId]);

    const loadNotices = async () => {
        try {
            setLoading(true);
            const res = await noticeApi.getNotices(projectId);
            if (res.data?.success) {
                setNotices(res.data.data || []);
            }
        } catch (e) {
            console.error('공지사항 로드 실패:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        try {
            setIsSubmitting(true);
            const data = {
                project_id: projectId,
                date: noticeDate,
                title,
                content,
                notice_type: noticeType,
                notice_role: user?.role?.toUpperCase(),
                created_by: user?.id
            };

            await noticeApi.createNotice(data);
            setTitle('');
            setContent('');
            setNoticeType('NORMAL');
            loadNotices();
            alert(noticeType === 'EMERGENCY' ? '긴급 알람이 전송되었습니다!' : '공지가 등록되었습니다.');
        } catch (e) {
            console.error('공지 등록 실패:', e);
            alert('공지 등록 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section style={{ 
            background: 'rgba(30, 41, 59, 0.4)', 
            borderRadius: '24px', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)'
        }}>
            {/* Header */}
            <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '6px', borderRadius: '8px' }}>
                        <Megaphone size={18} color="#818cf8" />
                    </div>
                    <h2 style={{ fontSize: '1rem', fontWeight: '900', margin: 0, color: '#fff' }}>현장 공지 및 긴급 알림</h2>
                </div>
            </div>

            {/* Form Section */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                            value={noticeType}
                            onChange={(e) => setNoticeType(e.target.value)}
                            style={{ 
                                padding: '10px', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(15, 23, 42, 0.6)',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                color: noticeType === 'EMERGENCY' ? '#f87171' : noticeType === 'IMPORTANT' ? '#fbbf24' : '#94a3b8',
                                outline: 'none'
                            }}
                        >
                            <option value="NORMAL">일반공지</option>
                            <option value="IMPORTANT">중요공지</option>
                            <option value="EMERGENCY">🚨 긴급알람</option>
                        </select>
                        <input 
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ 
                                flex: 1, 
                                padding: '10px 15px', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(15, 23, 42, 0.6)',
                                fontSize: '0.85rem',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <textarea 
                        placeholder="전달할 내용을 입력하세요 (근로자 휴대폰으로 즉시 전송)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ 
                            height: '80px', 
                            padding: '12px 15px', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(15, 23, 42, 0.6)',
                            fontSize: '0.85rem',
                            color: '#cbd5e1',
                            resize: 'none',
                            outline: 'none',
                            lineHeight: '1.5'
                        }}
                    />
                    <button 
                        type="submit"
                        disabled={isSubmitting || !title || !content}
                        style={{ 
                            padding: '12px', 
                            background: noticeType === 'EMERGENCY' ? '#ef4444' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '900',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            boxShadow: noticeType === 'EMERGENCY' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        {isSubmitting ? '전송 중...' : (
                            <>
                                <Send size={16} /> {noticeType === 'EMERGENCY' ? '긴급 알람 일제 발송' : '공지 등록하기'}
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* List Section */}
            <div className="scroll-section" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>데이터 동기화 중...</div>
                    ) : notices.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.8rem' }}>도착한 공지가 없습니다.</div>
                    ) : notices.map(notice => (
                        <div key={notice.id} style={{ 
                            padding: '15px', 
                            borderRadius: '16px', 
                            border: '1px solid rgba(255, 255, 255, 0.03)',
                            background: notice.notice_type === 'EMERGENCY' ? 'rgba(239, 68, 68, 0.08)' : notice.notice_type === 'IMPORTANT' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(15, 23, 42, 0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Accent Line */}
                            <div style={{ 
                                position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                                background: notice.notice_type === 'EMERGENCY' ? '#ef4444' : notice.notice_type === 'IMPORTANT' ? '#f59e0b' : '#3b82f6'
                            }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ 
                                        fontSize: '0.65rem', 
                                        fontWeight: '900', 
                                        padding: '2px 8px', 
                                        borderRadius: '6px',
                                        background: notice.notice_type === 'EMERGENCY' ? '#ef4444' : notice.notice_type === 'IMPORTANT' ? '#f59e0b' : '#3b82f6',
                                        color: 'white',
                                        textTransform: 'uppercase'
                                    }}>
                                        {notice.notice_type === 'EMERGENCY' ? 'EMERGENCY' : notice.notice_type === 'IMPORTANT' ? 'IMPORTANT' : 'NOTICE'}
                                    </span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f1f5f9' }}>{notice.title}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>
                                    {new Date(notice.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '10px' }}>
                                {notice.content}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                    <Clock size={12} />
                                    <span>{notice.author_name || '관리자'} ({notice.notice_role || 'MANAGER'})</span>
                                </div>
                                <div style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: '900', 
                                    color: notice.read_count > 0 ? '#60a5fa' : '#475569',
                                    background: notice.read_count > 0 ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    padding: '3px 10px',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    border: notice.read_count > 0 ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    <CheckSquare size={12} />
                                    <span>확인: {notice.read_count || 0}명</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NoticeManagementWidget;
