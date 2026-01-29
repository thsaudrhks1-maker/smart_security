import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PagePlaceholder = ({ title, children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="container" style={{ padding: '1rem' }}>
      <header className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <ArrowLeft />
        </button>
        <h2>{title}</h2>
      </header>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>준비 중인 화면입니다.</p>
        <p style={{ fontSize: '3rem', marginTop: '1rem' }}>🚧</p>
        {children}
      </div>
    </div>
  );
};

export default PagePlaceholder;
