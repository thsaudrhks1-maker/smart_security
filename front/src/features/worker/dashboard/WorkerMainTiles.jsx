
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Briefcase, AlertTriangle, CloudSun, Siren, 
    FileText, Clock, Megaphone, CheckSquare,
    ChevronRight, Zap
} from 'lucide-react';

const Tile = ({ title, content, subContent, icon: Icon, gradient, onClick, span = 1, children, isUrgent = false }) => (
    <div 
        onClick={onClick}
        className="premium-tile"
        style={{ 
            background: gradient,
            padding: '1.2rem', 
            borderRadius: '24px', 
            cursor: onClick ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            gridColumn: `span ${span}`,
            minHeight: '145px',
            position: 'relative',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: isUrgent ? 'pulse-red 2s infinite' : 'none'
        }}
    >
        {/* 장식용 배경 원형 */}
        <div style={{ 
            position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', 
            background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 0 
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '900', opacity: 0.8, color: 'white', letterSpacing: '-0.02em' }}>{title}</span>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '12px' }}>
                {Icon && <Icon size={18} color="white" />}
            </div>
        </div>
        
        <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
            {children || (
                <>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', lineHeight: '1.2', color: 'white' }}>{content}</div>
                    {subContent && (
                        <div style={{ fontSize: '0.75rem', marginTop: '6px', opacity: 0.9, color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>{subContent}</div>
                    )}
                </>
            )}
        </div>

        {onClick && (
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', opacity: 0.5 }}>
                <ChevronRight size={16} color="white" />
            </div>
        )}
    </div>
);

const NoticeItem = ({ title, time, type }) => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        gap: '12px'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {type === 'IMPORTANT' ? (
                <div style={{ background: '#f59e0b', padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', whiteSpace: 'nowrap' }}>중요</div>
            ) : (
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', whiteSpace: 'nowrap' }}>공지</div>
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>{title}</span>
        </div>
        <span style={{ fontSize: '0.7rem', opacity: 0.6, flexShrink: 0, color: 'white', fontWeight: '600' }}>{time}</span>
    </div>
);

const WorkerMainTiles = ({ project, myPlan, dangerCount, notices, weather, onChecklistClick, onNoticeClick }) => {
    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px', 
            marginBottom: '1.5rem' 
        }}>
            {/* 1. 금일 나의 작업 (Curated Blue Gradient) */}
            <Tile 
                title="금일 나의 작업" 
                content={myPlan ? (myPlan.work_type || myPlan.description) : "작업 없음"}
                subContent={myPlan ? `${myPlan.level} ${myPlan.zone_name}` : "배정된 작업이 없습니다"}
                icon={Briefcase}
                gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                span={2}
                onClick={() => {}}
            />

            {/* 2. 금일 나의 위험지역 (Crimson to Orange) */}
            <Tile 
                title="주변 위험 지역" 
                content={`${dangerCount} 건 감지`}
                subContent="섹터 내 실시간 위험"
                icon={AlertTriangle}
                gradient="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
            />

            {/* 3. 일일 안전점검 (Emerald to Green) */}
            {myPlan && myPlan.isChecked ? (
                <Tile 
                    title="일일 안전점검" 
                    content="점검 완료"
                    subContent="안전 수칙 준수 중"
                    icon={CheckSquare}
                    gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    onClick={() => onChecklistClick()}
                />
            ) : (
                <Tile 
                    title="일일 안전점검" 
                    content="점검 시작"
                    subContent="작업 전 필수 수칙"
                    icon={Zap}
                    gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                    onClick={onChecklistClick}
                />
            )}

            {/* 4. 날씨 (Slate to Slate) */}
            <Tile 
                title="현장 날씨" 
                content="맑음 12°C"
                subContent="미세먼지: 좋음"
                icon={CloudSun}
                gradient="linear-gradient(135deg, #475569 0%, #1e293b 100%)"
            />

            {/* 5. 긴급알림 (Red Pulse) */}
            <Tile 
                title="긴급 응급호출" 
                content="SOS 발신"
                subContent="즉시 도움 요청"
                icon={Siren}
                gradient="linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
                isUrgent={true}
                onClick={() => alert("긴급 호출 기능 준비 중입니다.")}
            />

            {/* 6. 공지사항 (Indigo to Navy) - 리스트 형태 */}
            <Tile 
                title="최신 공지사항" 
                icon={Megaphone}
                gradient="linear-gradient(135deg, #6366f1 0%, #4338ca 100%)"
                span={2}
                onClick={onNoticeClick}
            >
                {(!notices || notices.length === 0) ? (
                    <div style={{ fontSize: '1rem', fontWeight: '900', color: 'white', marginTop: '10px' }}>등록된 공지사항이 없습니다.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
                        {notices.slice(0, 2).map(n => (
                            <NoticeItem 
                                key={n.id} 
                                title={n.title} 
                                time={new Date(n.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                type={n.notice_type}
                            />
                        ))}
                    </div>
                )}
            </Tile>

            <style dangerouslySetInnerHTML={{ __html: `
                .premium-tile:active {
                    transform: scale(0.96);
                    filter: brightness(0.9);
                }
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}} />
        </div>
    );
};

export default WorkerMainTiles;
