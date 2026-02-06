import React, { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';

/**
 * 작업 카드 (작업자 배정 포함)
 */
const TaskCard = ({ task, approvedWorkers, onDelete, onAssignWorker, onRemoveWorker }) => {
    const [showWorkerSelect, setShowWorkerSelect] = useState(false);
    const assignedWorkerIds = (task.workers || []).map(w => w.id);
    const availableWorkers = approvedWorkers.filter(w => !assignedWorkerIds.includes(w.id));

    return (
        <div style={{ 
            padding: '1rem', 
            background: '#f8fafc', 
            border: '1.5px solid #e2e8f0', 
            borderRadius: '16px' 
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '900', fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>
                        {task.work_type || '기타 작업'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {task.description}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ 
                        padding: '6px 10px', 
                        background: task.calculated_risk_score >= 60 ? '#fee2e2' : '#dbeafe', 
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        color: task.calculated_risk_score >= 60 ? '#991b1b' : '#1e40af'
                    }}>
                        위험도 {task.calculated_risk_score}
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
            </div>

            {/* 배정된 작업자 목록 */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '8px' 
                }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>
                        배정 인원 ({(task.workers || []).length}명)
                    </div>
                    <button 
                        onClick={() => setShowWorkerSelect(!showWorkerSelect)}
                        style={{ 
                            padding: '4px 10px', 
                            background: '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            fontSize: '0.7rem', 
                            fontWeight: '700', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <UserPlus size={12} /> 추가
                    </button>
                </div>

                {showWorkerSelect && (
                    <div style={{ 
                        marginBottom: '10px', 
                        padding: '10px', 
                        background: 'white', 
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        maxHeight: '150px',
                        overflowY: 'auto'
                    }}>
                        {availableWorkers.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
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
                                        padding: '10px', 
                                        cursor: 'pointer',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        marginBottom: '4px',
                                        background: '#f8fafc',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                                >
                                    <div>
                                        <div style={{ fontWeight: '800', color: '#0f172a' }}>
                                            {worker.full_name}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                            {worker.company_name}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '4px 8px', 
                                        background: '#dbeafe', 
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        color: '#1e40af'
                                    }}>
                                        {worker.job_title || '작업자'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(task.workers || []).length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', padding: '8px' }}>
                            배정된 작업자가 없습니다.
                        </div>
                    ) : (
                        (task.workers || []).map(worker => (
                            <div 
                                key={worker.id}
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '10px',
                                    background: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '3px' }}>
                                        {worker.full_name}
                                        <span style={{ 
                                            marginLeft: '8px',
                                            padding: '2px 8px',
                                            background: '#dbeafe',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            color: '#1e40af'
                                        }}>
                                            {worker.job_title || '작업자'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                        {worker.company_name}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onRemoveWorker(worker.id)}
                                    style={{ 
                                        padding: '6px 10px', 
                                        background: '#fee2e2', 
                                        border: 'none', 
                                        borderRadius: '6px', 
                                        fontSize: '0.7rem', 
                                        fontWeight: '700',
                                        color: '#991b1b',
                                        cursor: 'pointer'
                                    }}
                                >
                                    제거
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
