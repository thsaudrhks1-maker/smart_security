
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/api/projectApi';
import { safetyApi } from '@/api/safetyApi';
import { workApi } from '@/api/workApi';
import { 
  Calendar, Map as MapIcon, Layers, Plus, 
  Users, AlertTriangle, CheckCircle2, ChevronRight, X,
  ClipboardList
} from 'lucide-react';
import CommonMap from '@/components/common/CommonMap';
import BuildingSectionView from './BuildingSectionView';

/**
 * [MANAGER] 일일 작업 계획 관리
 */
const DailyPlanManagement = () => {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [zones, setZones] = useState([]);
    const [plans, setPlans] = useState([]);
    const [risks, setRisks] = useState([]);
    
    const [selectedLevel, setSelectedLevel] = useState('1F');
    const [selectedZone, setSelectedZone] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const siteId = user?.project_id || 1;
            const [projRes, zoneRes, planRes] = await Promise.all([
                projectApi.getProject(siteId),
                safetyApi.syncZonesByBlueprint(siteId),
                workApi.getPlans({ date: selectedDate })
            ]);

            const projectData = projRes.data?.data;
            const zoneData = zoneRes.data || zoneRes;
            const planData = planRes.data || planRes;

            if (projectData) setProject(projectData);
            setZones(Array.isArray(zoneData) ? zoneData : []);
            setPlans(Array.isArray(planData) ? planData.data || planData : []);
            setRisks([]); 
        } catch (e) {
            console.error('데이터 로드 실패', e);
        } finally {
            setLoading(false);
        }
    };

    const handleZoneClick = (zone) => {
        setSelectedZone(zone);
        setIsModalOpen(true);
    };

    return (
        <div style={{ padding: '2rem', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', color: '#1e293b', background: '#f8fafc' }}>
            {isModalOpen && (
                <ZoneSettingModal 
                    zone={selectedZone} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={(data) => {
                        console.log('저장:', data);
                        setIsModalOpen(false);
                        // 실제 DB 저장 로직 (workApi.assignWork) 호출 예정
                    }}
                />
            )}

            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                   <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '16px' }}>
                     <Calendar size={40} color="#3b82f6" />
                   </div>
                   <div>
                      <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>일일 작업 계획</h1>
                      <div style={{ display: 'flex', gap: '15px', marginTop: '8px', color: '#64748b', fontSize: '1rem' }}>
                         <span style={{ fontWeight: '800', color: '#3b82f6' }}>{project?.name || '프로젝트 정보 로딩 중...'}</span>
                         <span style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '15px' }}>📍 {project?.location_address || '위치 정보 없음'}</span>
                      </div>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f8fafc', padding: '15px 30px', borderRadius: '20px', border: '2px solid #3b82f6' }}>
                    <Calendar size={24} color="#3b82f6" />
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '900', fontSize: '1.4rem', color: '#1e40af', cursor: 'pointer' }} 
                    />
                </div>
            </header>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '250px 2fr 1.2fr', gap: '1.5rem', minHeight: 0 }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <BuildingSectionView project={project} allZones={zones} activeLevel={selectedLevel} onLevelChange={setSelectedLevel} />
                </div>

                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontWeight: '800' }}>
                        <MapIcon size={20} color="#3b82f6" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> {selectedLevel} 평면 구역도
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        {project?.lat && (
                            <CommonMap 
                                center={[project.lat, project.lng]} 
                                zoom={20} 
                                highlightLevel={selectedLevel} 
                                onZoneClick={handleZoneClick} 
                                plans={plans} 
                                risks={risks}
                                gridConfig={{ rows: project.grid_rows, cols: project.grid_cols, spacing: project.grid_spacing }}
                            />
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
                    <div style={{ flex: 1, background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', background: '#eff6ff', borderBottom: '1px solid #dbeafe', fontWeight: '800', color: '#1e40af' }}>일일 작업 ({selectedLevel})</div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {plans.filter(p => p.level === selectedLevel).length === 0 ? <EmptyState text="작업 없음" /> : plans.filter(p => p.level === selectedLevel).map(p => <PlanItem key={p.id} plan={p} />)}
                        </div>
                    </div>
                    <div style={{ flex: 1, background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', background: '#fff1f2', borderBottom: '1px solid #ffe4e6', fontWeight: '800', color: '#9f1239' }}>위험 구역 ({selectedLevel})</div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            <EmptyState text="위험 구역 없음" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ZoneSettingModal = ({ zone, onClose, onSave }) => {
    const [formData, setFormData] = useState({ work_type: '', risk_type: 'NORMAL', worker_count: 0 });
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', width: '400px', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: '900', color: '#0f172a' }}>{zone.name} 설정</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label>작업 유형</label>
                    <select value={formData.work_type} onChange={e => setFormData({...formData, work_type: e.target.value})} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <option value="">선택</option>
                        <option value="토목">토목</option><option value="건축">건축</option>
                    </select>
                    <label>인원 배정</label>
                    <input type="number" value={formData.worker_count} onChange={e => setFormData({...formData, worker_count: e.target.value})} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontWeight: '700' }}>취소</button>
                        <button onClick={() => onSave(formData)} style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '900' }}>저장</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PlanItem = ({ plan }) => (
    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '10px' }}>
        <div style={{ fontWeight: '800' }}>{plan.zone_name}</div>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{plan.work_type} | {plan.worker_count}명</div>
    </div>
);

const EmptyState = ({ text }) => <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{text}</div>;

export default DailyPlanManagement;
