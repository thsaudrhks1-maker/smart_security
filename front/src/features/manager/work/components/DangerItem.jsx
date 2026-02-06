import React from 'react';

const DangerItem = ({ danger }) => (
    <div style={{ 
        padding: '12px', 
        background: '#fef2f2', 
        borderRadius: '16px', 
        border: '1.5px solid #fca5a5', 
        marginBottom: '10px' 
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontWeight: '800', color: '#991b1b', fontSize: '0.9rem' }}>{danger.zone_name}</div>
            <div style={{ 
                padding: '4px 8px', 
                background: danger.color || '#dc2626', 
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: '800'
            }}>
                {danger.danger_type || danger.risk_type}
            </div>
        </div>
        {danger.description && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                {danger.description}
            </div>
        )}
    </div>
);

export default DangerItem;
