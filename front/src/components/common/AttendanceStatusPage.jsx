import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/api/projectApi';
import { attendanceApi } from '@/api/attendanceApi';
import { noticeApi } from '@/api/noticeApi';
import { 
    Calendar, Users, MapPin, Clock, Search, Filter, 
    Download, CheckCircle, XCircle, Building2, 
    TrendingUp, ShieldCheck, UserCheck, Timer,
    ArrowUpRight, MoreVertical, SearchCode, Bell
} from 'lucide-react';

/**
 * AttendanceStatusPage: 프리미엄 다크 테마 적용 출역 및 안전 관리 페이지
 * - Admin, Manager용 통합 현황
 */
const AttendanceStatusPage = () => {
    const { user } = useAuth();
    // 데이터 로드 상태 관리
    const [attendanceList, setAttendanceList] = useState([]);
    const [projects, setProjects] = useState([]);
    const [currentProjectId, setCurrentProjectId] = useState(user?.project_id || "");
    const [projectInfo, setProjectInfo] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCompanyFilter, setActiveCompanyFilter] = useState('ALL');
    const [safetyFilter, setSafetyFilter] = useState('ALL'); // ALL, UNCHECKED
    const [sortConfig, setSortConfig] = useState({ key: 'sort_score', direction: 'desc' });

    useEffect(() => {
        if (user?.role === 'admin') {
            loadProjects();
        } else if (user?.project_id) {
            setCurrentProjectId(user.project_id);
        }
    }, [user?.role, user?.project_id]);

    useEffect(() => {
        loadData();
    }, [selectedDate, currentProjectId]);

    const loadProjects = async () => {
        try {
            const res = await projectApi.getProjects();
            const list = res?.data?.data || [];
            setProjects(list);
            if (list.length > 0 && !currentProjectId) {
                setCurrentProjectId(list[0].id);
            }
        } catch (e) {
            console.error('프로젝트 목록 로드 실패:', e);
        }
    };

    const loadData = async () => {
        if (!currentProjectId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const projectId = currentProjectId;
            
            const projectRes = await projectApi.getProject(projectId).catch(() => null);
            if (projectRes?.data?.data) {
                setProjectInfo(projectRes.data.data);
            }

            const response = await attendanceApi.getProjectStatus(projectId, selectedDate);
            if (response?.data?.success) {
                setAttendanceList(response.data.data);
            }
        } catch (error) {
            console.error('출역 데이터 로드 중 오류 발생:', error);
        } finally {
            setLoading(false);
        }
    };

    // 업체 명단 추출 (필터용)
    const companiesList = ['ALL', ...new Set(attendanceList.map(item => item.company_name))];

    // 정렬 및 필터링 로직
    const filteredList = [...attendanceList]
        .filter(item => {
            const name = item.full_name || '';
            const company = item.company_name || '';
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                company.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCompany = activeCompanyFilter === 'ALL' || item.company_name === activeCompanyFilter;
            const matchesSafety = safetyFilter === 'ALL' || (item.check_in_time && !item.safety_checked);
            return matchesSearch && matchesCompany && matchesSafety && item.is_approved !== false;
        })
        .sort((a, b) => {
            if (sortConfig.key === 'sort_score') {
                // 상태 우선 정렬 (기본)
                return b.sort_score - a.sort_score || a.company_name.localeCompare(b.company_name);
            }
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

    const isWorker = user?.role === 'worker';

    // 통계 계산
    const stats = {
        total: attendanceList.length,
        present: attendanceList.filter(a => a.check_in_time).length,
        safety: attendanceList.filter(a => a.safety_checked).length,
        absent: attendanceList.filter(a => !a.check_in_time).length
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // [NEW] 미점검자 일괄 알림 발송
    const handleNotifyUnchecked = async () => {
        const unchecked = attendanceList.filter(a => a.check_in_time && !a.safety_checked);
        if (unchecked.length === 0) {
            alert("지연된 안전 점검 대상자가 없습니다.");
            return;
        }

        if (window.confirm(`${unchecked.length}명의 미점검자에게 안전점검 독촉 알림을 보내시겠습니까?`)) {
            try {
                const userIds = unchecked.map(u => u.user_id);
                await noticeApi.sendPushAlert({
                    project_id: currentProjectId || 1,
                    user_ids: userIds,
                    title: "안전 점검 안내",
                    content: "아직 오늘의 작업 전 안전 점검을 완료하지 않으셨습니다. 즉시 점검 후 업무를 시작해 주세요.",
                    alert_type: "SAFETY_CHECK"
                });
                alert("알림이 전송되었습니다.");
            } catch (error) {
                console.error("알림 전송 실패:", error);
                alert("알림 전송 중 오류가 발생했습니다.");
            }
        }
    };

    // [NEW] 개별 알림 발송
    const handleNotifyIndividual = async (worker) => {
        if (window.confirm(`${worker.full_name}님께 개별 안전 공지를 보내시겠습니까?`)) {
            try {
                await noticeApi.sendPushAlert({
                    project_id: currentProjectId || 1,
                    user_ids: [worker.user_id],
                    title: "관리자 호출",
                    content: "관리자로부터 호출이 왔습니다. 대기 중인 내용을 확인해 주세요.",
                    alert_type: "NORMAL"
                });
                alert("알림이 전송되었습니다.");
            } catch (error) {
                console.error("알림 전송 실패:", error);
                alert("알림 전송 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div style={{ 
            padding: '1.5rem', 
            height: 'calc(100vh - 64px)', 
            display: 'flex', 
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            color: '#e2e8f0',
            overflow: 'hidden'
        }}>
            {/* 상단 헤더 */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(20px)',
                padding: '1rem 1.5rem',
                borderRadius: '24px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                        padding: '10px', borderRadius: '14px',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
                    }}>
                        <UserCheck size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0 }}>출역 및 안전 관리</h1>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: '600' }}>
                            {projectInfo?.name || '현장'} 실시간 투입 인력 및 안전점검 현황
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    {user?.role === 'admin' && (
                        <div className="dark-card" style={{ display: 'flex', alignItems: 'center', padding: '0 15px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                            <Building2 size={16} color="#94a3b8" style={{ marginRight: '10px' }} />
                            <select 
                                value={currentProjectId}
                                onChange={(e) => setCurrentProjectId(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', color: '#e2e8f0', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                            >
                                <option value="">현장 선택</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="dark-card" style={{ display: 'flex', alignItems: 'center', padding: '0 15px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                        <Calendar size={16} color="#94a3b8" style={{ marginRight: '10px' }} />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', color: '#e2e8f0', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', colorScheme: 'dark' }}
                        />
                    </div>
                </div>
            </div>

            {/* 통계 요약 대시보드 */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '1.25rem', 
                marginBottom: '1.5rem' 
            }}>
                {[
                    { label: '배정 인원', value: stats.total, unit: '명', color: '#3b82f6', icon: Users },
                    { label: '출근 완료', value: stats.present, unit: '명', color: '#10b981', icon: Timer },
                    { label: '안전 점검', value: stats.safety, unit: '명', color: '#f59e0b', icon: ShieldCheck },
                    { label: '미출근', value: stats.absent, unit: '명', color: '#ef4444', icon: Clock }
                ].map((stat, i) => (
                    <div key={i} className="dark-card" style={{ 
                        padding: '1rem 1.25rem', border: '1px solid rgba(148, 163, 184, 0.1)',
                        display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ background: `${stat.color}15`, padding: '10px', borderRadius: '12px' }}>
                            <stat.icon size={20} color={stat.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                {stat.label}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#f1f5f9' }}>{stat.value}</span>
                                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700' }}>{stat.unit}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', alignItems: 'center', color: stat.color, fontSize: '0.7rem', fontWeight: '800', opacity: 0.8 }}>
                                <ArrowUpRight size={12} /> {(stat.value / (stats.total || 1) * 100).toFixed(0)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 업체별 및 안전점검 필터 토글 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', flex: 1 }} className="no-scrollbar">
                    {companiesList.map(comp => (
                        <button 
                            key={comp}
                            onClick={() => setActiveCompanyFilter(comp)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                background: activeCompanyFilter === comp ? '#3b82f6' : 'rgba(30, 41, 59, 0.5)',
                                color: activeCompanyFilter === comp ? 'white' : '#94a3b8',
                                border: `1px solid ${activeCompanyFilter === comp ? '#3b82f6' : 'rgba(148, 163, 184, 0.1)'}`,
                                boxShadow: activeCompanyFilter === comp ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                            }}
                        >
                            {comp === 'ALL' ? '전체 보기' : comp}
                        </button>
                    ))}
                </div>
                
                <div style={{ marginLeft: '1rem' }}>
                    <button 
                        onClick={() => setSafetyFilter(prev => prev === 'ALL' ? 'UNCHECKED' : 'ALL')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '900',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            background: safetyFilter === 'UNCHECKED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                            color: safetyFilter === 'UNCHECKED' ? '#f87171' : '#94a3b8',
                            border: `1px solid ${safetyFilter === 'UNCHECKED' ? '#ef4444' : 'rgba(148, 163, 184, 0.1)'}`
                        }}
                    >
                        <ShieldCheck size={16} />
                        {safetyFilter === 'UNCHECKED' ? '전체 보기' : '미점검자만 보기'}
                    </button>
                </div>
            </div>

            {/* 필터 및 검색 바 */}
            <div style={{ 
                background: 'rgba(30, 41, 59, 0.4)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(148, 163, 184, 0.1)', 
                borderBottom: 'none', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem'
            }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="근로자 이름 또는 업체명 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="dark-input"
                        style={{ paddingLeft: '45px', background: 'rgba(15, 23, 42, 0.4)' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="dark-button" style={{ 
                        padding: '0 20px', 
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }} onClick={handleNotifyUnchecked}>
                        <Bell size={18} /> 미점검자 일괄 공지
                    </button>
                    <button className="dark-button" style={{ 
                        padding: '0 20px', 
                        background: sortConfig.key !== 'sort_score' ? '#3b82f6' : '#334155',
                        color: 'white'
                    }} onClick={() => handleSort('full_name')}>
                        <TrendingUp size={18} /> 이름순 정렬
                    </button>
                    <button className="dark-button" style={{ padding: '0 20px', background: '#334155' }}><Download size={18} /> 엑셀 다운로드</button>
                </div>
            </div>

            {/* 출역 리스트 테이블 */}
            <div className="dark-card" style={{ borderRadius: '0 0 20px 20px', border: '1px solid rgba(148, 163, 184, 0.1)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="dark-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(15, 23, 42, 0.6)', position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>근로자 정보</th>
                                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>소속 업체 / 공종</th>
                                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>출입 시간 (In/Out)</th>
                                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>안전점검 상태</th>
                                <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>출역 상태</th>
                                <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}><MoreVertical size={16} /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '8rem', textAlign: 'center', color: '#64748b' }}><TrendingUp size={40} className="animate-pulse" style={{ display: 'block', margin: '0 auto 1rem' }} /> 데이터 분석 중...</td></tr>
                            ) : filteredList.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '8rem', textAlign: 'center', color: '#64748b' }}><SearchCode size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} /><br/>검색 결과가 없습니다.</td></tr>
                            ) : (
                                (() => {
                                    let currentCompany = null;
                                    return filteredList.map((item, idx) => {
                                        const showCompanyHeader = item.company_name !== currentCompany;
                                        currentCompany = item.company_name;

                                        return (
                                            <React.Fragment key={item.user_id || idx}>
                                                {showCompanyHeader && (
                                                    <tr style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                                                        <td colSpan="6" style={{ padding: '10px 1.5rem', borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Building2 size={16} color="#3b82f6" />
                                                                <span style={{ fontWeight: '900', color: '#3b82f6', fontSize: '0.85rem' }}>{item.company_name}</span>
                                                                <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                                                                    {item.trade_type || '공정'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                <tr style={{ 
                                                    borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                                                    background: idx % 2 === 0 ? 'transparent' : 'rgba(148, 163, 184, 0.02)',
                                                    transition: 'all 0.2s',
                                                    opacity: item.sort_score === 1 ? 0.6 : 1
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(148, 163, 184, 0.02)'}
                                                >
                                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ 
                                                                width: '36px', height: '36px', borderRadius: '12px', 
                                                                background: item.check_in_time ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)', 
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                                color: item.check_in_time ? '#3b82f6' : '#64748b', fontWeight: '800' 
                                                            }}>
                                                                {item.full_name[0]}
                                                            </div>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <span style={{ fontWeight: '800', color: '#f1f5f9', fontSize: '0.95rem' }}>{item.full_name}</span>
                                                                    {item.is_planned && (
                                                                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: '900' }}>
                                                                            작업예정
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{item.phone || '-'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                                        <div style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '0.85rem' }}>{item.company_name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '4px' }}>{item.position || '공종 정보 없음'}</div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Clock size={14} color={item.check_in_time ? '#10b981' : '#475569'} />
                                                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: item.check_in_time ? '#e2e8f0' : '#475569' }}>
                                                                    {item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <ArrowUpRight size={14} color={item.check_out_time ? '#f59e0b' : '#475569'} />
                                                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: item.check_out_time ? '#e2e8f0' : '#475569' }}>
                                                                    {item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                                                        {item.safety_checked ? (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: '900', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '10px' }}>
                                                                <CheckCircle size={14} /> 점검완료
                                                            </span>
                                                        ) : (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontWeight: '900', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 12px', borderRadius: '10px', opacity: item.check_in_time ? 1 : 0.4 }}>
                                                                <XCircle size={14} /> 미점검
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                                                        <div style={{ 
                                                            display: 'inline-block', padding: '5px 15px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900',
                                                            background: item.check_out_time ? 'rgba(148, 163, 184, 0.1)' : item.check_in_time ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.05)',
                                                            color: item.check_out_time ? '#94a3b8' : item.check_in_time ? '#34d399' : '#f87171',
                                                            border: `1px solid ${item.check_out_time ? 'rgba(148, 163, 184, 0.2)' : item.check_in_time ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.1)'}`
                                                        }}>
                                                            {item.check_out_time ? '퇴근 완료' : item.check_in_time ? '현장 작업 중' : '미출근'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                            {item.check_in_time && !item.safety_checked && (
                                                                <button 
                                                                    onClick={() => handleNotifyIndividual(item)}
                                                                    title="안전점검 독촉 알림"
                                                                    style={{ 
                                                                        background: 'rgba(239, 68, 68, 0.1)', 
                                                                        border: '1px solid rgba(239, 68, 68, 0.2)', 
                                                                        color: '#f87171', padding: '6px', borderRadius: '8px', cursor: 'pointer',
                                                                        animation: 'pulse-subtle 2s infinite'
                                                                    }}
                                                                >
                                                                    <Bell size={16} />
                                                                </button>
                                                            )}
                                                            <button style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    });
                                })()
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceStatusPage;
