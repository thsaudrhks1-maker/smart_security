import React, { useState } from 'react';
import { 
    Map as MapIcon, 
    Layers, 
    Settings, 
    Radio, 
    Shield, 
    Plus, 
    Save, 
    Trash2, 
    Box,
    MousePointer2,
    Eye,
    Activity,
    Users,
    HardHat,
    Hammer,
    Bluetooth,
    Video,
    Navigation,
    ArrowRightCircle,
    Wifi,
    Info,
    CheckCircle2
} from 'lucide-react';
import { projectApi } from '@/api/projectApi';
import { useAuth } from '@/context/AuthContext';
import CommonMap from '@/components/common/CommonMap';

/**
 * [MANAGER] 구역 및 인프라 관리 (전문가용 모드)
 * - 현장 디지털 트윈 설정: 구역 드로잉, 비컨/센서 매핑, 영구 위험구역 설정
 * - 가시성 높은 프리미엄 UI 대시보드
 */
const LocationManagement = () => {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('1F');
    const [editMode, setEditMode] = useState(false);
    const [activeTool, setActiveTool] = useState('select');

    React.useEffect(() => {
        const load = async () => {
            try {
                const res = await projectApi.getProjects();
                if (res.data.data?.length > 0) setProject(res.data.data[0]);
            } catch (e) { console.error(e); }
        };
        load();
    }, []);

    // 구역 상세 구성 정보 더미 데이터 (Mockup 기반)
    const [zones] = useState([
        { 
            id: 1, name: '1F-A1', level: '1F', type: 'GENERAL', 
            sensors: 2, ppeCount: 2, workers: 5, safetyLevel: 85,
            ppeList: ['helmet', 'vest']
        },
        { 
            id: 2, name: '1F-B2', level: '1F', type: 'HAZARD', 
            sensors: 4, ppeCount: 3, workers: 8, safetyLevel: 45,
            ppeList: ['helmet', 'vest', 'harness']
        },
        { 
            id: 3, name: '1F-C3', level: '1F', type: 'RESTRICTED', 
            sensors: 1, ppeCount: 3, workers: 2, safetyLevel: 92,
            ppeList: ['helmet', 'boots', 'harness']
        }
    ]);

    // IoT 장치 인프라 더미 데이터 (Mockup 기반)
    const [sensors] = useState([
        { id: 'SN-001', type: 'BEACON', battery: 100, status: 'ONLINE', zone: '1F-A1', signal: [40, 60, 45, 80, 75, 90] },
        { id: 'SN-002', type: 'CCTV-AI', battery: 85, status: 'ONLINE', zone: '1F-B2', signal: [70, 65, 80, 85, 90, 88] },
        { id: 'SN-003', type: 'BEACON', battery: 85, status: 'ONLINE', zone: '1F-A5', signal: [30, 40, 35, 50, 45, 60] },
        { id: 'SN-004', type: 'CCTV-AI', battery: 100, status: 'ONLINE', zone: '1F-B2', signal: [90, 95, 88, 92, 95, 100] },
    ]);

    // Sparkline 컴포넌트 (신호 강도 시각화용)
    const Sparkline = ({ data, color }) => {
        const width = 60;
        const height = 20;
        const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / 100) * height}`).join(' ');
        return (
            <svg width={width} height={height} style={{ overflow: 'visible' }}>
                <polyline fill="none" stroke={color} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    return (
        <div style={{ 
            padding: '1.5rem', 
            height: 'calc(100vh - 64px)', 
            display: 'flex', 
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            color: '#e2e8f0',
            overflow: 'hidden'
        }}>
            {/* 상단 헤더 & 컨트롤바 (Mockup 기준) */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.2rem',
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(20px)',
                padding: '0.8rem 1.5rem',
                borderRadius: '24px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                        padding: '10px', borderRadius: '14px',
                        boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
                    }}>
                        <Navigation size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>구역 및 인프라 관리</h1>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, fontWeight: '600' }}>현장 공간 정의 및 IoT 센서 배치 설정</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="dark-card" style={{ display: 'flex', padding: '4px', gap: '4px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px' }}>
                        {['B1', '1F', '2F', '3F'].map(floor => (
                            <button
                                key={floor}
                                onClick={() => setSelectedLevel(floor)}
                                className={`dark-level-button ${selectedLevel === floor ? 'active' : ''}`}
                                style={{ padding: '6px 16px', fontSize: '0.85rem', minWidth: '50px' }}
                            >
                                {floor}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setEditMode(!editMode)}
                        className={`dark-button ${editMode ? 'active' : ''}`}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px',
                            background: editMode ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(148, 163, 184, 0.1)',
                            color: 'white'
                        }}
                    >
                        {editMode ? <><Save size={18} /> 설정 저장</> : <><Settings size={18} /> 레이아웃 편집</>}
                    </button>
                </div>
            </div>

            {/* 메인 레이아웃: 맵 + 사이드바 2개 분할 가능하지만 Mockup 비율로 조정 */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px 320px', gap: '1.5rem', minHeight: 0 }}>
                
                {/* 1. 지도 영역 (Central Map) */}
                <div className="dark-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    {/* 상단 툴 레이어 (Mockup 기준) */}
                    <div style={{ 
                        position: 'absolute', top: '20px', right: '20px', zIndex: 100,
                        display: 'flex', gap: '10px'
                    }}>
                        <button className="dark-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.1)', cursor: 'pointer' }}>
                            <Box size={16} color="#94a3b8" /> 3D 뷰어
                        </button>
                        <button className="dark-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.1)', cursor: 'pointer' }}>
                            <Eye size={16} color="#94a3b8" /> 가시성
                        </button>
                    </div>

                    {/* 위험 구역 플로팅 라벨 예시 (Mockup 재현) */}
                    <div style={{ 
                        position: 'absolute', top: '150px', left: '60%', zIndex: 50,
                        background: 'rgba(239, 68, 68, 0.15)', backdropFilter: 'blur(10px)',
                        padding: '10px 15px', borderRadius: '16px', border: '1.5px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
                    }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#f87171', textTransform: 'uppercase' }}>위험 구역</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <HardHat size={18} color="#f59e0b" />
                            <Box size={18} color="#f59e0b" />
                            <Shield size={18} color="#f59e0b" />
                        </div>
                    </div>

                    {editMode && (
                        <div style={{ 
                            position: 'absolute', top: '20px', left: '20px', zIndex: 100,
                            display: 'flex', flexDirection: 'column', gap: '10px',
                            background: 'rgba(15, 23, 42, 0.85)', padding: '10px', borderRadius: '16px',
                            border: '1px solid rgba(148, 163, 184, 0.2)'
                        }}>
                            <button onClick={() => setActiveTool('select')} style={{ padding: '10px', borderRadius: '12px', border: 'none', background: activeTool === 'select' ? '#3b82f6' : 'transparent', color: 'white', cursor: 'pointer' }}><MousePointer2 size={22} /></button>
                            <button onClick={() => setActiveTool('draw')} style={{ padding: '10px', borderRadius: '12px', border: 'none', background: activeTool === 'draw' ? '#3b82f6' : 'transparent', color: 'white', cursor: 'pointer' }}><Layers size={22} /></button>
                            <button onClick={() => setActiveTool('beacon')} style={{ padding: '10px', borderRadius: '12px', border: 'none', background: activeTool === 'beacon' ? '#3b82f6' : 'transparent', color: 'white', cursor: 'pointer' }}><Radio size={22} /></button>
                            <div style={{ height: '1px', background: 'rgba(148, 163, 184, 0.1)', margin: '5px' }} />
                            <button style={{ padding: '10px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}><Trash2 size={22} /></button>
                        </div>
                    )}

                    <div style={{ flex: 1, position: 'relative' }}>
                        {project ? (
                            <CommonMap 
                                center={[project.lat, project.lng]}
                                zoom={19}
                                highlightLevel={selectedLevel}
                                gridConfig={{
                                    rows: project.grid_rows,
                                    cols: project.grid_cols,
                                    spacing: project.grid_spacing,
                                    angle: project.grid_angle
                                }}
                            />
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>데이터를 불러오는 중...</div>
                        )}
                    </div>
                </div>

                {/* 2. 구역 구성 정보 사이드바 (Sidebar 1) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
                    <div className="dark-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ 
                            padding: '1.2rem', background: 'rgba(59, 130, 246, 0.1)', 
                            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: '900', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Layers size={18} /> 구역 구성 정보
                            </span>
                            <Plus size={18} color="#60a5fa" style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="dark-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                            {zones.map(z => (
                                <div key={z.id} style={{ 
                                    padding: '1.2rem', borderRadius: '18px', background: 'rgba(30, 41, 59, 0.4)',
                                    marginBottom: '12px', border: '1px solid rgba(148, 163, 184, 0.1)',
                                    transition: 'transform 0.2s ease'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: '900', color: '#f1f5f9' }}>{z.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>
                                                센서 {z.sensors}개 · 보호구 {z.ppeCount}종
                                            </div>
                                        </div>
                                        <div style={{ 
                                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900',
                                            background: z.type === 'HAZARD' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                            color: z.type === 'HAZARD' ? '#f87171' : '#60a5fa',
                                            border: `1px solid ${z.type === 'HAZARD' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                                        }}>
                                            {z.type}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>
                                            <Users size={14} /> 인원 {z.workers}
                                        </div>
                                        <div style={{ flex: 1, height: '6px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '3px', position: 'relative' }}>
                                            <div style={{ 
                                                position: 'absolute', top: 0, left: 0, height: '100%', 
                                                width: `${z.safetyLevel}%`, 
                                                background: z.safetyLevel > 70 ? '#10b981' : z.safetyLevel > 40 ? '#f59e0b' : '#ef4444',
                                                borderRadius: '3px', boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
                                            }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {z.ppeList.map((ppe, idx) => (
                                            <div key={idx} style={{ 
                                                padding: '6px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px',
                                                border: '1px solid rgba(148, 163, 184, 0.1)'
                                            }}>
                                                {ppe === 'helmet' && <HardHat size={14} color="#f59e0b" />}
                                                {ppe === 'vest' && <Shield size={14} color="#f59e0b" />}
                                                {ppe === 'boots' && <Hammer size={14} color="#f59e0b" />}
                                                {ppe === 'harness' && <Activity size={14} color="#f59e0b" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dark-card" style={{ padding: '1.2rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        <div style={{ fontWeight: '900', color: '#10b981', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                            <HardHat size={18} /> 구역별 필수 보호구
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {[
                                { icon: HardHat, label: '안전모', color: '#f59e0b' },
                                { icon: Shield, label: '안전화', color: '#10b981' },
                                { icon: Activity, label: '전신그네', color: '#3b82f6' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ 
                                    padding: '12px 5px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                    border: '1px solid rgba(148, 163, 184, 0.1)'
                                }}>
                                    <item.icon size={20} color={item.color} />
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. IoT 장치 인프라 & 가이드라인 사이드바 (Sidebar 2) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
                    
                    {/* IoT 장치 인프라 (Sparklines 적용) */}
                    <div className="dark-card" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ 
                            padding: '1.2rem', background: 'rgba(245, 158, 11, 0.1)', 
                            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: '900', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Wifi size={18} /> IoT 장치 인프라
                            </span>
                            <Plus size={18} color="#f59e0b" style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="dark-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                            {sensors.map(s => (
                                <div key={s.id} style={{ 
                                    padding: '12px', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.3)',
                                    marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px',
                                    border: '1px solid rgba(148, 163, 184, 0.05)'
                                }}>
                                    <div style={{ 
                                        padding: '10px', borderRadius: '12px', 
                                        background: 'rgba(59, 130, 246, 0.15)',
                                        color: '#3b82f6'
                                    }}>
                                        {s.type === 'BEACON' ? <Bluetooth size={18} /> : <Video size={18} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#e2e8f0' }}>{s.id}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>{s.type} · {s.zone}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <Sparkline data={s.signal} color={s.battery > 50 ? '#10b981' : '#f59e0b'} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem' }}>
                                            <Activity size={10} color="#10b981" />
                                            <span style={{ fontWeight: '900', color: '#10b981' }}>{s.battery}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 표준 가이드라인 (Quick Links) */}
                    <div className="dark-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ 
                            padding: '1.2rem', background: 'rgba(99, 102, 241, 0.1)', 
                            borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
                        }}>
                            <span style={{ fontWeight: '900', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Info size={18} /> 표준 가이드라인
                            </span>
                        </div>
                        <div className="dark-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                            {[
                                { title: '주출입구 안전 가이드', sub: '주출입구 설정', icon: ArrowRightCircle, color: '#3b82f6' },
                                { title: '비콘 설치 표준 기준', sub: '비콘 설치 기준', icon: Bluetooth, color: '#f59e0b' },
                                { title: 'CCTV AI 배치 원칙', sub: '배치 원칙 안내', icon: Video, color: '#10b981' }
                            ].map((guide, idx) => (
                                <div key={idx} style={{ 
                                    padding: '12px', borderRadius: '16px', background: 'rgba(30, 41, 59, 0.4)',
                                    marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px',
                                    border: '1px solid rgba(148, 163, 184, 0.1)', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'}
                                >
                                    <div style={{ 
                                        padding: '8px', borderRadius: '10px', 
                                        background: `${guide.color}20`,
                                        color: guide.color
                                    }}>
                                        <guide.icon size={18} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#f1f5f9' }}>{guide.title}</div>
                                        <div style={{ 
                                            padding: '2px 8px', borderRadius: '5px', background: `${guide.color}30`,
                                            display: 'inline-block', fontSize: '0.65rem', fontWeight: '900', color: guide.color,
                                            marginTop: '4px'
                                        }}>
                                            {guide.sub}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LocationManagement;
