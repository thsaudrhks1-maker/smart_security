import React, { useEffect, useState } from 'react';
import { getMyWorkers, approveWorker, rejectWorker } from '@/api/managerApi';
import { 
    Search, UserCheck, UserX, User, 
    Filter, MoreHorizontal, CheckCircle2, 
    XCircle, Clock, Building2, Phone,
    ShieldCheck, Download, UserPlus, ArrowUpRight
} from 'lucide-react';

/**
 * [MANAGER] 현장 인력 관리 (Master Data)
 * - 현장 소속 인원 명단 관리
 * - 승인/거절 프로세스 및 마스터 정보 조회
 */
const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, ACTIVE, REJECTED

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.project_id) {
        loadWorkers(user.project_id);
    }
  }, []);

  const loadWorkers = async (projectId) => {
    try {
      setLoading(true);
      const res = await getMyWorkers(projectId);
      const data = res?.success ? res.data : (res || []);
      setWorkers(data);
    } catch (error) {
      console.error('Failed to load workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workerId, workerName) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.project_id) return;

    if (!window.confirm(`'${workerName}' 작업자를 현장에 투입 승인하시겠습니까?`)) return;
    
    try {
      await approveWorker(workerId, user.project_id);
      alert('작업자가 승인되었습니다.');
      loadWorkers(user.project_id); // 목록 새로고침
    } catch (error) {
      console.error('승인 실패:', error);
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (workerId, workerName) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.project_id) return;

    if (!window.confirm(`'${workerName}' 작업자의 투입을 거절하시겠습니까?`)) return;
    
    try {
      await rejectWorker(workerId, user.project_id);
      alert('작업자가 거절되었습니다.');
      loadWorkers(user.project_id); // 목록 새로고침
    } catch (error) {
      console.error('거절 실패:', error);
      alert('거절 처리 중 오류가 발생했습니다.');
    }
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = 
      w.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      w.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.job_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'ALL' || 
      (activeTab === 'PENDING' && (w.member_status === 'PENDING' || !w.member_status)) ||
      (activeTab === 'ACTIVE' && w.member_status === 'ACTIVE') ||
      (activeTab === 'REJECTED' && w.member_status === 'REJECTED');

    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE':
        return { label: '활성', color: '#10b981', icon: CheckCircle2, bg: 'rgba(16, 185, 129, 0.1)' };
      case 'PENDING':
      case null:
      case undefined:
        return { label: '승인 대기', color: '#f59e0b', icon: Clock, bg: 'rgba(245, 158, 11, 0.1)' };
      case 'REJECTED':
        return { label: '거절됨', color: '#ef4444', icon: XCircle, bg: 'rgba(239, 68, 68, 0.1)' };
      default:
        return { label: '비활성', color: '#94a3b8', icon: UserX, bg: 'rgba(148, 163, 184, 0.1)' };
    }
  };

  // 통계 계산
  const stats = {
    total: workers.length,
    pending: workers.filter(w => !w.member_status || w.member_status === 'PENDING').length,
    active: workers.filter(w => w.member_status === 'ACTIVE').length
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
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
              padding: '10px', borderRadius: '14px',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
          }}>
            <ShieldCheck size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>현장 인력 관리</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: '600' }}>현장 배정 인원 마스터 정보 및 승인 관리</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
            <button className="dark-button" style={{ background: '#334155' }}>
                <Download size={18} /> 양식 다운로드
            </button>
            <button className="dark-button" style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white'
            }}>
                <UserPlus size={18} /> 일괄 등록
            </button>
        </div>
      </div>

      {/* 요약 카드 (Slim) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {[
            { label: '전체 인력', value: stats.total, unit: '명', color: '#6366f1', icon: User },
            { label: '승인 대기', value: stats.pending, unit: '명', color: '#f59e0b', icon: Clock },
            { label: '정상 투입', value: stats.active, unit: '명', color: '#10b981', icon: UserCheck }
        ].map((stat, i) => (
            <div key={i} className="dark-card" style={{ 
                padding: '1.25rem', border: '1px solid rgba(148, 163, 184, 0.1)',
                display: 'flex', alignItems: 'center', gap: '15px'
            }}>
                <div style={{ background: `${stat.color}15`, padding: '12px', borderRadius: '14px' }}>
                    <stat.icon size={22} color={stat.color} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '800', marginBottom: '2px' }}>{stat.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f1f5f9' }}>{stat.value}</span>
                        <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>{stat.unit}</span>
                    </div>
                </div>
                <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '800' }}>
                    <ArrowUpRight size={14} /> NEW
                </div>
            </div>
        ))}
      </div>

      {/* 필터 바 & 탭 */}
      <div style={{ 
          background: 'rgba(30, 41, 59, 0.4)', borderRadius: '20px 20px 0 0', border: '1px solid rgba(148, 163, 184, 0.1)', 
          borderBottom: 'none', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
            {[
                { id: 'ALL', label: '전체' },
                { id: 'PENDING', label: '승인 대기' },
                { id: 'ACTIVE', label: '정상 투입' },
                { id: 'REJECTED', label: '거절 목록' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ 
                        padding: '8px 18px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800',
                        cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                        background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        color: activeTab === tab.id ? '#60a5fa' : '#64748b'
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        <div style={{ position: 'relative', width: '350px' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
            <input 
                type="text" 
                placeholder="작업자 성명, 업체명, 직종 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark-input"
                style={{ paddingLeft: '45px', background: 'rgba(15, 23, 42, 0.4)' }}
            />
        </div>
      </div>

      {/* 메인 리스트 테이블 */}
      <div className="dark-card" style={{ borderRadius: '0 0 20px 20px', border: '1px solid rgba(148, 163, 184, 0.1)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="dark-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(15, 23, 42, 0.6)', position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>성명 / 연락처</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>소속 업체 / 직종</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>등록일</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>승인 상태</th>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}><MoreHorizontal size={16} /></th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" style={{ padding: '8rem', textAlign: 'center', color: '#64748b' }}>인력 정보 로딩 중...</td></tr>
                    ) : filteredWorkers.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: '8rem', textAlign: 'center', color: '#64748b' }}>해당되는 인력 정보가 없습니다.</td></tr>
                    ) : filteredWorkers.map((worker, idx) => {
                        const status = getStatusBadge(worker.member_status);
                        return (
                            <tr key={worker.id} style={{ 
                                borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                                background: idx % 2 === 0 ? 'transparent' : 'rgba(148, 163, 184, 0.02)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(148, 163, 184, 0.02)'}
                            >
                                <td style={{ padding: '1.2rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            width: '40px', height: '40px', borderRadius: '12px', 
                                            background: 'rgba(99, 102, 241, 0.1)', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#6366f1', fontWeight: '800'
                                        }}>
                                            {worker.full_name?.[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', color: '#f1f5f9', fontSize: '0.95rem' }}>{worker.full_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Phone size={10} /> {worker.phone || '-'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontWeight: '700', fontSize: '0.85rem' }}>
                                        <Building2 size={14} color="#64748b" /> {worker.company_name}
                                    </div>
                                    <div style={{ 
                                        padding: '2px 8px', borderRadius: '5px', background: 'rgba(59, 130, 246, 0.1)',
                                        display: 'inline-block', fontSize: '0.7rem', fontWeight: '800', color: '#60a5fa',
                                        marginTop: '6px'
                                    }}>
                                        {worker.job_type || '직종 미지정'}
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem 1.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>
                                    {worker.joined_at ? new Date(worker.joined_at).toLocaleDateString() : '-'}
                                </td>
                                <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                                    <div style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 14px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900',
                                        background: status.bg, color: status.color,
                                        border: `1px solid ${status.color}30`
                                    }}>
                                        <status.icon size={14} />
                                        {status.label}
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                                    {(!worker.member_status || worker.member_status === 'PENDING') ? (
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => handleApprove(worker.id, worker.full_name)}
                                                className="dark-button" 
                                                style={{ padding: '4px 10px', fontSize: '0.7rem', background: '#10b981', color: 'white' }}
                                            >
                                                승인
                                            </button>
                                            <button 
                                                onClick={() => handleReject(worker.id, worker.full_name)}
                                                className="dark-button" 
                                                style={{ padding: '4px 10px', fontSize: '0.7rem', background: '#ef4444', color: 'white' }}
                                            >
                                                거절
                                            </button>
                                        </div>
                                    ) : (
                                        <button style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                                            <MoreHorizontal size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerManagement;
