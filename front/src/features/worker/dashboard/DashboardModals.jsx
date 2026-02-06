
import React from 'react';
import { X, Info, ShieldAlert, CheckCircle } from 'lucide-react';

/**
 * [WORKER] 대시보드 내 공통 활용 모달 모음
 */
export const SafetyGuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={24} color="#3b82f6" />
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900' }}>오늘의 안전 가이드</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <GuideItem icon={<ShieldAlert color="#f59e0b" />} title="보호구 착용 필수" desc="안전모, 안전화 미착용 시 구역 출입이 제한됩니다." />
                    <GuideItem icon={<CheckCircle color="#10b981" />} title="추락 사고 주의" desc="개구부 및 단부 작업 시 안전고리를 반드시 체결하세요." />
                </div>
                <button 
                    onClick={onClose}
                    style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' }}
                >
                    확인하였습니다
                </button>
            </div>
        </div>
    );
};

const GuideItem = ({ icon, title, desc }) => (
    <div style={{ display: 'flex', gap: '12px', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
        <div style={{ marginTop: '2px' }}>{icon}</div>
        <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e293b' }}>{title}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{desc}</div>
        </div>
    </div>
);
