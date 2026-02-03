import React, { useEffect, useState } from 'react';
import { getMyWorkers } from '../../../api/managerApi';
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
      setWorkers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.full_name?.includes(searchTerm) || 
    w.company_name?.includes(searchTerm) ||
    w.job_type?.includes(searchTerm)
  );

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>👷 근로자 관리</h1>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="이름, 업체, 직종 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              padding: '10px 10px 10px 36px', 
              borderRadius: '8px', 
              border: '1px solid #cbd5e1', 
              width: '250px' 
            }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>이름</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>소속 업체</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>직종</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>연락처</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>승인 상태</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>출역 상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</td></tr>
            ) : filteredWorkers.length > 0 ? (
              filteredWorkers.map(worker => (
                <tr key={worker.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="#64748b" />
                      </div>
                      {worker.full_name}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#334155' }}>
                    <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '500' }}>
                      {worker.company_name}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{worker.job_type || '-'}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{worker.phone || '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600',
                          background: worker.member_status === 'ACTIVE' ? '#dbeafe' : '#f1f5f9',
                          color: worker.member_status === 'ACTIVE' ? '#2563eb' : '#64748b'
                      }}>
                          {worker.member_status === 'ACTIVE' ? '승인완료' : '대기중'}
                      </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {worker.today_status === 'PRESENT' || worker.today_status === 'LATE' ? (
                      <span style={{ color: '#16a34a', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>
                        <UserCheck size={14} /> 출근
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                        <UserX size={14} /> 미출근
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkerManagement;
