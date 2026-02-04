import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import apiClient from '../../../api/client';
import { workApi } from '../../../api/workApi';
import { safetyApi } from '../../../api/safetyApi';
import WorkerWorkSiteMap from '../components/dashboard/WorkerWorkSiteMap';
import '../styles/WorkerDashboard.css';

/**
 * 안전지도 탭: 나의 작업 구역 + 금일 위험 구역만 표시.
 * 매니저 일일 작업 계획 지도와 동일한 구역 사각형으로 내 위치·위험 구역 표시.
 */
const SafetyMap = () => {
  const [myPlans, setMyPlans] = useState([]);
  const [myRisks, setMyRisks] = useState([]);
  const [allZones, setAllZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, risksRes] = await Promise.all([
          workApi.getMyTodayWork(),
          apiClient.get('/worker/my-risks/today')
        ]);
        setMyPlans(plansRes || []);
        setMyRisks(Array.isArray(risksRes?.data) ? risksRes.data : []);
      } catch (err) {
        console.error('안전지도 데이터 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const siteId = myPlans.length > 0 ? myPlans[0].site_id : null;
  useEffect(() => {
    if (siteId == null) {
      setAllZones([]);
      return;
    }
    safetyApi.getZones(siteId).then((data) => setAllZones(data || [])).catch(() => setAllZones([]));
  }, [siteId]);

  const mapHeight = typeof window !== 'undefined' ? Math.max(320, window.innerHeight - 160) : 400;

  return (
    <div style={{ padding: '0.75rem', paddingBottom: '80px', minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MapPin size={20} color="#3b82f6" />
        <h1 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
          안전지도
        </h1>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', marginTop: 0 }}>
        나의 작업 현장과 그날 설정된 위험 구역입니다. 매니저가 설정한 구역과 동일하게 표시됩니다.
      </p>

      {loading ? (
        <div style={{ height: mapHeight, background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          로딩 중...
        </div>
      ) : (
        <WorkerWorkSiteMap plans={myPlans} risks={myRisks} allZones={allZones} height={mapHeight} showLegend />
      )}

      {myRisks.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
          <div style={{ fontWeight: '700', color: '#dc2626', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={18} /> 금일 위험 구역 요약
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#991b1b' }}>
            {myRisks.map((r, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{r.name}: {r.description}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SafetyMap;
