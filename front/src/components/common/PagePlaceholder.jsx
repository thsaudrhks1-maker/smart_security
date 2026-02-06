import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

const PagePlaceholder = ({ title, children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="container" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ padding: '1rem 0', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '10px', transition: 'all 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>{title}</h2>
      </header>
      
      <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'white', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: '#fff7ed', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          <Construction size={40} color="#f97316" />
        </div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem' }}>화면 준비 중</h3>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '400px', lineHeight: '1.6' }}>
          요청하신 <strong>{title}</strong> 기능을 현재 열심히 개발하고 있습니다. 빠른 시일 내에 찾아뵙겠습니다!
        </p>
        <button 
          onClick={() => navigate(-1)}
          style={{ padding: '0.8rem 2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)', transition: 'all 0.2s' }}
        >
          이전 화면으로 돌아가기
        </button>
        {children}
      </div>
    </div>
  );
};

export default PagePlaceholder;
