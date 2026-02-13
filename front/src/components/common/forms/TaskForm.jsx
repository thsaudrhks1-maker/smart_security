import React from 'react';

/**
 * 작업 추가 폼 - 다크 테마 적용
 */
const TaskForm = ({ taskForm, setTaskForm, workTemplates, onSubmit, onCancel }) => {
    return (
        <div className="dark-card" style={{ 
            padding: '1.5rem', 
            background: 'rgba(30, 41, 59, 0.3)', 
            boxShadow: 'none',
            border: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                    <label className="dark-label">
                        작업 종류
                    </label>
                    <select 
                        value={taskForm.work_info_id} 
                        onChange={e => setTaskForm({...taskForm, work_info_id: e.target.value})}
                        className="dark-select"
                    >
                        <option value="" style={{ background: '#1e293b' }}>작업 종류 선택</option>
                        {workTemplates.map(t => (
                            <option key={t.id} value={t.id} style={{ background: '#1e293b' }}>{t.work_type}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="dark-label">
                        작업 설명
                    </label>
                    <input 
                        type="text"
                        value={taskForm.description} 
                        onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                        placeholder="예: 1층 로비 거푸집 설치"
                        className="dark-input"
                    />
                </div>
                <div>
                    <label className="dark-label">
                        위험도 점수 ({taskForm.risk_score}점)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input 
                            type="range"
                            min="0"
                            max="100"
                            value={taskForm.risk_score} 
                            onChange={e => setTaskForm({...taskForm, risk_score: e.target.value})}
                            style={{ 
                                flex: 1,
                                accentColor: '#3b82f6',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ 
                            fontSize: '1rem', 
                            fontWeight: '900', 
                            color: taskForm.risk_score >= 60 ? '#f87171' : '#60a5fa',
                            minWidth: '45px',
                            textAlign: 'right'
                        }}>
                            {taskForm.risk_score}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                    <button 
                        onClick={onCancel}
                        className="dark-button"
                        style={{ 
                            flex: 1, 
                            borderColor: 'rgba(148, 163, 184, 0.2)',
                            color: '#94a3b8'
                        }}
                    >
                        취소
                    </button>
                    <button 
                        onClick={onSubmit}
                        className="dark-button active"
                        style={{ 
                            flex: 2,
                            fontSize: '1rem'
                        }}
                    >
                        다음: 인원 배정
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskForm;
