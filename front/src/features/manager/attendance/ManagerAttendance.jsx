import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../../api/attendanceApi';
import { getManagerDashboard } from '../../../api/managerApi';
import { Calendar, Users, MapPin, Clock, Search, Filter, Download } from 'lucide-react';

const ManagerAttendance = () => {
    const [attendanceList, setAttendanceList] = useState([]);
    const [projectInfo, setProjectInfo] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const dash = await getManagerDashboard();
            const projectId = dash?.project_info?.id;
            
            if (projectId) {
                setProjectInfo(dash.project_info);
                const data = await attendanceApi.getProjectAttendance(projectId, selectedDate);
                setAttendanceList(data || []);
            }
        } catch (error) {
            console.error('출역 데이터 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredList = attendanceList.filter(item => {
        const name = item.worker_name || item.full_name || '';
        const company = item.company_name || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               company.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 데이터 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users color="#3b82f6" size={28} /> 출역 관리
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '5px' }}>{projectInfo?.name || '프로젝트'}의 일별 근로자 투입 현황을 확인합니다.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <Calendar size={18} color="#64748b" style={{ marginRight: '8px' }} />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: '600' }}
                        />
                    </div>
                </div>
            </div>

            {/* 통계 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { label: '총 투입 인원', value: attendanceList.length, unit: '명', color: '#3b82f6', icon: Users },
                    { label: '정상 퇴근', value: attendanceList.filter(a => a.check_out_time).length, unit: '명', color: '#10b981', icon: Clock },
                    { label: '현재 작업 중', value: attendanceList.filter(a => !a.check_out_time).length, unit: '명', color: '#f59e0b', icon: ActivityIcon },
                    { label: '위험 지역 진입', value: 0, unit: '건', color: '#ef4444', icon: AlertIcon }
                ].map((stat, i) => (
                    <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>{stat.label}</span>
                            <div style={{ background: `${stat.color}15`, padding: '8px', borderRadius: '10px' }}>
                                <stat.icon size={20} color={stat.color} />
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>{stat.value}</span>
                            <span style={{ color: '#64748b', marginLeft: '4px', fontSize: '0.9rem' }}>{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 리스트 컨트롤 */}
            <div style={{ background: 'white', borderRadius: '16px 16px 0 0', border: '1px solid #e2e8f0', borderBottom: 'none', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '350px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="근로자 이름 또는 업체명 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                        <Filter size={18} /> 필터
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', background: '#1e293b', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                        <Download size={18} /> 엑셀 다운로드
                    </button>
                </div>
            </div>

            {/* 리스트 테이블 */}
            <div style={{ background: 'white', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>근로자명</th>
                            <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>소속 업체</th>
                            <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>출근 시간</th>
                            <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>퇴근 시간</th>
                            <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>현장/구역</th>
                            <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>데이터를 불러오는 중...</td>
                            </tr>
                        ) : filteredList.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>출역 기록이 없습니다.</td>
                            </tr>
                        ) : filteredList.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.worker_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.worker_phone || '-'}</div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                        {item.company_name}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: '#334155', fontWeight: '500' }}>
                                    {item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: '#334155', fontWeight: '500' }}>
                                    {item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '600' }}>{item.site_name || '-'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.zone_name || '-'}</div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '700',
                                        background: item.check_out_time ? '#f1f5f9' : '#ecfdf5',
                                        color: item.check_out_time ? '#64748b' : '#10b981',
                                        border: `1px solid ${item.check_out_time ? '#e2e8f0' : '#a7f3d0'}`
                                    }}>
                                        {item.check_out_time ? '퇴근' : '작업 중'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .table-row-hover:hover { background-color: #f8fafc; }
            `}} />
        </div>
    );
};

const ActivityIcon = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const AlertIcon = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export default ManagerAttendance;
