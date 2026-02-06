
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { workApi } from '@/api/workApi';
import { CheckCircle2, Circle, Clock, MapPin, ShieldAlert } from 'lucide-react';

const WorkerDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                // 특정 작업자의 오늘의 할 일 로드
                const res = await workApi.getWorkerDashboard(user?.username);
                setTasks(res.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (user) loadTasks();
    }, [user]);

    return (
        <div style={{ padding: '2rem', color: 'white' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>👋 안녕하세요, {user?.full_name}님!</h1>
                <p style={{ color: '#94a3b8' }}>오늘도 안전한 하루 되세요. 오늘의 할 일 {tasks.length}건이 있습니다.</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <section style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={20} color="#3b82f6" /> 오늘의 작업 일정
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.map(task => (
                            <div key={task.id} style={{ padding: '1.2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{task.task_name}</h4>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {task.location}</span>
                                    </div>
                                </div>
                                {task.completed ? <CheckCircle2 color="#10b981" /> : <Circle color="#334155" />}
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>배정된 오늘 작업이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default WorkerDashboard;
