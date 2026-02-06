
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { projectApi } from '@/api/projectApi';
import { safetyApi } from '@/api/safetyApi';
import { workApi } from '@/api/workApi';
import { dangerApi } from '@/api/dangerApi';
import { 
  Calendar, Map as MapIcon, Layers, Plus, 
  Users, AlertTriangle, CheckCircle2, ChevronRight, X,
  ClipboardList, Edit2, Trash2, UserPlus
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
    const [dangers, setDangers] = useState([]);
    const [approvedWorkers, setApprovedWorkers] = useState([]);
    
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
            let siteId = user?.project_id;
            if (!siteId) {
                const listRes = await projectApi.getProjects().catch(() => ({ data: { data: [] } }));
                const list = listRes?.data?.data || [];
                siteId = list.length > 0 ? list[0].id : 1;
            } else {
                siteId = Number(siteId);
            }
            
            const [projRes, zonesDetailRes, detailRes] = await Promise.all([
                projectApi.getProject(siteId),
                projectApi.getZonesWithDetails(siteId, selectedDate),
                projectApi.getProjectDetail(siteId)
            ]);

            const projectData = projRes.data?.data;
            const zonesWithDetails = zonesDetailRes?.data?.data || [];

            if (projectData) setProject(projectData);
            
            // 구역별 상세 정보 (tasks, dangers 포함)
            setZones(zonesWithDetails);
            
            // plans와 dangers를 별도로 추출하여 기존 로직 호환
            const allPlans = [];
            const allDangers = [];
            
            zonesWithDetails.forEach(zone => {
                (zone.tasks || []).forEach(task => {
                    allPlans.push({
                        ...task,
                        zone_name: zone.name,
                        level: zone.level
                    });
                });
                
                (zone.dangers || []).forEach(danger => {
                    allDangers.push({
                        ...danger,
                        zone_name: zone.name,
                        level: zone.level
                    });
                });
            });
            
            setPlans(allPlans);
            setDangers(allDangers);
            
            // 승인된 작업자 목록
            setApprovedWorkers(detailRes?.data?.data?.approved_workers || []);
        } catch (e) {
            console.error('데이터 로드 실패', e);
        } finally {
            setLoading(false);
        }
    };

    const handleZoneClick = async (zone) => {
        setSelectedZone(zone);
        setIsModalOpen(true);
    };

    return (
        <div style={{ padding: '2rem', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', color: '#1e293b', background: '#f8fafc' }}>
            {isModalOpen && (
                <ZoneDetailModal 
                    zone={selectedZone}
                    date={selectedDate}
                    projectId={project?.id}
                    approvedWorkers={approvedWorkers}
                    onClose={() => {
                        setIsModalOpen(false);
                        loadData();
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
                                risks={dangers}
                                zones={zones}
                                gridConfig={{ rows: parseInt(project.grid_rows), cols: parseInt(project.grid_cols), spacing: parseFloat(project.grid_spacing) }}
                            />
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
                    <div style={{ flex: 1, background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', background: '#eff6ff', borderBottom: '1px solid #dbeafe', fontWeight: '800', color: '#1e40af' }}>
                            일일 작업 ({selectedLevel})
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {plans.filter(p => p.level === selectedLevel).length === 0 ? (
                                <EmptyState text="작업 없음" />
                            ) : (
                                plans.filter(p => p.level === selectedLevel).map(p => (
                                    <PlanItem key={p.id} plan={p} />
                                ))
                            )}
                        </div>
                    </div>
                    <div style={{ flex: 1, background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', background: '#fff1f2', borderBottom: '1px solid #ffe4e6', fontWeight: '800', color: '#9f1239' }}>
                            위험 구역 ({selectedLevel})
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {dangers.filter(d => d.level === selectedLevel).length === 0 ? (
                                <EmptyState text="위험 구역 없음" />
                            ) : (
                                dangers.filter(d => d.level === selectedLevel).map(d => (
                                    <DangerItem key={d.id} danger={d} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * 구역 상세 모달 (작업 계획 + 위험 구역 관리)
 */
const ZoneDetailModal = ({ zone, date, projectId, approvedWorkers, onClose }) => {
    const [tasks, setTasks] = useState([]);
    const [dangers, setDangers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('view'); // 'view', 'add_task', 'add_danger'
    const [editingTask, setEditingTask] = useState(null);
    
    const [taskForm, setTaskForm] = useState({
        work_info_id: '',
        description: '',
        risk_score: 50,
        status: 'PLANNED'
    });
    
    const [dangerForm, setDangerForm] = useState({
        mode: 'template', // 'template' or 'custom'
        danger_info_id: '',
        custom_type: '',
        custom_icon: 'alert-triangle',
        custom_color: '#ef4444',
        description: '',
        risk_level: 3
    });
    
    const [workTemplates, setWorkTemplates] = useState([
        { id: 1, work_type: '거푸집 작업' },
        { id: 2, work_type: '고소 작업' },
        { id: 3, work_type: '용접 작업' },
        { id: 4, work_type: '중장비 작업' },
        { id: 5, work_type: '전기 작업' },
        { id: 6, work_type: '배관 작업' },
        { id: 7, work_type: '마감 작업' }
    ]);
    
    const [dangerTemplates, setDangerTemplates] = useState([]);

    useEffect(() => {
        loadZoneDetail();
        loadDangerTemplates();
    }, [zone.id, date]);

    const loadZoneDetail = async () => {
        setLoading(true);
        try {
            const res = await workApi.getZoneDetail(zone.id, date);
            setTasks(res.data.tasks || []);
            setDangers(res.data.dangers || []);
        } catch (e) {
            console.error('구역 상세 로드 실패', e);
        } finally {
            setLoading(false);
        }
    };
    
    const loadDangerTemplates = async () => {
        try {
            const res = await dangerApi.getDangerInfoList();
            setDangerTemplates(res.data || []);
        } catch (e) {
            console.error('위험 요소 템플릿 로드 실패', e);
        }
    };

    const handleCreateTask = async () => {
        if (!taskForm.work_info_id) {
            alert('작업 종류를 선택해주세요.');
            return;
        }
        
        // 중복 체크: 이미 위험 구역이 설정된 곳에는 작업 추가 불가
        if (dangers.length > 0) {
            alert('⚠️ 이 구역은 이미 위험 구역으로 설정되어 있습니다.\n작업 구역과 위험 구역을 동시에 설정할 수 없습니다.\n먼저 위험 구역을 삭제한 후 작업을 추가해주세요.');
            return;
        }
        
        try {
            await workApi.createTask({
                project_id: projectId,
                zone_id: zone.id,
                work_info_id: parseInt(taskForm.work_info_id),
                date: date,
                description: taskForm.description,
                risk_score: parseInt(taskForm.risk_score),
                status: taskForm.status
            });
            alert('작업이 추가되었습니다.');
            setMode('view');
            setTaskForm({ work_info_id: '', description: '', risk_score: 50, status: 'PLANNED' });
            loadZoneDetail();
        } catch (e) {
            alert('작업 추가 중 오류가 발생했습니다.');
        }
    };

    const handleUpdateTask = async (taskId) => {
        try {
            await workApi.updateTask(taskId, {
                work_info_id: parseInt(editingTask.work_info_id),
                description: editingTask.description,
                risk_score: parseInt(editingTask.risk_score),
                status: editingTask.status
            });
            alert('작업이 수정되었습니다.');
            setEditingTask(null);
            loadZoneDetail();
        } catch (e) {
            alert('작업 수정 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('이 작업을 삭제하시겠습니까?')) return;
        try {
            await workApi.deleteTask(taskId);
            alert('작업이 삭제되었습니다.');
            loadZoneDetail();
        } catch (e) {
            alert('작업 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleAssignWorker = async (taskId, workerId) => {
        try {
            await workApi.assignWorker(taskId, workerId, 'GENERAL');
            alert('작업자가 배정되었습니다.');
            loadZoneDetail();
        } catch (e) {
            alert('작업자 배정 중 오류가 발생했습니다.');
        }
    };

    const handleRemoveWorker = async (taskId, workerId) => {
        if (!confirm('이 작업자를 제거하시겠습니까?')) return;
        try {
            await workApi.removeWorker(taskId, workerId);
            alert('작업자가 제거되었습니다.');
            loadZoneDetail();
        } catch (e) {
            alert('작업자 제거 중 오류가 발생했습니다.');
        }
    };

    const handleCreateDanger = async () => {
        try {
            // 중복 체크: 이미 작업이 있는 구역에는 위험 구역 추가 불가
            if (tasks.length > 0) {
                alert('⚠️ 이 구역에는 이미 작업 계획이 존재합니다.\n작업 구역과 위험 구역을 동시에 설정할 수 없습니다.\n먼저 작업 계획을 삭제한 후 위험 구역을 추가해주세요.');
                return;
            }
            
            let dangerInfoId = null;
            
            if (dangerForm.mode === 'template') {
                // 기존 템플릿 사용
                if (!dangerForm.danger_info_id) {
                    alert('위험 요소를 선택해주세요.');
                    return;
                }
                dangerInfoId = parseInt(dangerForm.danger_info_id);
            } else {
                // 새로운 위험 요소 생성
                if (!dangerForm.custom_type) {
                    alert('위험 유형을 입력해주세요.');
                    return;
                }
                const newDangerInfo = await dangerApi.createDangerInfo({
                    danger_type: dangerForm.custom_type,
                    icon: dangerForm.custom_icon,
                    color: dangerForm.custom_color,
                    description: dangerForm.description,
                    risk_level: parseInt(dangerForm.risk_level)
                });
                dangerInfoId = newDangerInfo.data.id;
            }
            
            // 위험 구역 생성
            await workApi.createDanger({
                zone_id: zone.id,
                date: date,
                danger_info_id: dangerInfoId,
                description: dangerForm.description
            });
            
            alert('위험 구역이 추가되었습니다.');
            setMode('view');
            setDangerForm({ 
                mode: 'template',
                danger_info_id: '',
                custom_type: '',
                custom_icon: 'alert-triangle',
                custom_color: '#ef4444',
                description: '',
                risk_level: 3
            });
            loadZoneDetail();
            loadDangerTemplates(); // 새로 추가된 템플릿 반영
        } catch (e) {
            console.error('위험 구역 추가 오류:', e);
            alert('위험 구역 추가 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteDanger = async (dangerId) => {
        if (!confirm('이 위험 구역을 삭제하시겠습니까?')) return;
        try {
            await workApi.deleteDanger(dangerId);
            alert('위험 구역이 삭제되었습니다.');
            loadZoneDetail();
        } catch (e) {
            alert('위험 구역 삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 10000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '32px', 
                width: '800px', 
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.4)', 
                border: '1px solid #e2e8f0' 
            }}>
                {/* 헤더 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontWeight: '900', color: '#0f172a', fontSize: '1.5rem' }}>
                        {zone.name} 상세
                    </h2>
                    <button onClick={onClose} style={{ 
                        background: '#f1f5f9', 
                        border: 'none', 
                        borderRadius: '12px', 
                        padding: '8px', 
                        cursor: 'pointer' 
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>로딩 중...</div>
                ) : (
                    <>
                        {/* 작업 계획 섹션 */}
                        <section style={{ marginBottom: '2rem' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: '1rem' 
                            }}>
                                <h3 style={{ 
                                    margin: 0, 
                                    fontWeight: '800', 
                                    color: '#3b82f6', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px' 
                                }}>
                                    <ClipboardList size={20} /> 작업 계획
                                </h3>
                                {mode === 'view' && (
                                    <button 
                                        onClick={() => setMode('add_task')}
                                        style={{ 
                                            padding: '8px 16px', 
                                            background: '#3b82f6', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '10px', 
                                            fontSize: '0.85rem', 
                                            fontWeight: '700', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Plus size={16} /> 작업 추가
                                    </button>
                                )}
                            </div>

                            {mode === 'add_task' ? (
                                <div style={{ 
                                    padding: '1.5rem', 
                                    background: '#f8fafc', 
                                    borderRadius: '16px', 
                                    border: '1px solid #e2e8f0' 
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                작업 종류
                                            </label>
                                            <select 
                                                value={taskForm.work_info_id} 
                                                onChange={e => setTaskForm({...taskForm, work_info_id: e.target.value})}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '12px', 
                                                    borderRadius: '12px', 
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <option value="">선택</option>
                                                {workTemplates.map(t => (
                                                    <option key={t.id} value={t.id}>{t.work_type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                작업 설명
                                            </label>
                                            <input 
                                                type="text"
                                                value={taskForm.description} 
                                                onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                                                placeholder="예: 1층 로비 거푸집 설치"
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '12px', 
                                                    borderRadius: '12px', 
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                위험도 점수 ({taskForm.risk_score})
                                            </label>
                                            <input 
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={taskForm.risk_score} 
                                                onChange={e => setTaskForm({...taskForm, risk_score: e.target.value})}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                            <button 
                                                onClick={() => setMode('view')}
                                                style={{ 
                                                    flex: 1, 
                                                    padding: '12px', 
                                                    borderRadius: '12px', 
                                                    border: 'none', 
                                                    background: '#f1f5f9', 
                                                    fontWeight: '700',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                취소
                                            </button>
                                            <button 
                                                onClick={handleCreateTask}
                                                style={{ 
                                                    flex: 2, 
                                                    padding: '12px', 
                                                    borderRadius: '12px', 
                                                    border: 'none', 
                                                    background: '#3b82f6', 
                                                    color: 'white', 
                                                    fontWeight: '900',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                저장
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {tasks.length === 0 ? (
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '2rem', 
                                            background: '#f8fafc', 
                                            borderRadius: '12px', 
                                            color: '#94a3b8' 
                                        }}>
                                            작업 계획이 없습니다.
                                        </div>
                                    ) : (
                                        tasks.map(task => (
                                            <TaskCard 
                                                key={task.id} 
                                                task={task}
                                                approvedWorkers={approvedWorkers}
                                                onDelete={() => handleDeleteTask(task.id)}
                                                onAssignWorker={(workerId) => handleAssignWorker(task.id, workerId)}
                                                onRemoveWorker={(workerId) => handleRemoveWorker(task.id, workerId)}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </section>

                        {/* 위험 구역 섹션 */}
                        <section>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: '1rem' 
                            }}>
                                <h3 style={{ 
                                    margin: 0, 
                                    fontWeight: '800', 
                                    color: '#ef4444', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px' 
                                }}>
                                    <AlertTriangle size={20} /> 위험 구역
                                </h3>
                                {mode === 'view' && (
                                    <button 
                                        onClick={() => setMode('add_danger')}
                                        style={{ 
                                            padding: '8px 16px', 
                                            background: '#ef4444', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '10px', 
                                            fontSize: '0.85rem', 
                                            fontWeight: '700', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Plus size={16} /> 위험 구역 추가
                                    </button>
                                )}
                            </div>

                            {mode === 'add_danger' ? (
                                <div style={{ 
                                    padding: '1.5rem', 
                                    background: '#fef2f2', 
                                    borderRadius: '16px', 
                                    border: '1px solid #fecaca' 
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* 모드 선택 */}
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                입력 방식
                                            </label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => setDangerForm({...dangerForm, mode: 'template'})}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        borderRadius: '10px',
                                                        border: dangerForm.mode === 'template' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                                        background: dangerForm.mode === 'template' ? '#fee2e2' : 'white',
                                                        fontWeight: '700',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        color: dangerForm.mode === 'template' ? '#991b1b' : '#64748b'
                                                    }}
                                                >
                                                    템플릿 선택
                                                </button>
                                                <button
                                                    onClick={() => setDangerForm({...dangerForm, mode: 'custom'})}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        borderRadius: '10px',
                                                        border: dangerForm.mode === 'custom' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                                        background: dangerForm.mode === 'custom' ? '#fee2e2' : 'white',
                                                        fontWeight: '700',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        color: dangerForm.mode === 'custom' ? '#991b1b' : '#64748b'
                                                    }}
                                                >
                                                    직접 입력
                                                </button>
                                            </div>
                                        </div>

                                        {dangerForm.mode === 'template' ? (
                                            /* 템플릿 선택 모드 */
                                            <>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                        위험 요소 선택
                                                    </label>
                                                    <select
                                                        value={dangerForm.danger_info_id}
                                                        onChange={e => setDangerForm({...dangerForm, danger_info_id: e.target.value})}
                                                        style={{ 
                                                            width: '100%', 
                                                            padding: '12px', 
                                                            borderRadius: '12px', 
                                                            border: '1px solid #fecaca',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        <option value="">선택하세요</option>
                                                        {dangerTemplates.map(dt => (
                                                            <option key={dt.id} value={dt.id}>
                                                                {dt.danger_type} (위험도: {dt.risk_level})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                        상세 설명 (선택)
                                                    </label>
                                                    <textarea 
                                                        value={dangerForm.description} 
                                                        onChange={e => setDangerForm({...dangerForm, description: e.target.value})}
                                                        placeholder="추가 설명이 필요한 경우 입력"
                                                        rows={2}
                                                        style={{ 
                                                            width: '100%', 
                                                            padding: '12px', 
                                                            borderRadius: '12px', 
                                                            border: '1px solid #fecaca',
                                                            fontSize: '0.9rem',
                                                            resize: 'vertical'
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            /* 커스텀 입력 모드 */
                                            <>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                        위험 유형 (새로 추가)
                                                    </label>
                                                    <input 
                                                        type="text"
                                                        value={dangerForm.custom_type} 
                                                        onChange={e => setDangerForm({...dangerForm, custom_type: e.target.value})}
                                                        placeholder="예: 소음, 분진, 진동"
                                                        style={{ 
                                                            width: '100%', 
                                                            padding: '12px', 
                                                            borderRadius: '12px', 
                                                            border: '1px solid #fecaca',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                            아이콘
                                                        </label>
                                                        <input 
                                                            type="text"
                                                            value={dangerForm.custom_icon} 
                                                            onChange={e => setDangerForm({...dangerForm, custom_icon: e.target.value})}
                                                            placeholder="alert-triangle"
                                                            style={{ 
                                                                width: '100%', 
                                                                padding: '12px', 
                                                                borderRadius: '12px', 
                                                                border: '1px solid #fecaca',
                                                                fontSize: '0.85rem'
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                            색상
                                                        </label>
                                                        <input 
                                                            type="color"
                                                            value={dangerForm.custom_color} 
                                                            onChange={e => setDangerForm({...dangerForm, custom_color: e.target.value})}
                                                            style={{ 
                                                                width: '100%', 
                                                                height: '44px',
                                                                borderRadius: '12px', 
                                                                border: '1px solid #fecaca',
                                                                cursor: 'pointer'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                        위험도 ({dangerForm.risk_level})
                                                    </label>
                                                    <input 
                                                        type="range"
                                                        min="1"
                                                        max="5"
                                                        value={dangerForm.risk_level}
                                                        onChange={e => setDangerForm({...dangerForm, risk_level: e.target.value})}
                                                        style={{ width: '100%' }}
                                                    />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                                                        <span>낮음 (1)</span>
                                                        <span>매우 높음 (5)</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                        상세 설명
                                                    </label>
                                                    <textarea 
                                                        value={dangerForm.description} 
                                                        onChange={e => setDangerForm({...dangerForm, description: e.target.value})}
                                                        placeholder="위험 요소에 대한 상세 설명"
                                                        rows={2}
                                                        style={{ 
                                                            width: '100%', 
                                                            padding: '12px', 
                                                            borderRadius: '12px', 
                                                            border: '1px solid #fecaca',
                                                            fontSize: '0.9rem',
                                                            resize: 'vertical'
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                            <button 
                                                onClick={() => {
                                                    setMode('view');
                                                    setDangerForm({ 
                                                        mode: 'template',
                                                        danger_info_id: '',
                                                        custom_type: '',
                                                        custom_icon: 'alert-triangle',
                                                        custom_color: '#ef4444',
                                                        description: '',
                                                        risk_level: 3
                                                    });
                                                }}
                                                style={{ 
                                                    flex: 1, 
                                                    padding: '12px', 
                                                    borderRadius: '12px', 
                                                    border: 'none', 
                                                    background: '#f1f5f9', 
                                                    fontWeight: '700',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                취소
                                            </button>
                                            <button 
                                                onClick={handleCreateDanger}
                                                style={{ 
                                                    flex: 2, 
                                                    padding: '12px', 
                                                    borderRadius: '12px', 
                                                    border: 'none', 
                                                    background: '#ef4444', 
                                                    color: 'white', 
                                                    fontWeight: '900',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {dangerForm.mode === 'custom' ? '생성 후 추가' : '추가'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {dangers.length === 0 ? (
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '2rem', 
                                            background: '#fef2f2', 
                                            borderRadius: '12px', 
                                            color: '#94a3b8' 
                                        }}>
                                            위험 구역이 없습니다.
                                        </div>
                                    ) : (
                                        dangers.map(danger => (
                                            <DangerCard 
                                                key={danger.id} 
                                                danger={danger}
                                                onDelete={() => handleDeleteDanger(danger.id)}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

/**
 * 작업 카드 (작업자 배정 포함)
 */
const TaskCard = ({ task, approvedWorkers, onDelete, onAssignWorker, onRemoveWorker }) => {
    const [showWorkerSelect, setShowWorkerSelect] = useState(false);
    const assignedWorkerIds = (task.workers || []).map(w => w.id);
    const availableWorkers = approvedWorkers.filter(w => !assignedWorkerIds.includes(w.id));

    return (
        <div style={{ 
            padding: '1rem', 
            background: '#f8fafc', 
            border: '1.5px solid #e2e8f0', 
            borderRadius: '16px' 
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '900', fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>
                        {task.work_type || '기타 작업'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {task.description}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ 
                        padding: '6px 10px', 
                        background: task.calculated_risk_score >= 60 ? '#fee2e2' : '#dbeafe', 
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        color: task.calculated_risk_score >= 60 ? '#991b1b' : '#1e40af'
                    }}>
                        위험도 {task.calculated_risk_score}
                    </div>
                    <button 
                        onClick={onDelete}
                        style={{ 
                            padding: '6px', 
                            background: '#fee2e2', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Trash2 size={14} color="#991b1b" />
                    </button>
                </div>
            </div>

            {/* 배정된 작업자 목록 */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '8px' 
                }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>
                        배정 인원 ({(task.workers || []).length}명)
                    </div>
                    <button 
                        onClick={() => setShowWorkerSelect(!showWorkerSelect)}
                        style={{ 
                            padding: '4px 10px', 
                            background: '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            fontSize: '0.7rem', 
                            fontWeight: '700', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <UserPlus size={12} /> 추가
                    </button>
                </div>

                {showWorkerSelect && (
                    <div style={{ 
                        marginBottom: '10px', 
                        padding: '10px', 
                        background: 'white', 
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        maxHeight: '150px',
                        overflowY: 'auto'
                    }}>
                        {availableWorkers.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                                배정 가능한 작업자가 없습니다.
                            </div>
                        ) : (
                            availableWorkers.map(worker => (
                                <div 
                                    key={worker.id}
                                    onClick={() => {
                                        onAssignWorker(worker.id);
                                        setShowWorkerSelect(false);
                                    }}
                                    style={{ 
                                        padding: '10px', 
                                        cursor: 'pointer',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        marginBottom: '4px',
                                        background: '#f8fafc',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                                >
                                    <div>
                                        <div style={{ fontWeight: '800', color: '#0f172a' }}>
                                            {worker.full_name}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                            {worker.company_name}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '4px 8px', 
                                        background: '#dbeafe', 
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        color: '#1e40af'
                                    }}>
                                        {worker.job_title || '작업자'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(task.workers || []).length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', padding: '8px' }}>
                            배정된 작업자가 없습니다.
                        </div>
                    ) : (
                        (task.workers || []).map(worker => (
                            <div 
                                key={worker.id}
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '10px',
                                    background: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '3px' }}>
                                        {worker.full_name}
                                        <span style={{ 
                                            marginLeft: '8px',
                                            padding: '2px 8px',
                                            background: '#dbeafe',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            color: '#1e40af'
                                        }}>
                                            {worker.job_title || '작업자'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                        {worker.company_name}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onRemoveWorker(worker.id)}
                                    style={{ 
                                        padding: '6px 10px', 
                                        background: '#fee2e2', 
                                        border: 'none', 
                                        borderRadius: '6px', 
                                        fontSize: '0.7rem', 
                                        fontWeight: '700',
                                        color: '#991b1b',
                                        cursor: 'pointer'
                                    }}
                                >
                                    제거
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * 위험 구역 카드
 */
const DangerCard = ({ danger, onDelete }) => {
    return (
        <div style={{ 
            padding: '1rem', 
            background: '#fef2f2', 
            border: '1.5px solid #fca5a5', 
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ 
                    display: 'inline-block',
                    padding: '4px 10px', 
                    background: '#dc2626', 
                    color: 'white', 
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    marginBottom: '8px'
                }}>
                    {danger.risk_type}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {danger.description}
                </div>
            </div>
            <button 
                onClick={onDelete}
                style={{ 
                    padding: '6px', 
                    background: '#fee2e2', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Trash2 size={14} color="#991b1b" />
            </button>
        </div>
    );
};

const PlanItem = ({ plan }) => {
    const workers = Array.isArray(plan.workers) ? plan.workers : [];
    const workerCount = workers.length;
    
    return (
        <div style={{ 
            padding: '12px', 
            background: '#f8fafc', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            marginBottom: '10px' 
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>{plan.zone_name}</div>
                <div style={{ 
                    padding: '4px 8px', 
                    background: '#dbeafe', 
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    color: '#1e40af'
                }}>
                    {workerCount}명
                </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '700', marginBottom: '6px' }}>
                {plan.work_type}
            </div>
            {workerCount > 0 && (
                <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#64748b',
                    paddingTop: '6px',
                    borderTop: '1px solid #e2e8f0'
                }}>
                    {workers.map((w) => (
                        <div key={w.id || w.worker_id} style={{ marginTop: '3px' }}>
                            • {w.full_name} ({w.job_title})
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DangerItem = ({ danger }) => (
    <div style={{ 
        padding: '12px', 
        background: '#fef2f2', 
        borderRadius: '16px', 
        border: '1.5px solid #fca5a5', 
        marginBottom: '10px' 
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontWeight: '800', color: '#991b1b', fontSize: '0.9rem' }}>{danger.zone_name}</div>
            <div style={{ 
                padding: '4px 8px', 
                background: danger.color || '#dc2626', 
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: '800'
            }}>
                {danger.danger_type || danger.risk_type}
            </div>
        </div>
        {danger.description && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                {danger.description}
            </div>
        )}
    </div>
);

const EmptyState = ({ text }) => <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{text}</div>;

export default DailyPlanManagement;
