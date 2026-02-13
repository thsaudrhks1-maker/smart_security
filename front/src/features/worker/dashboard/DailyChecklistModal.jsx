
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, MapPin, ClipboardList, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

const DailyChecklistModal = ({ isOpen, onClose, myPlans = [], nearbyDangers = [], onSubmit, isSubmitted = false }) => {
    const [activeTab, setActiveTab] = useState('my'); // 'my' or 'danger'
    const [checkedWork, setCheckedWork] = useState({});
    const [checkedDangers, setCheckedDangers] = useState({});
    
    useEffect(() => {
        if (isOpen) {
            setCheckedWork({});
            setCheckedDangers({});
            setActiveTab('my');
        }
    }, [isOpen, nearbyDangers.length, myPlans.length]);

    const toggleWorkCheck = (planIdx, itemIdx) => {
        const key = `${planIdx}-${itemIdx}`;
        setCheckedWork(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleDangerCheck = (dangerIdx) => {
        setCheckedDangers(prev => ({ ...prev, [dangerIdx]: !prev[dangerIdx] }));
    };

    let totalWorkItems = 0;
    myPlans.forEach(plan => {
        if (plan.checklist_items && Array.isArray(plan.checklist_items)) {
            totalWorkItems += plan.checklist_items.length;
        }
    });
    const checkedWorkCount = Object.keys(checkedWork).filter(k => checkedWork[k]).length;
    const isWorkComplete = totalWorkItems === 0 || checkedWorkCount === totalWorkItems;

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
                const planResults = myPlans.map((plan, pIdx) => {
                    const checkedItems = [];
                    if (plan.checklist_items) {
                        plan.checklist_items.forEach((item, iIdx) => {
                            if (checkedWork[`${pIdx}-${iIdx}`]) {
                                checkedItems.push(item);
                            }
                        });
                    }
                    return { plan_id: plan.task_id || plan.id, checked_items: checkedItems };
                });

                const dangerResults = nearbyDangers.map((danger, dIdx) => ({
                    danger_id: danger.danger_id || danger.id,
                    checked: !!checkedDangers[dIdx]
                }));

                onSubmit({ planResults, dangerResults });
            }
            onClose();
        } else {
            if (!isWorkComplete) { setActiveTab('my'); alert(`모든 작업 안전 점검을 완료해주세요. (${checkedWorkCount}/${totalWorkItems})`); }
            else if (!isDangerComplete) { setActiveTab('danger'); alert(`모든 주변 위험 요소를 확인해주세요. (${checkedDangerCount}/${totalDangers})`); }
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
        }}>
            <div 
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(12px)'
                }}
            />
            
            <div style={{
                position: 'relative',
                background: '#0f172a',
                width: '100%',
                maxWidth: '500px',
                height: '92vh',
                borderTopLeftRadius: '32px',
                borderTopRightRadius: '32px',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: 'none'
            }}>
                {/* 헤더 */}
                <div style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '950', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.02em' }}>
                        <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            <ClipboardList color="#60a5fa" size={20} />
                        </div>
                        일일 안전 점검
                    </h2>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '10px', borderRadius: '14px', color: '#94a3b8' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* 탭 메뉴 */}
                <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.5)', padding: '0 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <button onClick={() => setActiveTab('my')} style={{ flex: 1, padding: '1.2rem 1rem', fontSize: '1rem', fontWeight: '800', color: activeTab === 'my' ? '#60a5fa' : '#64748b', borderBottom: activeTab === 'my' ? '3px solid #60a5fa' : '3px solid transparent', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {isWorkComplete ? <CheckCircle size={16} color="#4ade80" /> : <div style={{width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6'}}/>}
                        나의 작업
                        <span style={{ fontSize: '0.75rem', background: isWorkComplete ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.15)', color: isWorkComplete ? '#4ade80' : '#60a5fa', padding: '4px 8px', borderRadius: '8px', fontWeight: '900', marginLeft: '8px' }}>{checkedWorkCount}/{totalWorkItems}</span>
                    </button>
                    <button onClick={() => setActiveTab('danger')} style={{ flex: 1, padding: '1.2rem 1rem', fontSize: '1rem', fontWeight: '800', color: activeTab === 'danger' ? '#f87171' : '#64748b', borderBottom: activeTab === 'danger' ? '3px solid #f87171' : '3px solid transparent', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {isDangerComplete ? <CheckCircle size={16} color="#4ade80" /> : <div style={{width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444'}}/>}
                        위험 요소
                        <span style={{ fontSize: '0.75rem', background: isDangerComplete ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.15)', color: isDangerComplete ? '#4ade80' : '#f87171', padding: '4px 8px', borderRadius: '8px', fontWeight: '900', marginLeft: '8px' }}>{checkedDangerCount}/{totalDangers}</span>
                    </button>
                </div>

                {/* 컨텐츠 영역 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }} className="dark-scrollbar">
                    {activeTab === 'my' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {myPlans.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>할당된 작업이 없습니다.</div>
                            ) : (
                                myPlans.map((plan, pIdx) => (
                                    <div key={pIdx} style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
                                        <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '42px', height: '42px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                <Briefcase size={20} color="#60a5fa" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#f1f5f9' }}>{plan.work_type || plan.description}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{plan.zone_name} • <span style={{ color: '#3b82f6' }}>{plan.level}</span></div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {plan.checklist_items?.map((item, iIdx) => {
                                                const isChecked = !!checkedWork[`${pIdx}-${iIdx}`];
                                                return (
                                                    <div key={iIdx} onClick={() => toggleWorkCheck(pIdx, iIdx)} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '1rem', borderRadius: '16px', background: isChecked ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)', border: isChecked ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer' }}>
                                                        <CheckCircle size={20} color={isChecked ? '#22c55e' : '#475569'} style={{ flexShrink: 0 }} />
                                                        <span style={{ fontSize: '0.95rem', color: isChecked ? '#4ade80' : '#cbd5e1', fontWeight: isChecked ? '700' : '600', textDecoration: isChecked ? 'line-through' : 'none' }}>{item}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'danger' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {nearbyDangers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>위험 요소 없음</div>
                            ) : (
                                nearbyDangers.map((danger, idx) => {
                                    const isChecked = !!checkedDangers[idx];
                                    return (
                                        <div key={idx} onClick={() => toggleDangerCheck(idx)} style={{ background: isChecked ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.03)', border: isChecked ? '1.5px solid rgba(34, 197, 94, 0.4)' : (danger.isMyZone ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'), borderRadius: '24px', overflow: 'hidden', cursor: 'pointer' }}>
                                            <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px', background: isChecked ? 'rgba(34, 197, 94, 0.05)' : (danger.isMyZone ? 'rgba(239, 68, 68, 0.08)' : 'transparent') }}>
                                                <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: isChecked ? '#22c55e' : (danger.color || '#ef4444'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '950', flexShrink: 0, boxShadow: isChecked ? '0 0 15px rgba(34, 197, 94, 0.5)' : `0 0 15px ${danger.color || '#ef4444'}44` }}>
                                                    {isChecked ? <CheckCircle size={24} /> : '!'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontWeight: '900', color: isChecked ? '#4ade80' : '#f1f5f9', fontSize: '1rem' }}>{danger.danger_type} 주의</div>
                                                        {danger.isMyZone && !isChecked && <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: '6px', fontWeight: '900' }}>내 구역</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}><strong style={{ color: '#3b82f6' }}>[{danger.zone_name}]</strong> {danger.description}</div>
                                                </div>
                                            </div>
                                            <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'flex-end' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isChecked ? '#4ade80' : '#64748b' }}>{isChecked ? "위험 요소를 확인했습니다" : "확인하려면 터치하세요"}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* 하단 버튼 (중요: 네비바를 고려하여 paddingBottom 추가) */}
                <div style={{ 
                    padding: '1.5rem', 
                    paddingBottom: '100px', // 네비게이션 바 위로 올리기 위한 여백
                    background: 'rgba(30, 41, 59, 0.9)', 
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.3)' 
                }}>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitted && !canSubmit}
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            borderRadius: '24px',
                            border: 'none',
                            background: isSubmitted ? 'rgba(148, 163, 184, 0.15)' : (canSubmit ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.05)'),
                            color: isSubmitted ? '#94a3b8' : (canSubmit ? 'white' : '#64748b'),
                            fontSize: '1.15rem',
                            fontWeight: '950',
                            cursor: 'pointer',
                            transition: 'all 0.4s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                        }}
                    >
                        {isSubmitted ? "점검 완료됨 (닫기)" : (canSubmit ? "완료 및 작업 시작" : "미완료 항목이 있습니다")}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .dark-scrollbar::-webkit-scrollbar { width: 6px; }
                .dark-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default DailyChecklistModal;
