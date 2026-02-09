
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, MapPin, ClipboardList, Briefcase } from 'lucide-react';

const DailyChecklistModal = ({ isOpen, onClose, myPlans = [], nearbyDangers = [], onSubmit }) => {
    const [activeTab, setActiveTab] = useState('my'); // 'my' or 'danger'
    const [checkedItems, setCheckedItems] = useState({});
    const [isRiskAcknowledged, setIsRiskAcknowledged] = useState(false);
    
    // myPlans에서 모든 checklist_items 수집 및 병합 (중복 제거)
    const checklistItems = Array.from(new Set(
        myPlans.flatMap(plan => plan.checklist_items || [])
    )).filter(Boolean);

    // 모달 열릴 때 초기화
    useEffect(() => {
        if (isOpen) {
            const initialChecked = {};
            checklistItems.forEach((_, idx) => initialChecked[idx] = false);
            setCheckedItems(initialChecked);
            setActiveTab('my');
            setIsRiskAcknowledged(nearbyDangers.length === 0); // 위험 요소 없으면 자동 확인
        }
    }, [isOpen]); 

    const handleCheck = (idx) => {
        setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const isChecklistComplete = checklistItems.length > 0 && checklistItems.every((_, idx) => checkedItems[idx]);
    const canSubmit = isChecklistComplete && isRiskAcknowledged;

    const handleSubmit = () => {
        if (canSubmit) {
            if (onSubmit) onSubmit();
            onClose();
        } else {
            if (!isChecklistComplete) {
                setActiveTab('my');
                alert("작업 전 필수 확인 사항을 모두 체크해주세요.");
            } else if (!isRiskAcknowledged) {
                setActiveTab('danger');
                alert("주변 위험 요소를 확인하고 동의해주세요.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
        }}>
            <div 
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)'
                }}
            />
            
            <div style={{
                position: 'relative',
                background: '#f8fafc',
                width: '100%',
                maxWidth: '500px',
                height: '85vh',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* 헤더 */}
                <div style={{ padding: '1.25rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList color="#3b82f6" />
                        일일 안전 점검
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#64748b' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* 탭 메뉴 */}
                <div style={{ display: 'flex', background: 'white', padding: '0 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                    <button 
                        onClick={() => setActiveTab('my')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: activeTab === 'my' ? '#3b82f6' : '#64748b',
                            borderTop: 'none',
                            borderLeft: 'none',
                            borderRight: 'none',
                            borderBottom: activeTab === 'my' ? '3px solid #3b82f6' : '3px solid transparent',
                            background: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                    >
                        {isChecklistComplete && <CheckCircle size={14} color="#10b981" />}
                        나의 작업 안전
                    </button>
                    <button 
                        onClick={() => setActiveTab('danger')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: activeTab === 'danger' ? '#ef4444' : '#64748b',
                            borderTop: 'none',
                            borderLeft: 'none',
                            borderRight: 'none',
                            borderBottom: activeTab === 'danger' ? '3px solid #ef4444' : '3px solid transparent',
                            background: 'none',
                            cursor: 'pointer',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '6px'
                        }}
                    >
                        {isRiskAcknowledged && <CheckCircle size={14} color="#10b981" />}
                        주변 위험 요소
                        {nearbyDangers.length > 0 && !isRiskAcknowledged && (
                            <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>
                                !
                            </span>
                        )}
                    </button>
                </div>

                {/* 컨텐츠 영역 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    
                    {/* 1. 나의 작업 안전 탭 */}
                    {activeTab === 'my' && (
                        <>
                            <div style={{ marginBottom: '1.5rem', background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Briefcase size={18} color="#64748b" />
                                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>오늘의 작업 ({myPlans.length}건)</span>
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
                                    {myPlans.length > 0 ? myPlans.map(p => p.work_type || p.description).join(', ') : '작업 없음'}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '4px' }}>
                                    {myPlans.length > 0 ? myPlans.map(p => `${p.level} ${p.zone_name}`).join(', ') : '-'}
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#334155', marginBottom: '1rem' }}>
                                작업 전 필수 확인 사항
                            </h3>
                            
                            {checklistItems.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    등록된 체크리스트가 없습니다.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {checklistItems.map((item, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => handleCheck(idx)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '12px',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                background: checkedItems[idx] ? '#f0fdf4' : 'white',
                                                border: checkedItems[idx] ? '1px solid #10b981' : '1px solid #e2e8f0',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <div style={{
                                                flexShrink: 0,
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: checkedItems[idx] ? 'none' : '2px solid #cbd5e1',
                                                background: checkedItems[idx] ? '#10b981' : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginTop: '2px'
                                            }}>
                                                {checkedItems[idx] && <CheckCircle size={16} color="white" />}
                                            </div>
                                            <span style={{ 
                                                fontSize: '0.95rem', 
                                                color: checkedItems[idx] ? '#15803d' : '#334155',
                                                fontWeight: checkedItems[idx] ? '600' : '500', 
                                                lineHeight: '1.5',
                                                textDecoration: checkedItems[idx] ? 'line-through' : 'none'
                                            }}>
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* 2. 주변 위험 요소 탭 */}
                    {activeTab === 'danger' && (
                        <>
                            {nearbyDangers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                                    <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>주변 위험 요소 없음</div>
                                    <div style={{ fontSize: '0.9rem' }}>현재 층은 안전합니다.</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    
                                    {/* 현재 위치 알림 */}
                                    <div style={{ padding: '0.75rem 1rem', background: '#334155', borderRadius: '8px', color: 'white', fontSize: '0.9rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>나의 위치: {myPlans.map(p => `${p.level} ${p.zone_name}`).join(', ')}</span>
                                        <MapPin size={16} color="white" />
                                    </div>

                                    {/* 동의 체크박스 */}
                                    <div 
                                        onClick={() => setIsRiskAcknowledged(!isRiskAcknowledged)}
                                        style={{
                                            padding: '1rem',
                                            background: isRiskAcknowledged ? '#f0fdf4' : '#fff1f2',
                                            border: isRiskAcknowledged ? '1px solid #10b981' : '1px solid #fda4af',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            border: isRiskAcknowledged ? 'none' : '2px solid #cbd5e1',
                                            background: isRiskAcknowledged ? '#10b981' : 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            {isRiskAcknowledged && <CheckCircle size={16} color="white" />}
                                        </div>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '700', color: isRiskAcknowledged ? '#166534' : '#be123c' }}>
                                            위 위험 요소를 확인하였으며, 안전 수칙을 준수하겠습니다.
                                        </span>
                                    </div>

                                    {/* 위험 요소 리스트 */}
                                    {nearbyDangers.sort((a, b) => (b.isMyZone ? 1 : 0) - (a.isMyZone ? 1 : 0)).map((danger, idx) => {
                                        return (
                                            <div key={idx} style={{ 
                                                background: 'white', 
                                                border: danger.isMyZone ? '2px solid #ef4444' : '1px solid #e2e8f0', 
                                                borderRadius: '16px', 
                                                overflow: 'hidden',
                                                boxShadow: danger.isMyZone ? '0 4px 12px rgba(239, 68, 68, 0.15)' : 'none'
                                            }}>
                                                <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', background: danger.isMyZone ? '#fef2f2' : 'white' }}>
                                                    <div style={{ 
                                                        width: '40px', height: '40px', borderRadius: '10px', 
                                                        background: danger.color || '#ef4444', 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'white', fontWeight: '800', flexShrink: 0
                                                    }}>
                                                        !
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{danger.danger_type} 주의</div>
                                                            {danger.isMyZone && <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>내 구역</span>}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                            <strong style={{ color: '#475569' }}>[{danger.zone_name}]</strong> {danger.description}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '1rem', background: '#f8fafc' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>안전 수칙 가이드:</div>
                                                    {danger.safety_guidelines && danger.safety_guidelines.length > 0 ? (
                                                        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                            {danger.safety_guidelines.map((guide, gIdx) => (
                                                                <li key={gIdx}>{guide}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>등록된 상세 수칙이 없습니다. 관리자에게 문의하세요.</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 하단 버튼 (항상 노출) */}
                <div style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                    <button
                        onClick={handleSubmit}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: canSubmit ? '#10b981' : '#cbd5e1',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            cursor: canSubmit ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            boxShadow: canSubmit ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        {canSubmit ? (
                            <>
                                <CheckCircle size={20} />
                                점검 완료 및 작업 시작
                            </>
                        ) : (
                            // 상태에 따른 안내 메시지
                            !isChecklistComplete ? '작업 전 필수 항목을 확인해주세요' : '주변 위험 요소를 확인해주세요'
                        )}
                    </button>
                </div>
            </div>
            
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default DailyChecklistModal;
