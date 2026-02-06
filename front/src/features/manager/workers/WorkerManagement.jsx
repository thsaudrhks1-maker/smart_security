import React, { useEffect, useState } from 'react';
import { getMyWorkers } from '@/api/managerApi';
import { Search, UserCheck, UserX, User } from 'lucide-react';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const data = await getMyWorkers();
      setWorkers(data || []);
    } catch (error) {
      console.error('Failed to load workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.job_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
            현장 인력 관리
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>현재 투입된 모든 근로자의 현황을 실시간으로 확인합니다.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="성명, 업체명, 직종 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%',
              padding: '12px 12px 12px 40px', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0', 
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              backgroundColor: '#ffffff',
              color: '#1e293b'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
        overflow: 'hidden',
        border: '1px solid #f1f5f9'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1.25rem 1rem', color: '#475569', fontWeight: '600', fontSize: '0.875rem' }}>성명</th>
              <th style={{ padding: '1.25rem 1rem', color: '#475569', fontWeight: '600', fontSize: '0.875rem' }}>소속 업체</th>
              <th style={{ padding: '1.25rem 1rem', color: '#475569', fontWeight: '600', fontSize: '0.875rem' }}>직종</th>
              <th style={{ padding: '1.25rem 1rem', color: '#475569', fontWeight: '600', fontSize: '0.875rem' }}>연락처</th>
              <th style={{ padding: '1.25rem 1rem', color: '#475569', fontWeight: '600', fontSize: '0.875rem', textAlign: 'center' }}>계정 상태</th>
              <th style={{ padding: '1.25rem 1rem', color: '#475569', fontWeight: '600', fontSize: '0.875rem', textAlign: 'center' }}>오늘 출결</th>
            </tr>
          </thead>
          <tbody style={{ color: '#1e293b' }}>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>데이터를 불러오는 중...</div>
                </td>
              </tr>
            ) : filteredWorkers.length > 0 ? (
              filteredWorkers.map(worker => (
                <tr key={worker.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '10px', 
                        background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <User size={18} color="#64748b" />
                      </div>
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>{worker.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: '#eff6ff', color: '#1e40af', 
                      padding: '4px 10px', borderRadius: '6px', 
                      fontSize: '0.85rem', fontWeight: '500' 
                    }}>
                      {worker.company_name}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{worker.job_type || '-'}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{worker.phone || '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                        background: worker.member_status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                        color: worker.member_status === 'ACTIVE' ? '#15803d' : '#64748b',
                        border: worker.member_status === 'ACTIVE' ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                    }}>
                        {worker.member_status === 'ACTIVE' ? '정상' : '비활성'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {worker.today_status === 'PRESENT' || worker.today_status === 'LATE' ? (
                      <span style={{ 
                        color: '#2563eb', fontWeight: '700', display: 'inline-flex', alignItems: 'center', 
                        gap: '6px', background: '#eff6ff', padding: '6px 12px', borderRadius: '20px', 
                        fontSize: '0.85rem', border: '1px solid #dbeafe'
                      }}>
                        <UserCheck size={14} /> 출근
                      </span>
                    ) : (
                      <span style={{ 
                        color: '#94a3b8', display: 'inline-flex', alignItems: 'center', 
                        gap: '6px', fontSize: '0.85rem', background: '#f8fafc', 
                        padding: '6px 12px', borderRadius: '20px', border: '1px solid #f1f5f9'
                      }}>
                        <UserX size={14} /> 미출근
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                    <Search size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                  </div>
                  <div style={{ color: '#64748b' }}>조회된 현장 인력이 없습니다.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkerManagement;
