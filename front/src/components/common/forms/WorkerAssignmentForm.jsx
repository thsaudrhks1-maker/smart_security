import React from 'react';

/**
 * 작업자 배정 폼 - 다크 테마 적용
 */
const WorkerAssignmentForm = ({ task, approvedWorkers, onAssign, onRemove, onComplete }) => {
    return (
        <div className="dark-card" style={{ 
            padding: '1.5rem', 
            background: 'rgba(30, 41, 59, 0.3)', 
            boxShadow: 'none',
            border: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
            <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#60a5fa', marginBottom: '6px' }}>
                    🛠️ 대상 작업: {task?.work_type || '선택된 작업'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    {task?.description}
                </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
                <label className="dark-label">
                    현장 가용 인원 배정 (승인됨)
                </label>
                <div className="dark-scrollbar" style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    background: 'rgba(15, 23, 42, 0.4)', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    padding: '10px'
                }}>
                    {approvedWorkers && approvedWorkers.length > 0 ? (
                        approvedWorkers.map(worker => {
                            const isAssigned = task?.workers?.some(w => w.id === worker.id);
                            return (
                                <div 
                                    key={worker.id} 
                                    style={{ 
                                        padding: '12px 14px', 
                                        marginBottom: '8px',
                                        background: isAssigned ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 41, 59, 0.2)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: isAssigned ? '2px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(148, 163, 184, 0.05)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: isAssigned ? '#e2e8f0' : '#94a3b8' }}>
                                            {worker.full_name}
                                            {worker.job_title && (
                                                <span className="dark-badge-blue" style={{ marginLeft: '10px' }}>
                                                    {worker.job_title}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
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
                                        className="dark-button"
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            background: isAssigned ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                            color: isAssigned ? '#f87171' : '#60a5fa',
                                            borderColor: isAssigned ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                                            fontSize: '0.8rem',
                                            fontWeight: '800'
                                        }}
                                    >
                                        {isAssigned ? '배정 취소' : '인원 추가'}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="dark-empty-state" style={{ padding: '2rem' }}>
                            현재 가용 가능한 인원이 없습니다.
                        </div>
                    )}
                </div>
            </div>
            
            <button 
                onClick={onComplete}
                className="dark-button active"
                style={{ 
                    width: '100%',
                    padding: '14px', 
                    fontSize: '1.1rem'
                }}
            >
                인원 배정 완료 및 저장
            </button>
        </div>
    );
};

export default WorkerAssignmentForm;
