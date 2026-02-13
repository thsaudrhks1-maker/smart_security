import React from 'react';

const DangerItem = ({ danger }) => (
    <div className="dark-danger-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div className="dark-danger-item-title">{danger.zone_name}</div>
            <div className="dark-danger-item-badge">
                {danger.danger_type || danger.risk_type}
            </div>
        </div>
        {danger.description && (
            <div className="dark-danger-item-desc">
                {danger.description}
            </div>
        )}
    </div>
);

export default DangerItem;
