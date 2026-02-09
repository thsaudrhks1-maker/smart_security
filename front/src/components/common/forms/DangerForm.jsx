import React, { useState } from 'react';
import { Camera, X, AlertTriangle } from 'lucide-react';

/**
 * [COMMON] 위험 구역/요소 등록 폼
 * - Worker: 신고(Request)
 * - Manager: 등록(Direct)
 */
const DangerForm = ({ 
    dangerForm, 
    setDangerForm, 
    dangerTemplates, 
    files, 
    setFiles, 
    onSubmit, 
    onCancel,
    mode = 'MANAGER' // 'MANAGER' or 'WORKER'
}) => {
    
    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleRemoveFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return (
        <div style={{ 
            padding: '1.5rem', 
            background: '#fef2f2', 
            borderRadius: '16px', 
            border: '1px solid #fecaca' 
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 모드 선택 (관리자만 노출하거나, 워커도 선택 가능하게 할지 결정) */}
                {/* 편의상 워커는 '템플릿' 위주지만, '직접 입력'도 허용한다면 유지 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#7f1d1d' }}>
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
                            🚫 위험 요소 선택
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
                            ✏️ 직접 입력
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
                                placeholder={mode === 'MANAGER' ? "조치 권고 사항을 입력하세요." : "현장의 위험 상황을 설명해주세요."}
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
                
                {/* 사진 첨부 섹션 (공통) */}
                <div>
                   <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                       현장 사진 ({files?.length || 0}장)
                   </label>
                   <label style={{ 
                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                       width: '100%', padding: '12px', borderRadius: '12px', 
                       border: '2px dashed #f87171', background: 'white', 
                       color: '#ef4444', fontWeight: '700', cursor: 'pointer' 
                   }}>
                       <Camera size={18} />
                       {files?.length > 0 ? '추가 촬영/업로드' : '사진 촬영 또는 업로드'}
                       <input 
                           type="file" 
                           multiple 
                           accept="image/*" 
                           onChange={handleFileChange} 
                           style={{ display: 'none' }} 
                       />
                   </label>
                   
                   {/* 파일 프리뷰 */}
                   {files?.length > 0 && (
                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                           {files.map((file, idx) => (
                               <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                   <img 
                                       src={URL.createObjectURL(file)} 
                                       alt="preview" 
                                       style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                                   />
                                   <button 
                                       onClick={() => handleRemoveFile(idx)}
                                       style={{ 
                                           position: 'absolute', top: -5, right: -5, 
                                           background: '#ef4444', color: 'white', 
                                           borderRadius: '50%', width: '18px', height: '18px', 
                                           border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
                                       }}
                                   >
                                       <X size={12} />
                                   </button>
                               </div>
                           ))}
                       </div>
                   )}
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
                            background: mode === 'MANAGER' ? '#0f172a' : '#ef4444', // 관리자는 남색, 워커는 적색
                            color: 'white', 
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                         {mode === 'MANAGER' 
                             ? (dangerForm.mode === 'custom' ? '생성 후 등록' : '등록하기')
                             : '위험 신고하기'
                         }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DangerForm;
