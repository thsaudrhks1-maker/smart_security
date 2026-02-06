import React from 'react';

/**
 * 위험 구역 추가 폼
 */
const DangerForm = ({ dangerForm, setDangerForm, dangerTemplates, onSubmit, onCancel }) => {
    return (
        <div style={{ 
            padding: '1.5rem', 
            background: '#fef2f2', 
            borderRadius: '16px', 
            border: '1px solid #fecaca' 
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 모드 선택 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem' }}>
                        입력 방식
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setDangerForm({...dangerForm, mode: 'template'})}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '10px',
                                border: dangerForm.mode === 'template' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                background: dangerForm.mode === 'template' ? '#fee2e2' : 'white',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                color: dangerForm.mode === 'template' ? '#991b1b' : '#64748b'
                            }}
                        >
                            템플릿 선택
                        </button>
                        <button
                            onClick={() => setDangerForm({...dangerForm, mode: 'custom'})}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '10px',
                                border: dangerForm.mode === 'custom' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                background: dangerForm.mode === 'custom' ? '#fee2e2' : 'white',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                color: dangerForm.mode === 'custom' ? '#991b1b' : '#64748b'
                            }}
                        >
                            직접 입력
                        </button>
                    </div>
                </div>

                {dangerForm.mode === 'template' ? (
                    /* 템플릿 선택 모드 */
                    <>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                위험 요소 선택
                            </label>
                            <select
                                value={dangerForm.danger_info_id}
                                onChange={e => setDangerForm({...dangerForm, danger_info_id: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    border: '1px solid #fecaca',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">선택하세요</option>
                                {dangerTemplates.map(dt => (
                                    <option key={dt.id} value={dt.id}>
                                        {dt.danger_type} (위험도: {dt.risk_level})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                상세 설명 (선택)
                            </label>
                            <textarea 
                                value={dangerForm.description} 
                                onChange={e => setDangerForm({...dangerForm, description: e.target.value})}
                                placeholder="추가 설명이 필요한 경우 입력"
                                rows={2}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    border: '1px solid #fecaca',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </>
                ) : (
                    /* 커스텀 입력 모드 */
                    <>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                위험 유형 (새로 추가)
                            </label>
                            <input 
                                type="text"
                                value={dangerForm.custom_type} 
                                onChange={e => setDangerForm({...dangerForm, custom_type: e.target.value})}
                                placeholder="예: 소음, 분진, 진동"
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    border: '1px solid #fecaca',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                    아이콘
                                </label>
                                <input 
                                    type="text"
                                    value={dangerForm.custom_icon} 
                                    onChange={e => setDangerForm({...dangerForm, custom_icon: e.target.value})}
                                    placeholder="alert-triangle"
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px', 
                                        borderRadius: '12px', 
                                        border: '1px solid #fecaca',
                                        fontSize: '0.85rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                    색상
                                </label>
                                <input 
                                    type="color"
                                    value={dangerForm.custom_color} 
                                    onChange={e => setDangerForm({...dangerForm, custom_color: e.target.value})}
                                    style={{ 
                                        width: '100%', 
                                        height: '44px',
                                        borderRadius: '12px', 
                                        border: '1px solid #fecaca',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                위험도 ({dangerForm.risk_level})
                            </label>
                            <input 
                                type="range"
                                min="1"
                                max="5"
                                value={dangerForm.risk_level}
                                onChange={e => setDangerForm({...dangerForm, risk_level: e.target.value})}
                                style={{ width: '100%' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                                <span>낮음 (1)</span>
                                <span>매우 높음 (5)</span>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                상세 설명
                            </label>
                            <textarea 
                                value={dangerForm.description} 
                                onChange={e => setDangerForm({...dangerForm, description: e.target.value})}
                                placeholder="위험 요소에 대한 상세 설명"
                                rows={2}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    border: '1px solid #fecaca',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </>
                )}
                
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
                            background: '#ef4444', 
                            color: 'white', 
                            fontWeight: '900',
                            cursor: 'pointer'
                        }}
                    >
                        {dangerForm.mode === 'custom' ? '생성 후 추가' : '추가'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DangerForm;
