import React, { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';

/**
 * 작업 카드 (작업자 배정 포함) - 다크 테마 적용
 */
const TaskCard = ({ task, approvedWorkers, onDelete, onAssignWorker, onRemoveWorker }) => {
    const [showWorkerSelect, setShowWorkerSelect] = useState(false);
    const assignedWorkerIds = (task.workers || []).map(w => w.id);
    const availableWorkers = approvedWorkers.filter(w => !assignedWorkerIds.includes(w.id));

    return (
        <div className="dark-card" style={{ 
            padding: '1.2rem', 
            background: 'rgba(30, 41, 59, 0.4)', 
            borderRadius: '20px',
            boxShadow: 'none',
            border: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '6px' }}>
                        {task.work_type || '기타 작업'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.5' }}>
                        {task.description}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div className={task.calculated_risk_score >= 60 ? "dark-badge-red" : "dark-badge-blue"} style={{ padding: '6px 12px' }}>
                        🔥 위험도 {task.calculated_risk_score}
                    </div>
                    <button 
                        onClick={onDelete}
                        style={{ 
                            padding: '8px', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1.5px solid rgba(239, 68, 68, 0.2)', 
                            borderRadius: '10px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                        <Trash2 size={16} color="#f87171" />
                    </button>
                </div>
            </div>

            {/* 배정된 작업자 목록 */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '12px' 
                }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                        👩‍🔧 배정 인원 ({(task.workers || []).length}명)
                    </div>
                    <button 
                        onClick={() => setShowWorkerSelect(!showWorkerSelect)}
                        className="dark-button"
                        style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <UserPlus size={14} /> 가용 인원 추가
                    </button>
                </div>

                {showWorkerSelect && (
                    <div className="dark-scrollbar" style={{ 
                        marginBottom: '12px', 
                        padding: '12px', 
                        background: 'rgba(15, 23, 42, 0.4)', 
                        borderRadius: '12px',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        maxHeight: '180px',
                        overflowY: 'auto'
                    }}>
                        {availableWorkers.length === 0 ? (
                            <div className="dark-empty-state" style={{ padding: '1rem', fontSize: '0.8rem' }}>
                                배정 가능한 작업자가 없습니다.
                            </div>
                        ) : (
                            availableWorkers.map(worker => (
                                <div 
                                    key={worker.id}
                                    onClick={() => {
                                        onAssignWorker(worker.id);
                                        setShowWorkerSelect(false);
                                    }}
                                    style={{ 
                                        padding: '12px', 
                                        cursor: 'pointer',
                                        borderRadius: '10px',
                                        fontSize: '0.85rem',
                                        marginBottom: '6px',
                                        background: 'rgba(30, 41, 59, 0.3)',
                                        border: '1px solid rgba(148, 163, 184, 0.05)',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)';
                                        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.05)';
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '800', color: '#e2e8f0' }}>
                                            {worker.full_name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                            {worker.company_name}
                                        </div>
                                    </div>
                                    <div className="dark-badge-blue">
                                        {worker.job_title || '작업자'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(task.workers || []).length === 0 ? (
                        <div className="dark-empty-state" style={{ padding: '1rem', fontSize: '0.8rem' }}>
                            현장에 배정된 작업자가 없습니다.
                        </div>
                    ) : (
                        (task.workers || []).map(worker => (
                            <div 
                                key={worker.id}
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: 'rgba(30, 41, 59, 0.2)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(148, 163, 184, 0.1)'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '4px' }}>
                                        {worker.full_name}
                                        <span className="dark-badge-blue" style={{ marginLeft: '10px' }}>
                                            {worker.job_title || '작업자'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {worker.company_name}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onRemoveWorker(worker.id)}
                                    style={{ 
                                        padding: '6px 12px', 
                                        background: 'rgba(239, 68, 68, 0.1)', 
                                        border: '1px solid rgba(239, 68, 68, 0.2)', 
                                        borderRadius: '8px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '700',
                                        color: '#f87171',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                >
                                    배정 제거
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
