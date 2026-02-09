import React from 'react';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * 위험 구역 카드
 * - 상태(PENDING/APPROVED) 표시
 * - 승인(Approve) 기능 (Manager only)
 * - 이미지 표시
 */
const DangerCard = ({ danger, onDelete, onApprove, viewerType }) => {
    const isPending = danger.status === 'PENDING';
    const canApprove = viewerType === 'MANAGER' && isPending;
    const canDelete = onDelete; 

    // 이미지 경로 생성 (백엔드 포트 8500 기준)
    const getImageUrl = (filename) => {
        const infoFolder = danger.danger_info_id || 'custom';
        return `http://localhost:8500/uploads/danger_zones/${danger.zone_id}/${infoFolder}/${filename}`;
    };

    return (
        <div style={{ 
            padding: '1rem', 
            background: isPending ? '#fff7ed' : '#fef2f2', // Pending: Orange tint, Approved: Red tint
            border: `1.5px solid ${isPending ? '#fdba74' : '#fca5a5'}`, 
            borderRadius: '16px',
            marginBottom: '12px',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ 
                            padding: '4px 10px', 
                            background: isPending ? '#f97316' : '#dc2626', 
                            color: 'white', 
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                        }}>
                            {danger.risk_type || danger.custom_type || '위험 요소'}
                        </div>
                        {isPending && (
                            <div style={{ 
                                padding: '4px 8px', 
                                background: 'white', 
                                color: '#f97316', 
                                border: '1px solid #f97316',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <AlertCircle size={12} /> 승인 대기
                            </div>
                        )}
                        {!isPending && (
                             <div style={{ 
                                padding: '4px 8px', 
                                background: 'white', 
                                color: '#dc2626', 
                                border: '1px solid #dc2626',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <CheckCircle size={12} /> 등록 완료
                            </div>
                        )}
                    </div>
                    
                    <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '700', marginBottom: '6px', paddingRight: '1rem', lineHeight: '1.4' }}>
                        {danger.description || '위험 설명이 없습니다.'}
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                    {canApprove && (
                        <button 
                            onClick={() => onApprove(danger.id)}
                            style={{ 
                                padding: '8px 16px', 
                                background: '#22c55e', 
                                color: 'white',
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)'
                            }}
                        >
                            승인하기
                        </button>
                    )}
                    
                    {canDelete && (
                        <button 
                            onClick={onDelete}
                            style={{ 
                                padding: '8px', 
                                background: '#fee2e2', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                color: '#991b1b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                alignSelf: 'flex-end'
                            }}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* 현장 사진 표시 */}
            {danger.images && danger.images.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>
                        현장 사진 ({danger.images.length})
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {danger.images.map((img, idx) => {
                             const imgUrl = getImageUrl(img);
                             return (
                                <div key={idx} style={{ 
                                    position: 'relative', 
                                    width: '100px', 
                                    height: '100px', 
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    cursor: 'pointer'
                                }} onClick={() => window.open(imgUrl, '_blank')}>
                                    <img 
                                        src={imgUrl} 
                                        alt={`현장 사진 ${idx + 1}`} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = 'https://via.placeholder.com/100?text=Error';
                                        }}
                                    />
                                </div>
                             );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DangerCard;
