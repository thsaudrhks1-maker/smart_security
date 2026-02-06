import React from 'react';
import { X } from 'lucide-react';

const SimpleModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s ease-out'
      }} onClick={e => e.stopPropagation()}>
        
        {/* ?§Îçî */}
        <div style={{
          padding: '1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
            {title}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Ïª®ÌÖêÏ∏?*/}
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SimpleModal;
