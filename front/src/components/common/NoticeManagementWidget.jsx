import React, { useState, useEffect } from 'react';
import { noticeApi } from '@/api/noticeApi';
import { useAuth } from '@/context/AuthContext';
import { Bell, Send, AlertTriangle, Info, Megaphone, Trash2, Clock, ShieldAlert } from 'lucide-react';

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
            if (res.data) {
                setNotices(res.data || []);
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
            background: 'white', 
            borderRadius: '20px', 
            border: '1px solid #e2e8f0', 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
        }}>
            {/* Header / Tabs */}
            <div style={{ padding: '1.2rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1' }}>
                    <Megaphone size={20} />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>현장 공지 및 긴급 알림</h2>
                </div>
            </div>

            {/* Form Section */}
            <div style={{ padding: '1.2rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                            value={noticeType}
                            onChange={(e) => setNoticeType(e.target.value)}
                            style={{ 
                                padding: '8px', 
                                borderRadius: '8px', 
                                border: '1px solid #e2e8f0',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                color: noticeType === 'EMERGENCY' ? '#dc2626' : noticeType === 'IMPORTANT' ? '#f59e0b' : '#475569',
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
                                padding: '8px 12px', 
                                borderRadius: '8px', 
                                border: '1px solid #e2e8f0',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <textarea 
                        placeholder="전달할 내용을 입력하세요 (근로자 휴대폰으로 즉시 전송)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ 
                            height: '60px', 
                            padding: '10px 12px', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0',
                            fontSize: '0.85rem',
                            resize: 'none',
                            outline: 'none'
                        }}
                    />
                    <button 
                        type="submit"
                        disabled={isSubmitting || !title || !content}
                        style={{ 
                            padding: '10px', 
                            background: noticeType === 'EMERGENCY' ? '#dc2626' : '#0f172a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'opacity 0.2s'
                        }}
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>로드 중...</div>
                    ) : notices.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>최근 공지 내역이 없습니다.</div>
                    ) : notices.map(notice => (
                        <div key={notice.id} style={{ 
                            padding: '12px', 
                            borderRadius: '12px', 
                            border: `1.5px solid ${notice.notice_type === 'EMERGENCY' ? '#fca5a5' : notice.notice_type === 'IMPORTANT' ? '#fde68a' : '#f1f5f9'}`,
                            background: notice.notice_type === 'EMERGENCY' ? '#fef2f2' : notice.notice_type === 'IMPORTANT' ? '#fffbeb' : 'white'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {notice.notice_type === 'EMERGENCY' ? <ShieldAlert size={16} color="#dc2626" /> : notice.notice_type === 'IMPORTANT' ? <AlertTriangle size={16} color="#f59e0b" /> : <Info size={16} color="#3b82f6" />}
                                    <span style={{ 
                                        fontSize: '0.7rem', 
                                        fontWeight: '900', 
                                        padding: '2px 6px', 
                                        borderRadius: '4px',
                                        background: notice.notice_type === 'EMERGENCY' ? '#dc2626' : notice.notice_type === 'IMPORTANT' ? '#f59e0b' : '#3b82f6',
                                        color: 'white'
                                    }}>
                                        {notice.notice_type === 'EMERGENCY' ? '긴급' : notice.notice_type === 'IMPORTANT' ? '중요' : '공지'}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>{notice.title}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                    {new Date(notice.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4', marginBottom: '6px' }}>
                                {notice.content}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} />
                                    <span>작성: {notice.author_name || '관리자'} ({notice.notice_role || 'MANAGER'})</span>
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
