
import React, { useState, useEffect } from 'react';
import { safetyApi } from '@/api/safetyApi';
import { Map as MapIcon, AlertTriangle, Info, Plus } from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import DangerReportModal from '../dashboard/DangerReportModal';

const SafetyMap = () => {
    const [zones, setZones] = useState([]);
    const [risks, setRisks] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const [zRes, rRes] = await Promise.all([
                    safetyApi.getZones(),
                    safetyApi.getDailyDangerZones(today)
                ]);
                setZones(zRes || []);
                setRisks(rRes || []);
                if (zRes?.length > 0) {
                    setProject({ lat: zRes[0].lat, lng: zRes[0].lng, id: zRes[0].site_id });
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    return (
        <div style={{ height: 'calc(100vh - 70px)', position: 'relative', background: '#f8fafc' }}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 1000 }}>
                <div style={{ background: 'white', padding: '12px 20px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapIcon size={20} color="#3b82f6" />
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '900' }}>실시간 안전 현황판</h2>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ef4444' }}>
                        위험 {risks.length}건 감지됨
                    </div>
                </div>
            </div>

            {project ? (
                <CommonMap 
                    center={[project.lat, project.lng]}
                    zoom={18}
                    markers={risks.map(r => ({ lat: r.lat, lng: r.lng, title: `위험: ${r.risk_type}`, color: 'red' }))}
                    onMapClick={(e) => {
                        setSelectedZone({ lat: e.latlng.lat, lng: e.latlng.lng, id: 1, name: '현장 지점' });
                        setIsReportOpen(true);
                    }}
                />
            ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>지도를 불러오는 중...</div>
            )}

            <div style={{ position: 'absolute', bottom: '100px', left: '20px', right: '20px', zIndex: 1000 }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.9)', color: 'white', padding: '15px', borderRadius: '20px', backdropFilter: 'blur(8px)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <Info size={18} color="#f59e0b" />
                        <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>안전 신고 안내</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>현장 내 위험 요소를 발견하셨나요? <strong>지도의 해당 위치를 길게 눌러</strong> 즉시 신고해 주세요.</p>
                </div>
            </div>

            <DangerReportModal 
                open={isReportOpen} 
                onClose={() => setIsReportOpen(false)} 
                zone={selectedZone}
                onSuccess={() => {}} 
            />
        </div>
    );
};

export default SafetyMap;
