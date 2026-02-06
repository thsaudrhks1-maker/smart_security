import React from 'react';

/**
 * 작업자 배정 폼
 */
const WorkerAssignmentForm = ({ task, approvedWorkers, onAssign, onRemove, onComplete }) => {
    return (
        <div style={{ 
            padding: '1.5rem', 
            background: '#f0f9ff', 
            borderRadius: '16px', 
            border: '1px solid #bae6fd' 
        }}>
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0c4a6e', marginBottom: '4px' }}>
                    작업: {task?.work_type || '선택된 작업'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {task?.description}
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem' }}>
                    작업자 선택 (승인된 인원)
                </label>
                <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    background: 'white', 
                    borderRadius: '12px', 
                    border: '1px solid #e0f2fe',
                    padding: '8px'
                }}>
                    {approvedWorkers && approvedWorkers.length > 0 ? (
                        approvedWorkers.map(worker => {
                            const isAssigned = task?.workers?.some(w => w.id === worker.id);
                            return (
                                <div 
                                    key={worker.id} 
                                    style={{ 
                                        padding: '10px 12px', 
                                        marginBottom: '6px',
                                        background: isAssigned ? '#dbeafe' : '#f8fafc',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: isAssigned ? '2px solid #3b82f6' : '1px solid #e2e8f0'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1e293b' }}>
                                            {worker.full_name}
                                            {worker.job_title && (
                                                <span style={{ 
                                                    marginLeft: '6px',
                                                    padding: '2px 6px',
                                                    background: '#e0e7ff',
                                                    borderRadius: '6px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '800',
                                                    color: '#4338ca'
                                                }}>
                                                    {worker.job_title}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                            {worker.company_name}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (isAssigned) {
                                                onRemove(task.id, worker.id);
                                            } else {
                                                onAssign(task.id, worker.id);
                                            }
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: isAssigned ? '#ef4444' : '#3b82f6',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isAssigned ? '제거' : '추가'}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            승인된 작업자가 없습니다.
                        </div>
                    )}
                </div>
            </div>
            
            <button 
                onClick={onComplete}
                style={{ 
                    width: '100%',
                    padding: '12px', 
                    borderRadius: '12px', 
                    border: 'none', 
                    background: '#3b82f6', 
                    color: 'white', 
                    fontWeight: '900',
                    cursor: 'pointer'
                }}
            >
                완료
            </button>
        </div>
    );
};

export default WorkerAssignmentForm;
