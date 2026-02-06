import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, AlertTriangle } from 'lucide-react';
import '../work/WorkStyles.css';

const Emergency = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(null);

  const handleSOS = () => {
    // 3�?카운?�다?????�고 ?�수 ?��??�이??    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      alert('관?�실�??�전 관리자?�게 긴급 ?�림???�송?�었?�니??\n(?�재 ?�치: ?�울빌딩 2�?');
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
          <h1 className="text-danger" style={{ fontSize: '2.5rem' }}>긴급 ?�황 ?�보</h1>
          <p>?�고 발생 ???�래 버튼??길게 ?�르?�요.</p>
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
          <h3>?�️ ?�동 조치 ?�항</h3>
          <ul style={{ textAlign: 'left', marginTop: '1rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>?�장 관리자?�게 비상 ?�림 발송</li>
            <li>?�근 근로?�에�??�??경보 발송</li>
            <li>?�재 GPS ?�치 ?�동 ?�송</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
