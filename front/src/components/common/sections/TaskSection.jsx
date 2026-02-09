import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import TaskForm from '../forms/TaskForm';
import WorkerAssignmentForm from '../forms/WorkerAssignmentForm';
import TaskCard from '../cards/TaskCard';

const TaskSection = ({
    mode,
    setMode,
    tasks,
    taskForm,
    setTaskForm,
    workTemplates,
    onCreateTask,
    onDeleteTask,
    selectedTaskForWorkers,
    approvedWorkers,
    onAssignWorker,
    onRemoveWorker,
    onAssignmentComplete
}) => {
    return (
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
                <TaskForm 
                    taskForm={taskForm}
                    setTaskForm={setTaskForm}
                    workTemplates={workTemplates}
                    onSubmit={onCreateTask}
                    onCancel={() => setMode('view')}
                />
            ) : mode === 'assign_workers' ? (
                <WorkerAssignmentForm 
                    task={selectedTaskForWorkers}
                    approvedWorkers={approvedWorkers}
                    onAssign={onAssignWorker}
                    onRemove={onRemoveWorker}
                    onComplete={onAssignmentComplete}
                />
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
                                onDelete={() => onDeleteTask(task.id)}
                                onAssignWorker={(workerId) => onAssignWorker(task.id, workerId)}
                                onRemoveWorker={(workerId) => onRemoveWorker(task.id, workerId)}
                            />
                        ))
                    )}
                </div>
            )}
        </section>
    );
};

export default TaskSection;
