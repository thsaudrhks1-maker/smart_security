import React, { useState } from 'react';
import { Camera, X, AlertTriangle, Plus, Megaphone } from 'lucide-react';

/**
 * [COMMON] 위험 구역/요소 등록 폼 - 다크 테마 적용
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
        <div className="dark-card" style={{ 
            padding: '1.5rem', 
            background: 'rgba(239, 68, 68, 0.05)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: 'none'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* 입력 방식 선택 */}
                <div>
                    <label className="dark-label" style={{ color: '#f87171' }}>
                        위험 요소 입력 방식
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setDangerForm({...dangerForm, mode: 'template'})}
                            className={`dark-level-button ${dangerForm.mode === 'template' ? 'active' : ''}`}
                            style={{ flex: 1, justifyContent: 'center', borderColor: dangerForm.mode === 'template' ? '#f87171' : 'rgba(148, 163, 184, 0.1)', color: dangerForm.mode === 'template' ? '#f87171' : '#94a3b8' }}
                        >
                            🚫 템플릿 선택
                        </button>
                        <button
                            onClick={() => setDangerForm({...dangerForm, mode: 'custom'})}
                            className={`dark-level-button ${dangerForm.mode === 'custom' ? 'active' : ''}`}
                            style={{ flex: 1, justifyContent: 'center', borderColor: dangerForm.mode === 'custom' ? '#f87171' : 'rgba(148, 163, 184, 0.1)', color: dangerForm.mode === 'custom' ? '#f87171' : '#94a3b8' }}
                        >
                            ✏️ 직접 입력 등록
                        </button>
                    </div>
                </div>

                {dangerForm.mode === 'template' ? (
                    <>
                        <div>
                            <label className="dark-label">위험 요소 템플릿</label>
                            <select
                                value={dangerForm.danger_info_id}
                                onChange={e => setDangerForm({...dangerForm, danger_info_id: e.target.value})}
                                className="dark-select"
                                style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            >
                                <option value="" style={{ background: '#1e293b' }}>위험 요소 라이브러리 선택</option>
                                {dangerTemplates.map(dt => (
                                    <option key={dt.id} value={dt.id} style={{ background: '#1e293b' }}>
                                        {dt.danger_type} (위험도: {dt.risk_level})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="dark-label">위험 상세 설명</label>
                            <textarea 
                                value={dangerForm.description} 
                                onChange={e => setDangerForm({...dangerForm, description: e.target.value})}
                                placeholder={mode === 'MANAGER' ? "조치 권고 사항 또는 상세 위험을 입력하세요." : "현장의 구체적인 위험 상황을 설명해주세요."}
                                rows={3}
                                className="dark-textarea"
                                style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="dark-label">신규 위험 유형</label>
                            <input 
                                type="text"
                                value={dangerForm.custom_type} 
                                onChange={e => setDangerForm({...dangerForm, custom_type: e.target.value})}
                                placeholder="예: 소음, 분진, 비계 불량 등"
                                className="dark-input"
                                style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="dark-label">아이콘 코드</label>
                                <input 
                                    type="text"
                                    value={dangerForm.custom_icon} 
                                    onChange={e => setDangerForm({...dangerForm, custom_icon: e.target.value})}
                                    placeholder="alert-triangle"
                                    className="dark-input"
                                />
                            </div>
                            <div>
                                <label className="dark-label">테마 색상</label>
                                <input 
                                    type="color"
                                    value={dangerForm.custom_color} 
                                    onChange={e => setDangerForm({...dangerForm, custom_color: e.target.value})}
                                    style={{ 
                                        width: '100%', 
                                        height: '48px',
                                        borderRadius: '12px', 
                                        border: '1.5px solid rgba(148, 163, 184, 0.2)',
                                        background: 'rgba(15, 23, 42, 0.4)',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="dark-label">위험도 레벨 ({dangerForm.risk_level})</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <input 
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={dangerForm.risk_level}
                                    onChange={e => setDangerForm({...dangerForm, risk_level: e.target.value})}
                                    style={{ flex: 1, accentColor: '#ef4444', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f87171', minWidth: '30px' }}>{dangerForm.risk_level}</span>
                            </div>
                        </div>
                        <div>
                            <label className="dark-label">상세 내용</label>
                            <textarea 
                                value={dangerForm.description} 
                                onChange={e => setDangerForm({...dangerForm, description: e.target.value})}
                                placeholder="위험 요소에 대한 즉각적인 설명"
                                rows={2}
                                className="dark-textarea"
                            />
                        </div>
                    </>
                )}
                
                {/* 사진 첨부 섹션 */}
                <div>
                   <label className="dark-label">현장 채증 사진 ({files?.length || 0}장)</label>
                   <label style={{ 
                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                       width: '100%', padding: '16px', borderRadius: '16px', 
                       border: '2px dashed rgba(248, 113, 113, 0.4)', background: 'rgba(239, 68, 68, 0.05)', 
                       color: '#f87171', fontWeight: '800', cursor: 'pointer',
                       transition: 'all 0.2s'
                   }}
                   onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.6)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)'; }}
                   >
                       <Camera size={20} />
                       {files?.length > 0 ? '추가 촬영/업로드' : '현장 사진 촬영 또는 파일 선택'}
                       <input 
                           type="file" 
                           multiple 
                           accept="image/*" 
                           onChange={handleFileChange} 
                           style={{ display: 'none' }} 
                       />
                   </label>
                   
                   {files?.length > 0 && (
                       <div className="dark-scrollbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                           {files.map((file, idx) => (
                               <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid rgba(148, 163, 184, 0.2)' }}>
                                   <img 
                                       src={URL.createObjectURL(file)} 
                                       alt="preview" 
                                       style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                   />
                                   <button 
                                       onClick={() => handleRemoveFile(idx)}
                                       style={{ 
                                           position: 'absolute', top: '4px', right: '4px', 
                                           background: 'rgba(239, 68, 68, 0.8)', color: 'white', 
                                           borderRadius: '50%', width: '20px', height: '20px', 
                                           border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                           backdropFilter: 'blur(4px)'
                                       }}
                                   >
                                       <X size={14} />
                                   </button>
                               </div>
                           ))}
                       </div>
                   )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
                    <button 
                        onClick={onCancel}
                        className="dark-button"
                        style={{ flex: 1, color: '#94a3b8' }}
                    >
                        취소
                    </button>
                    <button 
                        onClick={onSubmit}
                        className="dark-button active"
                        style={{ 
                            flex: 2, 
                            background: mode === 'MANAGER' ? 'linear-gradient(135deg, #475569 0%, #1e293b 100%)' : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                            color: 'white',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                         {mode === 'MANAGER' ? <Plus size={18} /> : <Megaphone size={18} />}
                         {mode === 'MANAGER' 
                             ? (dangerForm.mode === 'custom' ? '신규 위험 구역 직권 등록' : '위험 구역 즉시 등록')
                             : '위험 사안 긴급 신고하기'
                         }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DangerForm;
