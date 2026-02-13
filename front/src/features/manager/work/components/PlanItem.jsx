import React from 'react';

const PlanItem = ({ plan }) => {
    const workers = Array.isArray(plan.workers) ? plan.workers : [];
    const workerCount = workers.length;
    
    return (
        <div className="dark-plan-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div className="dark-plan-item-title">{plan.zone_name}</div>
                <div className="dark-plan-item-badge">
                    {workerCount}명
                </div>
            </div>
            <div className="dark-plan-item-type">
                {plan.work_type}
            </div>
            {workerCount > 0 && (
                <div className="dark-plan-item-workers">
                    {workers.map((w, idx) => (
                        <div key={`${w.id || w.worker_id || idx}-${idx}`} style={{ marginTop: '3px' }}>
                            • {w.full_name} ({w.job_title || '작업자'})
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlanItem;
