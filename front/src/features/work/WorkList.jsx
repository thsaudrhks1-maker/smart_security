import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import './WorkStyles.css';

// 더미 데이터: 실제 작업 리스트
const dummyWorks = [
  { id: 1, title: '지상 2층 슬래브 거푸집 설치', location: '202호', time: '08:00 ~ 17:00', status: '진행중', risk: '추락 위험' },
  { id: 2, title: '지하 1층 자재 정리', location: '자재 창고', time: '13:00 ~ 15:00', status: '대기', risk: '협착 위험' }
];

const WorkList = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <header className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <ArrowLeft />
        </button>
        <h2>금일 나의 작업</h2>
      </header>

      <div className="work-list">
        {dummyWorks.map((work) => (
          <div key={work.id} className="glass-panel work-card animate-fade-in">
            <h3 style={{ marginBottom: '0.5rem' }}>{work.title}</h3>
            <p className="text-sm"><span className="text-accent">📍 {work.location}</span> | 🕒 {work.time}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center' }}>
              <span className="text-danger" style={{ fontSize: '0.9rem' }}>⚠️ {work.risk}</span>
              <span className={`work-status ${work.status === '진행중' ? 'status-pending' : 'status-done'}`}>
                {work.status}
              </span>
            </div>
            {/* 작업 시작/종료 시뮬레이션 버튼 */}
            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.8rem' }}>
              작업 시작 보고
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkList;
