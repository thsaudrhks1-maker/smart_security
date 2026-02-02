import React, { useState, useEffect } from 'react';
import { Database, Users, Briefcase, MapPin, FileText, TrendingUp, Grid, User } from 'lucide-react';
import apiClient from '../../api/client';
import WorkerDashboard from './WorkerDashboard';
import './AdminDashboard.css'; // 화이트 테마 전용 CSS

/**
 * 관리자 전용 대시보드
 * - 전체 DB 데이터 조회 (엑셀 스타일 테이블)
 * - 작업자 뷰 전환 가능
 * - 흰색 배경 + 어두운 글씨
 */
const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState('database'); // 'database' or 'worker'
  const [activeTable, setActiveTable] = useState('workers');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_workers: 0,
    total_sites: 0,
    total_plans: 0,
    total_zones: 0
  });

  // 통계 데이터 로드
  useEffect(() => {
    apiClient.get('/dashboard/summary').then(res => {
      setStats(res.data);
    }).catch(err => console.error('통계 로드 실패:', err));
  }, []);

  // 테이블 데이터 로드
  useEffect(() => {
    if (viewMode !== 'database') return;
    
    setLoading(true);
    const endpoints = {
      workers: '/admin/db/workers',
      sites: '/admin/db/sites',
      plans: '/admin/db/plans',
      zones: '/admin/db/zones',
      companies: '/admin/db/companies'
    };

    apiClient.get(endpoints[activeTable] || endpoints.workers)
      .then(res => {
        setTableData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('데이터 로드 실패:', err);
        setLoading(false);
      });
  }, [activeTable, viewMode]);

  const tables = [
    { key: 'workers', label: '작업자', icon: Users, color: '#3b82f6' },
    { key: 'sites', label: '현장', icon: MapPin, color: '#10b981' },
    { key: 'plans', label: '작업계획', icon: Briefcase, color: '#f59e0b' },
    { key: 'zones', label: '구역', icon: TrendingUp, color: '#8b5cf6' },
    { key: 'companies', label: '협력사', icon: FileText, color: '#ec4899' }
  ];

  // 작업자 뷰 모드
  if (viewMode === 'worker') {
    return <WorkerDashboard isAdminView={true} onBackToAdmin={() => setViewMode('database')} />;
  }

  // 데이터베이스 뷰 모드
  return (
    <div className="admin-dashboard-white" style={{ padding: '1.5rem' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b', marginBottom: '0.5rem' }}>
            <Database size={28} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            데이터 센터
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>전체 데이터베이스 조회 및 관리</p>
        </div>
        
        {/* 뷰 전환 버튼 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('database')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: viewMode === 'database' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              background: viewMode === 'database' ? '#eff6ff' : 'white',
              color: viewMode === 'database' ? '#3b82f6' : '#64748b',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Grid size={18} />
            데이터베이스
          </button>
          <button
            onClick={() => setViewMode('worker')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: viewMode === 'worker' ? '2px solid #10b981' : '1px solid #e2e8f0',
              background: viewMode === 'worker' ? '#f0fdf4' : 'white',
              color: viewMode === 'worker' ? '#10b981' : '#64748b',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <User size={18} />
            작업자 뷰
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <StatCard title="총 작업자" value={stats.total_workers} icon={Users} color="#3b82f6" />
        <StatCard title="현장 수" value={stats.total_sites || 0} icon={MapPin} color="#10b981" />
        <StatCard title="작업 계획" value={stats.today_plans} icon={Briefcase} color="#f59e0b" />
        <StatCard title="위험 구역" value={stats.total_zones || 0} icon={TrendingUp} color="#ef4444" />
      </div>

      {/* 테이블 탭 */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem', 
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        {tables.map(table => (
          <button
            key={table.key}
            onClick={() => setActiveTable(table.key)}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: activeTable === table.key ? `2px solid ${table.color}` : '1px solid #e2e8f0',
              background: activeTable === table.key ? `${table.color}15` : 'white',
              color: activeTable === table.key ? table.color : '#64748b',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <table.icon size={18} />
            {table.label}
          </button>
        ))}
      </div>

      {/* 데이터 테이블 */}
      <div style={{ 
        padding: '1.5rem', 
        overflowX: 'auto',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            데이터 로딩 중...
          </div>
        ) : (
          <DataTable data={tableData} tableType={activeTable} />
        )}
      </div>
    </div>
  );
};

// 통계 카드 컴포넌트
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div style={{ 
    padding: '1.25rem', 
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>{title}</span>
      <Icon size={20} color={color} />
    </div>
    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{value}</div>
  </div>
);

// 데이터 테이블 컴포넌트
const DataTable = ({ data, tableType }) => {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>데이터가 없습니다.</div>;
  }

  // 테이블 헤더 정의
  const headers = {
    workers: ['ID', '이름', '직종', '회사', '상태'],
    sites: ['ID', '현장명', '주소', '안전관리자'],
    plans: ['ID', '작업명', '구역', '위험도', '상태'],
    zones: ['ID', '구역명', '레벨', '타입', '위도', '경도'],
    companies: ['ID', '회사명', '업종']
  };

  const currentHeaders = headers[tableType] || Object.keys(data[0] || {});

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
          {currentHeaders.map((header, idx) => (
            <th key={idx} style={{ 
              textAlign: 'left', 
              padding: '1rem', 
              color: '#475569', 
              fontWeight: '700',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              background: '#f8fafc'
            }}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx} style={{ 
            borderBottom: '1px solid #f1f5f9',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {Object.values(row).slice(0, currentHeaders.length).map((cell, cellIdx) => (
              <td key={cellIdx} style={{ 
                padding: '1rem', 
                color: '#1e293b',
                fontSize: '0.9rem'
              }}>
                {cell !== null && cell !== undefined ? String(cell) : '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminDashboard;
