import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, AlertTriangle, ShieldAlert, MapPin, Radio } from 'lucide-react';

const Emergency = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(null);
    const [isSent, setIsSent] = useState(false);

    const handleSOS = () => {
        if (isSent) return;
        setCountdown(3);
    };

    useEffect(() => {
        if (countdown === null) return;
        
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsSent(true);
            setCountdown(null);
            // 실제 환경에서는 여기서 API 호출 (긴급 알림 발송)
            alert('관리실 및 안전 관리자에게 긴급 SOS 알림이 전송되었습니다.\n현재 위치: 서울 디지털 본사 본관 2층 (ID: ZONE-B102)');
        }
    }, [countdown]);

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #1e1b4b 0%, #450a0a 100%)', 
            padding: '1.5rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Pretendard', sans-serif"
        }}>
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer',
                        padding: '12px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ marginLeft: '1rem', fontSize: '1.25rem', fontWeight: '800' }}>긴급 상황 제보</h2>
            </header>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        padding: '8px 16px', 
                        background: 'rgba(239, 68, 68, 0.2)', 
                        borderRadius: '100px', 
                        color: '#f87171',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Radio size={14} className="animate-pulse" /> EMERGENCY BROADCAST
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: '0 0 1rem 0', letterSpacing: '-0.02em' }}>
                        위험 상황 발생
                    </h1>
                    <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.6' }}>
                        사고가 발생했거나 즉각적인 도움이 필요한 경우<br />
                        아래의 <span style={{ color: '#ef4444', fontWeight: '800' }}>SOS 버튼</span>을 눌러주세요.
                    </p>
                </div>

                {/* SOS Button Area */}
                <div style={{ position: 'relative' }}>
                    {/* Ring Animations */}
                    {!isSent && countdown === null && (
                        <>
                            <div style={{ 
                                position: 'absolute', inset: '-20px', borderRadius: '50%', 
                                border: '2px solid rgba(239, 68, 68, 0.3)', 
                                animation: 'ring-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' 
                            }} />
                            <div style={{ 
                                position: 'absolute', inset: '-40px', borderRadius: '50%', 
                                border: '1px solid rgba(239, 68, 68, 0.15)', 
                                animation: 'ring-ping 3s cubic-bezier(0, 0, 0.2, 1) infinite' 
                            }} />
                        </>
                    )}

                    <button 
                        onClick={handleSOS}
                        disabled={isSent}
                        style={{ 
                            width: '200px', 
                            height: '200px', 
                            borderRadius: '50%', 
                            background: isSent ? '#475569' : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                            border: '8px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 20px 50px rgba(239, 68, 68, 0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            transform: countdown !== null ? 'scale(1.1)' : 'scale(1)',
                            position: 'relative',
                            zIndex: 10
                        }}
                    >
                        {countdown !== null ? (
                            <span style={{ fontSize: '5rem', fontWeight: '900', color: 'white' }}>{countdown}</span>
                        ) : isSent ? (
                            <>
                                <ShieldAlert size={64} color="white" />
                                <span style={{ marginTop: '12px', fontWeight: '900', fontSize: '1.2rem' }}>SENT</span>
                            </>
                        ) : (
                            <>
                                <AlertTriangle size={64} style={{ marginBottom: '8px' }} color="white" />
                                <span style={{ fontSize: '2rem', fontWeight: '950', letterSpacing: '2px', color: 'white' }}>SOS</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Info Panel */}
                <div style={{ 
                    width: '100%', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: '24px', 
                    padding: '1.5rem', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc' }}>
                        <Radio size={20} color="#ef4444" /> 실시간 조치 프로세스
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', flexShrink: 0 }}>1</div>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1' }}>현장 안전 관리자 및 관제실 비상 알림 즉시 송출</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', flexShrink: 0 }}>2</div>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1' }}>인근 50m 내 모든 근로자 앱으로 대피 경보 발송</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', flexShrink: 0 }}>3</div>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1' }}>정밀 GPS 기반 위치 추적 및 실시간 상태 모니터링 시작</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <MapPin size={16} /> 현재 위치 수신됨: 서울특별시 중구 세종대로 110 가열 12구역
                </div>
            </div>

            {/* CSS for Keyframes */}
            <style>
                {`
                @keyframes ring-ping {
                    0% { transform: scale(1); opacity: 1; }
                    75%, 100% { transform: scale(1.5); opacity: 0; }
                }
                .animate-pulse {
                    animation: emergency-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes emergency-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
                `}
            </style>
        </div>
    );
};

export default Emergency;
