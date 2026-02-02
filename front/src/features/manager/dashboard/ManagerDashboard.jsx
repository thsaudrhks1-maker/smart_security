import React from 'react';

const ManagerDashboard = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>
        현장 관리 대시보드
      </h1>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>내 현장 요약</h2>
        <p style={{ color: '#64748b' }}>담당하고 있는 프로젝트의 오늘의 안전 현황을 표시합니다.</p>
        
        <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <strong>현재 연결된 프로젝트:</strong> 없음 (설정 필요)
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
