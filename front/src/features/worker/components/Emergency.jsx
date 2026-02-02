import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, AlertTriangle } from 'lucide-react';
import '../work/WorkStyles.css';

const Emergency = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(null);

  const handleSOS = () => {
    // 3초 카운트다운 후 신고 접수 시뮬레이션
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      alert('관제실과 안전 관리자에게 긴급 알림이 전송되었습니다!\n(현재 위치: 서울빌딩 2층)');
      setCountdown(null);
    }
  }, [countdown]);

  return (
    <div className="container" style={{ padding: '1rem', height: '100vh', justifyContent: 'center' }}>
      <header style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <ArrowLeft size={32} />
        </button>
      </header>

      <div className="emergency-container animate-fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-danger" style={{ fontSize: '2.5rem' }}>긴급 상황 통보</h1>
          <p>사고 발생 시 아래 버튼을 길게 누르세요.</p>
        </div>

        <button className="sos-button" onClick={handleSOS}>
          {countdown !== null ? (
            <span style={{ fontSize: '4rem' }}>{countdown}</span>
          ) : (
            <>
              <AlertTriangle size={48} style={{ marginBottom: '1rem' }} />
              SOS
            </>
          )}
        </button>

        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem', width: '100%' }}>
          <h3>⛑️ 자동 조치 사항</h3>
          <ul style={{ textAlign: 'left', marginTop: '1rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>현장 관리자에게 비상 알림 발송</li>
            <li>인근 근로자에게 대피 경보 발송</li>
            <li>현재 GPS 위치 자동 전송</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
