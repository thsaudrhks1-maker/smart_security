import React from 'react';

/**
 * 작업 추가 폼
 */
const TaskForm = ({ taskForm, setTaskForm, workTemplates, onSubmit, onCancel }) => {
    return (
        <div style={{ 
            padding: '1.5rem', 
            background: '#f8fafc', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0' 
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                        작업 종류
                    </label>
                    <select 
                        value={taskForm.work_info_id} 
                        onChange={e => setTaskForm({...taskForm, work_info_id: e.target.value})}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            borderRadius: '12px', 
                            border: '1px solid #e2e8f0',
                            fontSize: '0.9rem'
                        }}
                    >
                        <option value="">선택</option>
                        {workTemplates.map(t => (
                            <option key={t.id} value={t.id}>{t.work_type}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                        작업 설명
                    </label>
                    <input 
                        type="text"
                        value={taskForm.description} 
                        onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                        placeholder="예: 1층 로비 거푸집 설치"
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            borderRadius: '12px', 
                            border: '1px solid #e2e8f0',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                        위험도 점수 ({taskForm.risk_score})
                    </label>
                    <input 
                        type="range"
                        min="0"
                        max="100"
                        value={taskForm.risk_score} 
                        onChange={e => setTaskForm({...taskForm, risk_score: e.target.value})}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <button 
                        onClick={onCancel}
                        style={{ 
                            flex: 1, 
                            padding: '12px', 
                            borderRadius: '12px', 
                            border: 'none', 
                            background: '#f1f5f9', 
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        취소
                    </button>
                    <button 
                        onClick={onSubmit}
                        style={{ 
                            flex: 2, 
                            padding: '12px', 
                            borderRadius: '12px', 
                            border: 'none', 
                            background: '#3b82f6', 
                            color: 'white', 
                            fontWeight: '900',
                            cursor: 'pointer'
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
