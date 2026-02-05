import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Calendar } from 'lucide-react';
import { getMyAttendance } from '@/api/attendanceApi';

/**
 * 작업자 - 나의 출근현황 (기간별)
 * 날짜, 출근 시각, 퇴근 시각, 근로시간, 근무회사, 나의 파트, 작업내용
 */
const formatDate = (d) => {
    if (!d) return '-';
    const s = typeof d === 'string' ? d : d.slice(0, 10);
    return s;
};

const formatTime = (dt) => {
    if (!dt) return '-';
    const s = typeof dt === 'string' ? dt : dt.slice(0, 19);
    const part = s.split('T')[1];
    return part ? part.slice(0, 5) : '-';
};

const formatWorkMinutes = (min) => {
    if (min == null) return '-';
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}분`;
    return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
};

const WorkerAttendance = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [range, setRange] = useState('7'); // '7' | '14' | '30'

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const end = new Date();
                const days = parseInt(range, 10) || 7;
                const start = new Date(end);
                start.setDate(start.getDate() - (days - 1));
                const startStr = start.toISOString().slice(0, 10);
                const endStr = end.toISOString().slice(0, 10);
                const data = await getMyAttendance(startStr, endStr);
                setList(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('나의 출근현황 로드 실패:', err);
                setError('출근 내역을 불러오지 못했습니다.');
                setList([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [range]);

    return (
        <div style={{ padding: '1rem', background: '#f1f5f9', minHeight: '100%', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <ClipboardCheck size={26} color="#3b82f6" />
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>나의 출근현황</h1>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#64748b" />
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>기간</span>
                <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        fontSize: '0.9rem',
                    }}
                >
                    <option value="7">최근 7일</option>
                    <option value="14">최근 14일</option>
                    <option value="30">최근 30일</option>
                </select>
            </div>

            {loading && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>로딩 중...</div>
            )}
            {error && (
                <div style={{ padding: '1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}
            {!loading && !error && list.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    해당 기간 출근 기록이 없습니다.
                </div>
            )}
            {!loading && list.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {list.map((row) => (
                        <div
                            key={row.id}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '1rem',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>
                                    {formatDate(row.date)}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: row.status === 'LATE' ? '#fef3c7' : '#dcfce7',
                                    color: row.status === 'LATE' ? '#b45309' : '#166534',
                                }}>
                                    {row.status === 'LATE' ? '지각' : row.status === 'LEAVE_EARLY' ? '조퇴' : '정상'}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '0.85rem', color: '#475569' }}>
                                <span>출근</span>
                                <span style={{ textAlign: 'right' }}>{formatTime(row.check_in_time)}</span>
                                <span>퇴근</span>
                                <span style={{ textAlign: 'right' }}>{formatTime(row.check_out_time)}</span>
                                <span>근로시간</span>
                                <span style={{ textAlign: 'right' }}>{formatWorkMinutes(row.work_minutes)}</span>
                            </div>
                            {(row.company_name || row.my_part) && (
                                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b' }}>
                                    {row.company_name && <span>{row.company_name}</span>}
                                    {row.company_name && row.my_part && ' · '}
                                    {row.my_part && <span>{row.my_part}</span>}
                                </div>
                            )}
                            {row.work_description && (
                                <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#475569' }}>
                                    {row.work_description}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkerAttendance;
