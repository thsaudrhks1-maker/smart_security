import React, { useState, useEffect } from 'react';
import { workApi } from '@/api/workApi';
import { dangerApi } from '@/api/dangerApi';
import { safetyApi } from '@/api/safetyApi';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import TaskSection from './sections/TaskSection';
import DangerSection from './sections/DangerSection';

/**
 * 구역 상세 모달 (작업 계획 + 위험 구역 관리)
 * 데스크톱, 모바일 모두 사용 가능
 */
const ZoneDetailModal = ({ zone, date, projectId, approvedWorkers, onClose }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [dangers, setDangers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('view');
    const [selectedTaskForWorkers, setSelectedTaskForWorkers] = useState(null);
    const [files, setFiles] = useState([]);

    const [taskForm, setTaskForm] = useState({
        work_info_id: '',
        description: '',
        risk_score: 50,
        status: 'PLANNED'
    });
    
    const [dangerForm, setDangerForm] = useState({
        mode: 'template',
        danger_info_id: '',
        custom_type: '',
        custom_icon: 'alert-triangle',
        custom_color: '#ef4444',
        description: '',
        risk_level: 3
    });
    
    // 이 부분은 추후 API 연동 가능
    const [workTemplates] = useState([
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
            
            await loadZoneDetail();
            const res = await workApi.getZoneDetail(zone.id, date);
            const latestTask = res.data.tasks[res.data.tasks.length - 1];
            
            setSelectedTaskForWorkers(latestTask);
            setMode('assign_workers');
            setTaskForm({ work_info_id: '', description: '', risk_score: 50, status: 'PLANNED' });
        } catch (e) {
            console.error('작업 추가 오류:', e);
            alert('작업 추가 중 오류가 발생했습니다.');
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

    const handleWorkerAssignmentComplete = () => {
        setMode('view');
        setSelectedTaskForWorkers(null);
        loadZoneDetail();
    }

    const handleCreateDanger = async () => {
        try {
            const formData = new FormData();
            formData.append('project_id', projectId);
            formData.append('zone_id', zone.id);
            formData.append('user_id', user?.id || 1);
            formData.append('date', date);
            
            if (dangerForm.mode === 'template') {
                if (!dangerForm.danger_info_id) {
                    alert('위험 요소를 선택해주세요.');
                    return;
                }
                formData.append('danger_info_id', parseInt(dangerForm.danger_info_id));
                const template = dangerTemplates.find(t => t.id === parseInt(dangerForm.danger_info_id));
                formData.append('risk_type', template?.danger_type || 'ETC');
            } else {
                if (!dangerForm.custom_type) {
                    alert('위험 유형을 입력해주세요.');
                    return;
                }
                formData.append('risk_type', dangerForm.custom_type);
            }
            
            formData.append('description', dangerForm.description);
            formData.append('status', 'APPROVED');

            files.forEach(file => {
                formData.append('files', file);
            });
            
            await safetyApi.reportDanger(formData);
            
            alert('위험 구역이 등록되었습니다.');
            handleCancelDanger();
            loadZoneDetail();
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

    const handleCancelDanger = () => {
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
        setFiles([]);
    }

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
                        <TaskSection 
                            mode={mode}
                            setMode={setMode}
                            tasks={tasks}
                            taskForm={taskForm}
                            setTaskForm={setTaskForm}
                            workTemplates={workTemplates}
                            onCreateTask={handleCreateTask}
                            onDeleteTask={handleDeleteTask}
                            selectedTaskForWorkers={selectedTaskForWorkers}
                            approvedWorkers={approvedWorkers}
                            onAssignWorker={handleAssignWorker}
                            onRemoveWorker={handleRemoveWorker}
                            onAssignmentComplete={handleWorkerAssignmentComplete}
                        />

                        <DangerSection 
                            mode={mode}
                            setMode={setMode}
                            dangers={dangers}
                            dangerForm={dangerForm}
                            setDangerForm={setDangerForm}
                            dangerTemplates={dangerTemplates}
                            files={files}
                            setFiles={setFiles}
                            onCreateDanger={handleCreateDanger}
                            onDeleteDanger={handleDeleteDanger}
                            onCancelDanger={handleCancelDanger}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ZoneDetailModal;
