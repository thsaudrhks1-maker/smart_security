
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { safetyApi } from '@/api/safetyApi';
import { workApi } from '@/api/workApi';
import { Shield, Bell, Map as MapIcon, Info, LayoutDashboard } from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import AttendanceCard from './AttendanceCard';
import DashboardCards from './DashboardCards';
import DangerReportModal from './DangerReportModal';
import DangerZoneDetailModal from './DangerZoneDetailModal';
import { SafetyGuideModal } from './DashboardModals';

const WorkerDashboard = () => {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [zones, setZones] = useState([]);
    const [plans, setPlans] = useState([]);
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);
    const [selectedRisk, setSelectedRisk] = useState(null);

    const loadData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const [zonesRes, plansRes, risksRes] = await Promise.all([
                safetyApi.getZones(),
                workApi.getPlans({ date: today }),
                safetyApi.getDailyDangerZones(today)
            ]);
            setZones(zonesRes || []);
            setPlans(plansRes || []);
            setRisks(risksRes || []);
            
            if (zonesRes?.length > 0) {
              setProject({
                lat: zonesRes[0].lat,
                lng: zonesRes[0].lng,
                id: zonesRes[0].site_id
              });
            }
        } catch (e) {
            console.error('근로자 대시보드 로드 실패', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const myPlan = plans.find(p => p.worker_ids?.includes(user?.id));

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.25rem', color: '#1e293b', paddingBottom: '100px' }}>
            {/* 상단 알림 및 인사 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                   <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>안전한 하루 되세요! 🛡️</h2>
                   <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}><strong>{user?.full_name}</strong> 님, 오늘도 안전 작업 하세요.</p>
                </div>
                <button 
                  onClick={() => setIsGuideModalOpen(true)}
                  style={{ width: '45px', height: '45px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '15px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Bell size={22} />
                </button>
            </div>

            {/* 메인 출석 카드 */}
            <AttendanceCard projectInfo={{ project_id: project?.id, project_name: '금일 현장' }} />

            <div style={{ height: '24px' }} />

            {/* 핵심 요약 카드 */}
            <DashboardCards 
              zonesCount={zones.length} 
              risksCount={risks.length} 
              myWorkZone={myPlan ? myPlan.zone_name : '미배정'} 
            />

            {/* 실시간 현장 지도 영역 */}
            <section style={{ background: 'white', padding: '1.25rem', borderRadius: '28px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapIcon size={20} color="#3b82f6" /> 실시간 현장 지도
                </h3>
              </div>
              <div style={{ height: '350px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                {project && (
                  <CommonMap 
                    center={[project.lat, project.lng]}
                    zoom={18}
                    markers={risks.map(r => ({ lat: r.lat, lng: r.lng, title: `위험: ${r.risk_type}`, color: 'red' }))}
                    onMapClick={(e) => {
                      setSelectedZone({ lat: e.latlng.lat, lng: e.latlng.lng, id: 1, name: '선택 구역' });
                      setIsReportModalOpen(true);
                    }}
                  />
                )}
              </div>
              <div style={{ marginTop: '1rem', padding: '12px', background: '#f8fafc', borderRadius: '15px', fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '8px' }}>
                <Info size={16} color="#3b82f6" />
                <span>지도를 클릭하여 **위험 요소를 즉시 신고**할 수 있습니다.</span>
              </div>
            </section>

            {/* 모달 모음 */}
            <DangerReportModal 
              open={isReportModalOpen} 
              onClose={() => setIsReportModalOpen(false)} 
              zone={selectedZone}
              onSuccess={loadData}
            />
            <SafetyGuideModal 
              isOpen={isGuideModalOpen} 
              onClose={() => setIsGuideModalOpen(false)} 
            />
        </div>
    );
};

export default WorkerDashboard;
