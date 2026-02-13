import React, { useState, useEffect } from 'react';
import './DataFlowDemo.css';

const DataFlowDemo = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [stats, setStats] = useState({
    apiCalls: 0,
    aiProcessed: 0,
    dbStored: 0
  });

  useEffect(() => {
    // 자동 스텝 진행
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);

    // 숫자 카운터 애니메이션
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        apiCalls: Math.min(prev.apiCalls + 1, 472),
        aiProcessed: Math.min(prev.aiProcessed + 1, 450),
        dbStored: Math.min(prev.dbStored + 1, 450)
      }));
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, []);

  const steps = [
    {
      id: 'api',
      title: 'CSI API',
      subtitle: '국토안전관리원',
      icon: '🌐',
      description: '실시간 사고 데이터 수집'
    },
    {
      id: 'ai',
      title: 'Gemini AI',
      subtitle: 'Google AI',
      icon: '🤖',
      description: '자연어 처리 & 요약'
    },
    {
      id: 'vector',
      title: 'Vector DB',
      subtitle: 'pgvector',
      icon: '🧠',
      description: '임베딩 저장 & 검색'
    },
    {
      id: 'app',
      title: 'Smart App',
      subtitle: '스마트 안전',
      icon: '📱',
      description: '근로자 맞춤 안전 정보'
    }
  ];

  return (
    <div className="data-flow-container">
      {/* 헤더 */}
      <div className="flow-header">
        <h1 className="flow-title">
          <span className="gradient-text">AI 기반 건설안전</span> 데이터 파이프라인
        </h1>
        <p className="flow-subtitle">실시간 사고 데이터 수집 → AI 분석 → 맞춤형 안전 정보 제공</p>
      </div>

      {/* 통계 대시보드 */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.apiCalls}</div>
          <div className="stat-label">API 호출</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{stats.aiProcessed}</div>
          <div className="stat-label">AI 처리</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-value">{stats.dbStored}</div>
          <div className="stat-label">DB 저장</div>
        </div>
      </div>

      {/* 데이터 플로우 시각화 */}
      <div className="flow-pipeline">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* 스텝 카드 */}
            <div className={`flow-step ${activeStep === index ? 'active' : ''} ${activeStep > index ? 'completed' : ''}`}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-subtitle">{step.subtitle}</p>
                <p className="step-description">{step.description}</p>
              </div>
              <div className="step-pulse"></div>
            </div>

            {/* 화살표 (마지막 제외) */}
            {index < steps.length - 1 && (
              <div className={`flow-arrow ${activeStep > index ? 'active' : ''}`}>
                <div className="arrow-line"></div>
                <div className="arrow-head">➤</div>
                <div className="data-particles">
                  <span className="particle"></span>
                  <span className="particle"></span>
                  <span className="particle"></span>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 실시간 로그 */}
      <div className="live-log">
        <div className="log-header">
          <span className="log-title">🔴 실시간 처리 로그</span>
          <span className="log-status">LIVE</span>
        </div>
        <div className="log-content">
          <div className="log-line">✅ [CSI] 페이지 14 조회 완료 (20건)</div>
          <div className="log-line">🤖 [AI] Gemini 요약 생성 중...</div>
          <div className="log-line">💾 [DB] 벡터 임베딩 저장 완료</div>
          <div className="log-line active">📱 [APP] 근로자에게 안전 알림 전송</div>
        </div>
      </div>
    </div>
  );
};

export default DataFlowDemo;
