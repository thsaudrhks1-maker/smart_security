
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, MapPin, ClipboardList, Briefcase } from 'lucide-react';

const DailyChecklistModal = ({ isOpen, onClose, myPlan, dangerCount, onSubmit }) => {
    const [checkedItems, setCheckedItems] = useState({});
    
    // 기본 공통 점검 항목 (DB 데이터가 없을 경우 대비)
    const defaultChecklist = [
        "안전모착용 및 턱끈상태 확인",
        "개인 보호구(안전화, 각반 등) 착용 확인",
        "작업장 주변 정리정돈 상태 확인",
        "비상 대피로 확보 확인",
        "작업 도구 및 장비 점검"
    ];

    // myPlan에서 checklist_items 가져오기 (없으면 기본값 사용)
    const checklistItems = (myPlan?.checklist_items && Array.isArray(myPlan.checklist_items) && myPlan.checklist_items.length > 0) 
        ? myPlan.checklist_items 
        : defaultChecklist;

    // 모달 열릴 때 초기화
    useEffect(() => {
        if (isOpen) {
            const initialChecked = {};
            checklistItems.forEach((item, idx) => {
                initialChecked[idx] = false;
            });
            setCheckedItems(initialChecked);
        }
    }, [isOpen, checklistItems]);

    const handleCheck = (idx) => {
        setCheckedItems(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    const isAllChecked = checklistItems.length > 0 && checklistItems.every((_, idx) => checkedItems[idx]);

    const handleSubmit = () => {
        if (isAllChecked) {
            if (onSubmit) onSubmit();
            onClose();
        } else {
            alert("모든 항목을 확인해주세요.");
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, 
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'flex-end', // 모바일에서는 아래에서 올라오는 것이 자연스러움
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'white',
                width: '100%',
                maxWidth: '600px',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '2rem 1.5rem',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* 헤더 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={28} /> 일일 안전점검
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                {/* 내 작업 정보 요약 */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '700' }}>작업 위치</span>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={16} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                            {myPlan ? `${myPlan.level} ${myPlan.zone_name}` : '미배정'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '700' }}>작업 내용</span>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: '#3b82f6' }}>
                            {myPlan ? (myPlan.work_type || myPlan.description) : '작업 없음'}
                        </span>
                    </div>
                </div>

                {/* 위험 요소 알림 */}
                {dangerCount > 0 && (
                    <div style={{ background: '#fff1f2', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertTriangle size={24} color="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#991b1b' }}>주변 위험 요소 {dangerCount}건</div>
                            <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>작업 시 각별히 주의하세요.</div>
                        </div>
                    </div>
                )}

                {/* 체크리스트 */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', color: '#1e293b' }}>필수 점검 항목</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {checklistItems.map((item, idx) => (
                        <div 
                            key={idx}
                            onClick={() => handleCheck(idx)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '1rem',
                                borderRadius: '12px',
                                background: checkedItems[idx] ? '#f0fdf4' : 'white',
                                border: checkedItems[idx] ? '1px solid #10b981' : '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                border: checkedItems[idx] ? 'none' : '2px solid #cbd5e1',
                                background: checkedItems[idx] ? '#10b981' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {checkedItems[idx] && <CheckCircle size={16} color="white" />}
                            </div>
                            <span style={{ 
                                fontSize: '0.95rem', 
                                fontWeight: checkedItems[idx] ? '700' : '500', 
                                color: checkedItems[idx] ? '#166534' : '#475569',
                                textDecoration: checkedItems[idx] ? 'none' : 'none'
                            }}>
                                {item}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 제출 버튼 */}
                <button
                    onClick={handleSubmit}
                    disabled={!isAllChecked}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        marginTop: '2rem',
                        borderRadius: '16px',
                        border: 'none',
                        background: isAllChecked ? '#10b981' : '#cbd5e1',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        cursor: isAllChecked ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s',
                        boxShadow: isAllChecked ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                >
                    {isAllChecked ? '점검 완료했습니다' : `${Object.values(checkedItems).filter(Boolean).length}/${checklistItems.length} 항목 확인 중`}
                </button>
                
                <style>{`
                    @keyframes slideUp {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default DailyChecklistModal;
