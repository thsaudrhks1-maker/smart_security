import React from 'react';
import { Trash2 } from 'lucide-react';

/**
 * 위험 구역 카드
 */
const DangerCard = ({ danger, onDelete }) => {
    return (
        <div style={{ 
            padding: '1rem', 
            background: '#fef2f2', 
            border: '1.5px solid #fca5a5', 
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ 
                    display: 'inline-block',
                    padding: '4px 10px', 
                    background: '#dc2626', 
                    color: 'white', 
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    marginBottom: '8px'
                }}>
                    {danger.risk_type}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {danger.description}
                </div>
            </div>
            <button 
                onClick={onDelete}
                style={{ 
                    padding: '6px', 
                    background: '#fee2e2', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Trash2 size={14} color="#991b1b" />
            </button>
        </div>
    );
};

export default DangerCard;
