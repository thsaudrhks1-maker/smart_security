import React, { useEffect, useState } from 'react';
import { getMyCompanies } from '../../../api/managerApi';
import { Building2, Search, Briefcase } from 'lucide-react';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await getMyCompanies();
        setCompanies(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>🏢 협력사 관리</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
             <div style={{ colSpan: '3', textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
        ) : companies.length > 0 ? (
          companies.map(company => (
            <div key={company.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} color="#3b82f6" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>{company.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{company.type || '전문건설'}</div>
                  </div>
                </div>
                <span style={{ 
                  background: getRoleBadgeColor(company.project_role), 
                  color: 'white', 
                  fontSize: '0.75rem', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  {company.project_role}
                </span>
              </div>
              
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem' }}>
                <button style={{ width: '100%', padding: '10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>
                   업체 상세 정보
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            참여 중인 협력사가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

const getRoleBadgeColor = (role) => {
  switch(role) {
    case 'CLIENT': return '#3b82f6';
    case 'CONSTRUCTOR': return '#10b981';
    default: return '#64748b';
  }
};

export default CompanyManagement;
