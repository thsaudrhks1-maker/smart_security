
import React, { useState, useEffect, useMemo } from 'react';
import { workApi } from '@/api/workApi';
import { safetyApi } from '@/api/safetyApi';
import { getManagerDashboard } from '@/api/authApi';
import { 
  Calendar, Map as MapIcon, Plus, Users, 
  ChevronRight, ChevronLeft, Filter, AlertTriangle 
} from 'lucide-react';
import UniversalBlueprintMap from '@/components/common/map/UniversalBlueprintMap';

const DailyPlanManagement = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedLevel, setSelectedLevel] = useState('ALL');
    const [zones, setZones] = useState([]);
    const [plans, setPlans] = useState([]);
    const [dangerZones, setDangerZones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [siteId, setSiteId] = useState(null);
    const [blueprint, setBlueprint] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);

    const filteredZones = useMemo(() => {
        return selectedLevel === 'ALL' ? zones : zones.filter(z => z.level === selectedLevel);
    }, [zones, selectedLevel]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [plansRes, zonesRes, dangerRes] = await Promise.all([
                workApi.getPlans({ date: selectedDate }),
                siteId ? safetyApi.getZones(siteId) : safetyApi.getZones(),
                safetyApi.getDailyDangerZones(selectedDate)
            ]);
            setPlans(plansRes || []);
            setZones(zonesRes || []);
            setDangerZones(dangerRes || []);
        } catch (err) {
            console.error('데이터 로드 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSiteInfo = async () => {
            const dash = await getManagerDashboard();
            if (dash?.project_info?.id) {
                setSiteId(dash.project_info.id);
                // 도면 설정 (임시)
                setBlueprint({
                    url: 'https://images.unsplash.com/photo-1503387762-592dea58ed23?auto=format&fit=crop&w=1200',
                    config: { lat: dash.project_info.lat, lng: dash.project_info.lng, width: 0.005, height: 0.005 }
                });
            }
        };
        fetchSiteInfo();
    }, []);

    useEffect(() => {
        loadData();
    }, [selectedDate, siteId]);

    const handleZoneClick = (zone) => {
        setSelectedZone(zone);
        setIsModalOpen(true);
    };

    return (
        <div style={{ padding: '20px', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>📅 일일 작업 및 인력 관리</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>일자별 작업 계획을 수립하고 현장 구역별 인력을 배정합니다.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={e => setSelectedDate(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                {/* 메인 지도 영역 */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['ALL', '1F', '2F', '3F'].map(lv => (
                                <button 
                                    key={lv}
                                    onClick={() => setSelectedLevel(lv)}
                                    style={{ 
                                        padding: '4px 12px', borderRadius: '6px', fontSize: '13px', border: '1px solid',
                                        background: selectedLevel === lv ? '#3b82f6' : 'white',
                                        color: selectedLevel === lv ? 'white' : '#64748b',
                                        borderColor: selectedLevel === lv ? '#3b82f6' : '#e2e8f0',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {lv}
                                </button>
                            ))}
                        </div>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>* 구역을 클릭하여 작업을 할당하세요.</span>
                    </div>
                    <UniversalBlueprintMap 
                        blueprintUrl={blueprint?.url}
                        blueprintConfig={blueprint?.config}
                        zones={filteredZones}
                        plans={plans}
                        risks={dangerZones}
                        onZoneClick={handleZoneClick}
                    />
                </div>

                {/* 우측 작업 상세 리스트 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={18} /> 오늘 작업 요약
                        </h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '10px' }}>
                                <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>총 작업 건수</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>{plans.length} 건</div>
                            </div>
                            <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '10px' }}>
                                <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold' }}>위험 구역</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>{dangerZones.length} 개소</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'white', flex: 1, padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>작업 및 인력 배정 현황</h3>
                        {plans.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>배정된 작업이 없습니다.</div>
                        ) : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {plans.map(p => (
                                    <div key={p.id} style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '10px', background: '#fcfcfc' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{p.work_type}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>장소: {p.location || '미정'}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 작업 할당 모달 */}
            {isModalOpen && (
                <AssignModal 
                    zone={selectedZone} 
                    date={selectedDate} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => { setIsModalOpen(false); loadData(); }} 
                />
            )}
        </div>
    );
};

const AssignModal = ({ zone, date, onClose, onSuccess }) => {
    const [workType, setWorkType] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await workApi.createPlan({
                zone_id: zone.id,
                date: date,
                work_type: workType,
                site_id: zone.site_id
            });
            alert('작업이 성공적으로 배정되었습니다.');
            onSuccess();
        } catch (err) {
            console.error(err);
            alert('배정 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '400px' }}>
                <h2 style={{ margin: '0 0 20px 0' }}>작업 배정 - {zone.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>작업 유형</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="예: 철근 조립, 콘크리트 타설"
                            value={workType} 
                            onChange={e => setWorkType(e.target.value)} 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>취소</button>
                        <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                            {loading ? '배정 중..' : '작업 배정'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DailyPlanManagement;
