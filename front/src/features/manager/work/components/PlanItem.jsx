import React from 'react';

const PlanItem = ({ plan }) => {
    const workers = Array.isArray(plan.workers) ? plan.workers : [];
    const workerCount = workers.length;
    
    return (
        <div style={{ 
            padding: '12px', 
            background: '#f8fafc', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            marginBottom: '10px' 
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>{plan.zone_name}</div>
                <div style={{ 
                    padding: '4px 8px', 
                    background: '#dbeafe', 
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    color: '#1e40af'
                }}>
                    {workerCount}명
                </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '700', marginBottom: '6px' }}>
                {plan.work_type}
            </div>
            {workerCount > 0 && (
                <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#64748b',
                    paddingTop: '6px',
                    borderTop: '1px solid #e2e8f0'
                }}>
                    {workers.map((w) => (
                        <div key={w.id || w.worker_id} style={{ marginTop: '3px' }}>
                            • {w.full_name} ({w.job_title})
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlanItem;
