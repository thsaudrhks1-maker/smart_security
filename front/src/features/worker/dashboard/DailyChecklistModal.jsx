
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, MapPin, ClipboardList, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

const DailyChecklistModal = ({ isOpen, onClose, myPlans = [], nearbyDangers = [], onSubmit, isSubmitted = false }) => {
    const [activeTab, setActiveTab] = useState('my'); // 'my' or 'danger'
    
    // 상태 관리: 작업별, 위험요소별 체크 상태
    const [checkedWork, setCheckedWork] = useState({}); // { "planIdx-itemIdx": boolean }
    const [checkedDangers, setCheckedDangers] = useState({}); // { "dangerIdx": boolean }
    
    // 초기화
    useEffect(() => {
        if (isOpen) {
            setCheckedWork({});
            const initialDangerChecks = {};
            // 위험 요소가 없으면 자동 완료 처리 (필요시)
            if (nearbyDangers.length === 0) {
                // do nothing, count is 0/0 which is complete
            }
            setCheckedDangers(initialDangerChecks);
            setActiveTab('my');
        }
    }, [isOpen, nearbyDangers.length, myPlans.length]);

    // --- Helper Functions ---

    // 작업 체크리스트 토글
    const toggleWorkCheck = (planIdx, itemIdx) => {
        const key = `${planIdx}-${itemIdx}`;
        setCheckedWork(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // 위험 요소 확인 토글
    const toggleDangerCheck = (dangerIdx) => {
        setCheckedDangers(prev => ({ ...prev, [dangerIdx]: !prev[dangerIdx] }));
    };

    // --- Progress Calculation ---

    // 1. 작업 점검 진행률
    let totalWorkItems = 0;
    myPlans.forEach(plan => {
        if (plan.checklist_items && Array.isArray(plan.checklist_items)) {
            totalWorkItems += plan.checklist_items.length;
        }
    });
    const checkedWorkCount = Object.keys(checkedWork).filter(k => checkedWork[k]).length;
    const isWorkComplete = totalWorkItems === 0 || checkedWorkCount === totalWorkItems;

    // 2. 위험 요소 확인 진행률
    const totalDangers = nearbyDangers.length;
    const checkedDangerCount = Object.keys(checkedDangers).filter(k => checkedDangers[k]).length;
    const isDangerComplete = totalDangers === 0 || checkedDangerCount === totalDangers;

    const canSubmit = isWorkComplete && isDangerComplete;

    const handleSubmit = () => {
        if (isSubmitted) {
            onClose();
            return;
        }

        if (canSubmit) {
            if (onSubmit) {
                // 1. 작업 점검 결과 구성
                const planResults = myPlans.map((plan, pIdx) => {
                    const checkedItems = [];
                    if (plan.checklist_items) {
                        plan.checklist_items.forEach((item, iIdx) => {
                            // 현재 로직상 모두 체크해야 submit 가능하므로 사실상 전체를 넘겨도 되지만, 
                            // 부분 체크 로직으로 변경될 수 있으므로 state 기반으로 수집
                            if (checkedWork[`${pIdx}-${iIdx}`]) {
                                checkedItems.push(item);
                            }
                        });
                    }
                    return {
                        plan_id: plan.task_id || plan.id,
                        checked_items: checkedItems
                    };
                });

                // 2. 위험 요소 점검 결과 구성
                const dangerResults = nearbyDangers.map((danger, dIdx) => ({
                    danger_id: danger.danger_id || danger.id,
                    checked: !!checkedDangers[dIdx]
                }));

                onSubmit({ planResults, dangerResults });
            }
            onClose();
        } else {
            // 안내 메시지
            if (!isWorkComplete) {
                setActiveTab('my');
                alert(`모든 작업 안전 점검을 완료해주세요. (${checkedWorkCount}/${totalWorkItems})`);
            } else if (!isDangerComplete) {
                setActiveTab('danger');
                alert(`모든 주변 위험 요소를 확인해주세요. (${checkedDangerCount}/${totalDangers})`);
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
                height: '90vh', // 조금 더 높게
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
                            color: activeTab === 'my' ? '#3b82f6' : '#94a3b8',
                            borderBottom: activeTab === 'my' ? '3px solid #3b82f6' : '3px solid transparent',
                            background: 'none',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isWorkComplete ? <CheckCircle size={14} color="#10b981" /> : <div style={{width: 6, height: 6, borderRadius: '50%', background: '#3b82f6'}}/>}
                        나의 작업
                        <span style={{ fontSize: '0.8rem', background: isWorkComplete ? '#dcfce7' : '#eff6ff', color: isWorkComplete ? '#166534' : '#3b82f6', padding: '2px 6px', borderRadius: '10px' }}>
                            {checkedWorkCount}/{totalWorkItems}
                        </span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('danger')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: activeTab === 'danger' ? '#ef4444' : '#94a3b8',
                            borderBottom: activeTab === 'danger' ? '3px solid #ef4444' : '3px solid transparent',
                            background: 'none',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isDangerComplete ? <CheckCircle size={14} color="#10b981" /> : <div style={{width: 6, height: 6, borderRadius: '50%', background: '#ef4444'}}/>}
                        위험 요소
                        <span style={{ fontSize: '0.8rem', background: isDangerComplete ? '#dcfce7' : '#fef2f2', color: isDangerComplete ? '#166534' : '#ef4444', padding: '2px 6px', borderRadius: '10px' }}>
                            {checkedDangerCount}/{totalDangers}
                        </span>
                    </button>
                </div>

                {/* 컨텐츠 영역 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
                    
                    {/* 1. 나의 작업 안전 탭 */}
                    {activeTab === 'my' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {myPlans.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                    할당된 작업이 없습니다.
                                </div>
                            ) : (
                                myPlans.map((plan, pIdx) => (
                                    <div key={pIdx} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                        {/* 작업 헤더 */}
                                        <div style={{ padding: '1rem', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                <Briefcase size={18} color="#3b82f6" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>
                                                    {plan.work_type || plan.description || '작업'}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    {plan.zone_name} ({plan.level})
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* 체크리스트 아이템들 */}
                                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {(!plan.checklist_items || plan.checklist_items.length === 0) ? (
                                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>체크리스트가 없습니다.</div>
                                            ) : (
                                                plan.checklist_items.map((item, iIdx) => {
                                                    const isChecked = !!checkedWork[`${pIdx}-${iIdx}`];
                                                    return (
                                                        <div 
                                                            key={iIdx}
                                                            onClick={() => toggleWorkCheck(pIdx, iIdx)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                gap: '12px',
                                                                padding: '0.75rem',
                                                                borderRadius: '10px',
                                                                background: isChecked ? '#f0fdf4' : 'white',
                                                                border: isChecked ? '1px solid #10b981' : '1px solid #e2e8f0',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                opacity: isChecked ? 0.8 : 1
                                                            }}
                                                        >
                                                            <div style={{
                                                                flexShrink: 0, width: '22px', height: '22px', borderRadius: '6px',
                                                                border: isChecked ? 'none' : '2px solid #cbd5e1',
                                                                background: isChecked ? '#10b981' : 'white',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px'
                                                            }}>
                                                                {isChecked && <CheckCircle size={14} color="white" />}
                                                            </div>
                                                            <span style={{ 
                                                                fontSize: '0.9rem', 
                                                                color: isChecked ? '#15803d' : '#334155',
                                                                fontWeight: isChecked ? '600' : '500',
                                                                textDecoration: isChecked ? 'line-through' : 'none'
                                                            }}>
                                                                {item}
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* 2. 주변 위험 요소 탭 */}
                    {activeTab === 'danger' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {nearbyDangers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                                    <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>위험 요소 없음</div>
                                    <div style={{ fontSize: '0.9rem' }}>현재 층은 안전합니다.</div>
                                </div>
                            ) : (
                                nearbyDangers.sort((a, b) => (b.isMyZone ? 1 : 0) - (a.isMyZone ? 1 : 0)).map((danger, idx) => {
                                    const isChecked = !!checkedDangers[idx];
                                    return (
                                        <div 
                                            key={idx} 
                                            onClick={() => toggleDangerCheck(idx)}
                                            style={{ 
                                                background: 'white', 
                                                border: isChecked ? '2px solid #10b981' : (danger.isMyZone ? '2px solid #ef4444' : '1px solid #e2e8f0'), 
                                                borderRadius: '16px', 
                                                overflow: 'hidden',
                                                boxShadow: isChecked ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                opacity: isChecked ? 0.9 : 1
                                            }}
                                        >
                                            <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', background: isChecked ? '#f0fdf4' : (danger.isMyZone ? '#fef2f2' : 'white') }}>
                                                {/* 아이콘 영역 */}
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{ 
                                                        width: '40px', height: '40px', borderRadius: '10px', 
                                                        background: isChecked ? '#10b981' : (danger.color || '#ef4444'), 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'white', fontWeight: '800', flexShrink: 0,
                                                        transition: 'background 0.2s'
                                                    }}>
                                                        {isChecked ? <CheckCircle size={24} /> : '!'}
                                                    </div>
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontWeight: '800', color: '#1e293b' }}>
                                                            {danger.danger_type} 주의
                                                        </div>
                                                        {danger.isMyZone && !isChecked && <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>내 구역</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                        <strong style={{ color: '#475569' }}>[{danger.zone_name}]</strong> {danger.description}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* 상세 내용 및 확인 체크박스 UI */}
                                            <div style={{ padding: '1rem', background: isChecked ? '#f8fafc' : '#ffffff' }}>
                                                {danger.safety_guidelines && danger.safety_guidelines.length > 0 && !isChecked && (
                                                    <ul style={{ margin: '0 0 12px 0', paddingLeft: '1.2rem', color: '#334155', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {danger.safety_guidelines.map((guide, gIdx) => (
                                                            <li key={gIdx}>{guide}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                                
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isChecked ? '#10b981' : '#cbd5e1' }}>
                                                        {isChecked ? "확인 완료" : "확인하려면 터치하세요"}
                                                    </span>
                                                    <div style={{
                                                        width: '20px', height: '20px', borderRadius: '50%',
                                                        border: isChecked ? 'none' : '2px solid #cbd5e1',
                                                        background: isChecked ? '#10b981' : 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {isChecked && <CheckCircle size={12} color="white" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* 하단 버튼 (항상 노출, 진행상황 표시) */}
                <div style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #e2e8f0', boxShadow: '0 -4px 10px rgba(0,0,0,0.03)' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitted && !canSubmit} // 이미 제출되었으면 닫기 기능만
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: isSubmitted ? '#cbd5e1' : (canSubmit ? '#10b981' : '#f1f5f9'),
                            color: isSubmitted ? '#1e293b' : (canSubmit ? 'white' : '#94a3b8'),
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isSubmitted ? 'none' : (canSubmit ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                        }}
                    >
                        {isSubmitted ? (
                            <>
                                <CheckCircle size={20} />
                                점검 완료됨 (닫기)
                            </>
                        ) : canSubmit ? (
                            <>
                                <CheckCircle size={20} />
                                점검 완료 및 작업 시작
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{fontSize: '1rem'}}>
                                    {!isWorkComplete ? "작업 안전 점검이 필요합니다" : "주변 위험 요소 확인이 필요합니다"}
                                </span>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.8, display: 'flex', gap: '8px' }}>
                                    <span style={{ color: isWorkComplete ? '#10b981' : '#ef4444' }}>
                                        작업 {checkedWorkCount}/{totalWorkItems}
                                    </span>
                                    <span style={{ color: '#cbd5e1' }}>|</span>
                                    <span style={{ color: isDangerComplete ? '#10b981' : '#ef4444' }}>
                                        위험 {checkedDangerCount}/{totalDangers}
                                    </span>
                                </div>
                            </div>
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
