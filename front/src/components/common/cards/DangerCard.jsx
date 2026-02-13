import React from 'react';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * 위험 구역 카드 - 다크 테마 적용
 * - 상태(PENDING/APPROVED) 표시
 * - 승인(Approve) 기능 (Manager only)
 * - 이미지 표시
 */
const DangerCard = ({ danger, onDelete, onApprove, viewerType }) => {
    const isPending = danger.status === 'PENDING';
    const canApprove = viewerType === 'MANAGER' && isPending;
    const canDelete = onDelete; 

    const getImageUrl = (filename) => {
        return `/uploads/daily_danger_images/${filename}`;
    };

    return (
        <div style={{ 
            padding: '1.2rem', 
            background: isPending ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)', 
            border: `1.5px solid ${isPending ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, 
            borderRadius: '20px',
            marginBottom: '15px',
            transition: 'all 0.2s',
            boxShadow: 'none'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ 
                            padding: '4px 10px', 
                            background: isPending ? '#fbbf24' : '#f87171', 
                            color: isPending ? '#0f172a' : '#ffffff', 
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '900',
                        }}>
                            {danger.risk_type || danger.custom_type || '위험 요소'}
                        </div>
                        {isPending && (
                            <div style={{ 
                                padding: '4px 10px', 
                                background: 'rgba(245, 158, 11, 0.1)', 
                                color: '#fbbf24', 
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <AlertCircle size={14} /> 승인 대기 중
                            </div>
                        )}
                        {!isPending && (
                             <div style={{ 
                                padding: '4px 10px', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#f87171', 
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <CheckCircle size={14} /> 현장 등록 완료
                            </div>
                        )}
                    </div>
                    
                    <div style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: '800', marginBottom: '8px', paddingRight: '1rem', lineHeight: '1.5' }}>
                        {danger.description || '현장 위험 설명이 등록되어 있지 않습니다.'}
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    {canApprove && (
                        <button 
                            onClick={() => onApprove(danger.id)}
                            className="dark-button active"
                            style={{ 
                                padding: '8px 16px', 
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderColor: 'rgba(16, 185, 129, 0.3)',
                                color: 'white',
                                fontSize: '0.85rem',
                                fontWeight: '900',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            신고 승인
                        </button>
                    )}
                    
                    {canDelete && (
                        <button 
                            onClick={onDelete}
                            style={{ 
                                padding: '10px', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                border: '1.5px solid rgba(239, 68, 68, 0.2)', 
                                borderRadius: '10px', 
                                cursor: 'pointer',
                                color: '#f87171',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                alignSelf: 'flex-end',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* 현장 사진 표시 */}
            {danger.images && danger.images.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>
                        현장 채증 사진 ({danger.images.length})
                    </div>
                    <div className="dark-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {danger.images.map((img, idx) => {
                             const imgUrl = getImageUrl(img);
                             return (
                                <div key={idx} style={{ 
                                    position: 'relative', 
                                    width: '120px', 
                                    height: '120px', 
                                    borderRadius: '12px',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    background: '#0f172a'
                                }} 
                                onClick={() => window.open(imgUrl, '_blank')}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <img 
                                        src={imgUrl} 
                                        alt={`현장 사진 ${idx + 1}`} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div style=\"width:100%;height:100%;background:#1e293b;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:0.75rem;text-align:center;padding:10px;\">이미지<br>로드 실패</div>';
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
