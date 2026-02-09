import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/api/projectApi';
import { attendanceApi } from '@/api/attendanceApi';
import { Calendar, Users, MapPin, Clock, Search, Filter, Download, CheckCircle, XCircle, Building2 } from 'lucide-react';

/**
 * AttendanceStatusPage: Admin, Manager, Worker 모두 사용할 수 있는 통합 출역 현황 페이지
 */
const AttendanceStatusPage = () => {
    const { user } = useAuth();
    const [attendanceList, setAttendanceList] = useState([]);
    const [projects, setProjects] = useState([]); // Admin용 프로젝트 목록
    const [currentProjectId, setCurrentProjectId] = useState(user?.project_id || "");
    const [projectInfo, setProjectInfo] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
            
            // 프로젝트 정보 가져오기 (이름 등을 위해)
            const projectRes = await projectApi.getProject(projectId).catch(() => null);
            if (projectRes?.data?.data) {
                setProjectInfo(projectRes.data.data);
            }

            // 통합 현황(출퇴근 + 안전점검) 가져오기
            const response = await attendanceApi.getProjectStatus(projectId, selectedDate);
            if (response?.data?.success) {
                setAttendanceList(response.data.data || []);
            } else {
                setAttendanceList([]);
            }
        } catch (error) {
            console.error('출역 데이터 로드 중 오류 발생:', error);
            setAttendanceList([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredList = attendanceList.filter(item => {
        const name = item.full_name || '';
        const company = item.company_name || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               company.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const isWorker = user?.role === 'worker';

    return (
        <div style={{ 
            padding: isWorker ? '1rem' : '2rem', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            maxWidth: '1400px', 
            margin: '0 auto',
            background: isWorker ? '#f8fafc' : 'transparent'
        }}>
            {/* 상단 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: isWorker ? '1.4rem' : '1.8rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Users color="#2563eb" size={isWorker ? 24 : 32} /> {isWorker ? '현장 출역 현황' : '출역 및 안전 관리'}
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '6px', fontSize: isWorker ? '0.85rem' : '1rem' }}>
                         {projectInfo ? (
                             <><span style={{ fontWeight: '700', color: '#1e293b' }}>{projectInfo.name}</span> 실시간 현황</>
                         ) : '현장을 선택해 주세요.'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Admin용 프로젝트 선택기 */}
                    {user?.role === 'admin' && (
                        <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <Building2 size={16} color="#64748b" style={{ marginRight: '8px' }} />
                            <select 
                                value={currentProjectId}
                                onChange={(e) => setCurrentProjectId(e.target.value)}
                                style={{ border: 'none', outline: 'none', color: '#1e293b', fontWeight: '600', fontSize: '0.9rem' }}
                            >
                                <option value="">프로젝트 선택</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <Calendar size={16} color="#64748b" style={{ marginRight: '8px' }} />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ border: 'none', outline: 'none', color: '#1e293b', fontWeight: '600', fontSize: '0.9rem' }}
                        />
                    </div>
                </div>
            </div>

            {/* 통계 카드 */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isWorker ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
                gap: isWorker ? '0.75rem' : '1.5rem', 
                marginBottom: '2rem' 
            }}>
                {[
                    { label: '배정 인원', value: attendanceList.length, unit: '명', color: '#2563eb', icon: Users },
                    { label: '출근 완료', value: attendanceList.filter(a => a.check_in_time).length, unit: '명', color: '#10b981', icon: Clock },
                    { label: '안전 점검 완료', value: attendanceList.filter(a => a.safety_checked).length, unit: '명', color: '#f59e0b', icon: CheckCircle },
                    { label: '미점검 인원', value: attendanceList.filter(a => a.check_in_time && !a.safety_checked).length, unit: '명', color: '#ef4444', icon: XCircle }
                ].map((stat, i) => (
                    <div key={i} style={{ 
                        background: 'white', padding: isWorker ? '1rem' : '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b', fontSize: isWorker ? '0.75rem' : '0.9rem', fontWeight: '600' }}>{stat.label}</span>
                            <div style={{ background: `${stat.color}10`, padding: isWorker ? '6px' : '10px', borderRadius: '10px' }}>
                                <stat.icon size={isWorker ? 18 : 22} color={stat.color} />
                            </div>
                        </div>
                        <div style={{ marginTop: isWorker ? '0.75rem' : '1.25rem' }}>
                            <span style={{ fontSize: isWorker ? '1.4rem' : '2rem', fontWeight: '800', color: '#0f172a' }}>{stat.value}</span>
                            <span style={{ color: '#64748b', marginLeft: '4px', fontSize: isWorker ? '0.8rem' : '1rem', fontWeight: '500' }}>{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 필터 및 검색 바 */}
            <div style={{ 
                background: 'white', borderRadius: '16px 16px 0 0', border: '1px solid #e2e8f0', 
                borderBottom: 'none', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
            }}>
                <div style={{ position: 'relative', width: isWorker ? '100%' : '400px' }}>
                    <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="근로자 이름 또는 업체명 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', padding: '10px 12px 10px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', 
                            outline: 'none', fontSize: '0.9rem', backgroundColor: '#f8fafc'
                        }}
                    />
                </div>
                {!isWorker && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', 
                            border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
                        }}>
                            <Filter size={16} /> 필터
                        </button>
                        <button style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', 
                            background: '#0f172a', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '0.85rem'
                        }}>
                            <Download size={16} /> 다운로드
                        </button>
                    </div>
                )}
            </div>

            {/* 출역 리스트 테이블 */}
            <div style={{ background: 'white', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isWorker ? '500px' : 'auto' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                            <th style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>근로자 정보</th>
                            <th style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>소속 업체</th>
                            <th style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>출입 시간</th>
                            <th style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>안전점검</th>
                            <th style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>상태</th>
                        </tr>
                    </thead>
                    <tbody style={{ color: '#1e293b' }}>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>데이터 로드 중...</td></tr>
                        ) : filteredList.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>조회된 내역이 없습니다.</td></tr>
                        ) : filteredList.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{item.full_name}</div>
                                    {!isWorker && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{item.phone || '-'}</div>}
                                </td>
                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <span style={{ padding: '4px 10px', background: '#eff6ff', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#1e40af' }}>
                                        {item.company_name}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.25rem', color: '#334155', fontWeight: '600', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span>In: {item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                        <span>Out: {item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                                    {item.safety_checked ? (
                                        <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: '800', fontSize: '0.85rem' }}>
                                            <CheckCircle size={16} /> 완료
                                        </div>
                                    ) : (
                                        <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: '800', fontSize: '0.85rem', opacity: item.check_in_time ? 1 : 0.3 }}>
                                            <XCircle size={16} /> 미점검
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                                    <span style={{ 
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                                        background: item.check_out_time ? '#f1f5f9' : item.check_in_time ? '#dcfce7' : '#f8fafc',
                                        color: item.check_out_time ? '#64748b' : item.check_in_time ? '#15803d' : '#94a3b8',
                                        border: `1px solid ${item.check_out_time ? '#e2e8f0' : item.check_in_time ? '#bbf7d0' : '#e2e8f0'}`
                                    }}>
                                        {item.check_out_time ? '퇴근' : item.check_in_time ? '작업 중' : '미출근'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceStatusPage;
