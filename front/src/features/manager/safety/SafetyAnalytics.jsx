import React, { useState } from 'react';
import { 
    ShieldCheck, 
    TrendingUp, 
    AlertTriangle, 
    Users, 
    Award, 
    ChevronRight,
    Search,
    Filter,
    Building2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const SafetyAnalytics = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('weekly');

    // 1. 가상 분석 데이터 (협력사별 안전 점수)
    const companyStats = [
        { id: 1, name: '대건건설', score: 95, status: 'EXCELLENT', violations: 0, compliance: 100, trend: '+2' },
        { id: 2, name: '세종건설', score: 88, status: 'GOOD', violations: 2, compliance: 92, trend: '-1' },
        { id: 3, name: '대진기술', score: 72, status: 'NORMAL', violations: 5, compliance: 85, trend: '+5' },
        { id: 4, name: '한국전기', score: 64, status: 'WARNING', violations: 12, compliance: 70, trend: '-3' },
    ];

    // 2. 가상 분석 데이터 (구역별 위험도)
    const zoneRisks = [
        { zone: 'B1 (기초공사)', risk: 85, color: '#ef4444' },
        { zone: '1F (골조공사)', risk: 45, color: '#f59e0b' },
        { zone: '2F (마감공사)', risk: 20, color: '#10b981' },
        { zone: '기타/야적장', risk: 10, color: '#3b82f6' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'EXCELLENT': return '#10b981';
            case 'GOOD': return '#3b82f6';
            case 'NORMAL': return '#f59e0b';
            case 'WARNING': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#f1f5f9' }}>
            
            {/* 상단 헤더 및 필터 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>
                        안전 정도 관리 <span style={{ color: '#3b82f6', fontSize: '0.9rem' }}>Analytics</span>
                    </h1>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>전체 현장의 안전 체력을 데이터로 분석합니다.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.5)', padding: '4px', borderRadius: '8px' }}>
                    {['daily', 'weekly', 'monthly'].map(p => (
                        <button 
                            key={p}
                            onClick={() => setSelectedPeriod(p)}
                            style={{ 
                                padding: '6px 16px', 
                                border: 'none', 
                                borderRadius: '6px', 
                                fontSize: '0.75rem', 
                                fontWeight: '700',
                                cursor: 'pointer',
                                background: selectedPeriod === p ? '#3b82f6' : 'transparent',
                                color: selectedPeriod === p ? '#fff' : '#64748b',
                                transition: '0.2s'
                            }}
                        >
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* 메인 지표 카드 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <AnalyticsCard title="통합 안전 점수" value="87" unit="pts" icon={<Award size={20} />} trend="+3.2%" isUp={true} color="#3b82f6" />
                <AnalyticsCard title="점검 이행률" value="98.5" unit="%" icon={<ShieldCheck size={20} />} trend="+0.5%" isUp={true} color="#10b981" />
                <AnalyticsCard title="위반 건수" value="12" unit="건" icon={<AlertTriangle size={20} />} trend="-2건" isUp={false} color="#ef4444" />
                <AnalyticsCard title="안전 교육 이수" value="156" unit="명" icon={<Users size={20} />} trend="완료" isUp={true} color="#8b5cf6" />
            </div>

            {/* 상세 분석 섹션 1: 협력사(상판) & 데이터 기반 주간 추이 & 구역별 위험도 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.2fr) 1.5fr 1fr', gap: '1rem' }}>
                
                {/* 1. 협력사 안전 성적표 (ProgressBar 복원) */}
                <div className="manager-card" style={{ 
                    padding: '1.2rem', 
                    display: 'flex', 
                    flexDirection: 'column',
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={16} color="#3b82f6" />
                            <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0 }}>협력사 성적표</h2>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>이행률 기반</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {companyStats.map((item, idx) => (
                            <div key={item.id} style={{ 
                                padding: '10px', 
                                background: 'rgba(15, 23, 42, 0.3)', 
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.03)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>{item.name}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '900', color: getStatusColor(item.status) }}>{item.score} <span style={{fontSize:'0.6rem', color:'#64748b'}}>pts</span></span>
                                </div>
                                <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.compliance}%` }}
                                        transition={{ duration: 1 }}
                                        style={{ height: '100%', background: getStatusColor(item.status) }} 
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                    <span style={{ fontSize: '0.6rem', color: '#64748b' }}>이행률 {item.compliance}%</span>
                                    <span style={{ fontSize: '0.6rem', fontWeight: '800', color: getStatusColor(item.status) }}>{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. 고도화된 주간 안전지수 추이 (데이터 근거 포함) */}
                <div className="manager-card" style={{ 
                    padding: '1.2rem',
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={16} color="#10b981" />
                            <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0 }}>데이터 기반 안전지수 추이</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '0.65rem', fontWeight: '700' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width:6,height:6,borderRadius:3,background:'#3b82f6'}}/> 점검건수</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{width:6,height:6,borderRadius:3,background:'#ef4444'}}/> 위반사례</span>
                        </div>
                    </div>

                    {/* 복합 차트 영역 */}
                    <div style={{ flex: 1, position: 'relative', minHeight: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 5px' }}>
                        {[0, 25, 50, 75, 100].map(val => (
                            <div key={val} style={{ position: 'absolute', bottom: `${val}%`, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.02)' }} />
                        ))}
                        
                        {[
                            { day: 'Mon', score: 75, check: 5, alert: 1 },
                            { day: 'Tue', score: 82, check: 12, alert: 0 },
                            { day: 'Wed', score: 78, check: 8, alert: 2 },
                            { day: 'Thu', score: 91, check: 15, alert: 0 },
                            { day: 'Fri', score: 87, check: 10, alert: 0 },
                            { day: 'Sat', score: 65, check: 4, alert: 3 },
                            { day: 'Sun', score: 70, check: 6, alert: 1 },
                        ].map((d, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '13%' }}>
                                {/* 점수 막대 */}
                                <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection:'column', alignItems: 'center', gap:'2px' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '900', color: d.score > 80 ? '#60a5fa' : '#64748b' }}>{d.score}</div>
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${d.score * 1.2}px` }}
                                        transition={{ duration: 1, delay: idx * 0.05 }}
                                        style={{ 
                                            width: '20px', 
                                            background: d.score > 80 ? 'linear-gradient(to top, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.5))' : 'rgba(255,255,255,0.05)',
                                            borderRadius: '4px 4px 2px 2px',
                                            borderTop: d.score > 80 ? '2px solid #60a5fa' : '2px solid rgba(255,255,255,0.1)'
                                        }} 
                                    />
                                </div>
                                
                                {/* 데이터 근거 (점검/위반 칩) */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                                    <div style={{ background: '#3b82f620', color: '#60a5fa', fontSize: '0.6rem', textAlign: 'center', borderRadius: '2px', padding: '1px' }}>
                                        {d.check}건
                                    </div>
                                    <div style={{ background: d.alert > 0 ? '#ef444420' : 'transparent', color: d.alert > 0 ? '#f87171' : 'transparent', fontSize: '0.6rem', textAlign: 'center', borderRadius: '2px', padding: '1px' }}>
                                        {d.alert > 0 ? `${d.alert}건` : '-'}
                                    </div>
                                </div>

                                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '800', marginTop:'2px' }}>{d.day}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '1rem', padding: '10px', background: 'rgba(15, 23, 42, 0.2)', borderRadius: '6px', fontSize: '0.7rem', color: '#94a3b8' }}>
                        <span style={{ color: '#60a5fa', fontWeight: '900' }}>Insight:</span> 목요일은 점검 이행도가 15건으로 주간 최고치를 기록하며 점수가 상승했습니다.
                    </div>
                </div>

                {/* 3. 구역별 위험도 */}
                <div className="manager-card" style={{ 
                    padding: '1.2rem',
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                        <AlertTriangle size={16} color="#ef4444" />
                        <h2 style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0 }}>구역 위험 지수</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {zoneRisks.slice(0, 3).map((z, idx) => (
                            <div key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
                                    <span style={{ color: '#94a3b8', fontWeight: '700' }}>{z.zone.split(' ')[0]}</span>
                                    <span style={{ color: z.color, fontWeight: '900' }}>{z.risk}%</span>
                                </div>
                                <div style={{ height: '6px', width: '100%', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${z.risk}%`, background: z.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 섹션 2: 점수 산정 로직 & 비고 */}
            <div className="manager-card" style={{ 
                padding: '1.5rem',
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <AlertTriangle size={18} color="#f59e0b" />
                    <h2 style={{ fontSize: '1rem', fontWeight: '900', margin: 0 }}>안전 점수산정 로직 (Guide)</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <LogicItem label="기본 점수 (Base)" desc="일일 체크리스트 이행 여부 및 안전 교육 이수 현황을 합산하여 60점 기본 부여" />
                    <LogicItem label="가점 항목 (Bonus)" desc="안전 수칙 준수 우수 근로자 포상 및 자발적 위험 신고 건당 +2점 가산" />
                    <LogicItem label="감점 항목 (Penalty)" desc="안전 보호구 미착용(-5점), 무단 구역 진입(-10점) 시 즉각적이고 누적적인 감점 적용" />
                </div>
            </div>

        </div>
    );
};

// 재사용 가능한 지표 카드 컴포넌트
const AnalyticsCard = ({ title, value, unit, icon, trend, isUp, color }) => (
    <div className="manager-card" style={{ 
        padding: '1.2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '8px', background: `${color}15`, borderRadius: '10px', color: color }}>
                {icon}
            </div>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '2px', 
                fontSize: '0.7rem', 
                fontWeight: '800', 
                color: isUp ? '#10b981' : '#ef4444' 
            }}>
                {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
            </div>
        </div>
        <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900' }}>
                {value}<span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px', fontWeight: '600' }}>{unit}</span>
            </div>
        </div>
    </div>
);

const LogicItem = ({ label, desc }) => (
    <div style={{ padding: '15px', background: 'rgba(15, 23, 42, 0.2)', borderRadius: '10px', borderLeft: '3px solid #3b82f6' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>{desc}</div>
    </div>
);

export default SafetyAnalytics;
