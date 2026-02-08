
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Briefcase, AlertTriangle, CloudSun, Siren, 
    FileText, Clock, Megaphone, CheckSquare 
} from 'lucide-react';

const Tile = ({ title, content, subContent, icon: Icon, color, onClick, span = 1 }) => (
    <div 
        onClick={onClick}
        style={{ 
            background: color, 
            color: 'white', 
            padding: '1.25rem', 
            borderRadius: '16px', 
            cursor: onClick ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gridColumn: `span ${span}`,
            minHeight: '140px',
            position: 'relative',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            overflow: 'hidden'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', opacity: 0.9 }}>{title}</span>
            {Icon && <Icon size={24} style={{ opacity: 0.8 }} />}
        </div>
        
        <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', lineHeight: '1.2' }}>{content}</div>
            {subContent && (
                <div style={{ fontSize: '0.85rem', marginTop: '4px', opacity: 0.85 }}>{subContent}</div>
            )}
        </div>
    </div>
);

const WorkerMainTiles = ({ project, myPlan, dangerCount, notice, weather, onChecklistClick }) => {
    const navigate = useNavigate();

    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '8px', 
            marginBottom: '1.5rem' 
        }}>
            {/* 1. 금일 나의 작업 (Blue) */}
            <Tile 
                title="금일 나의 작업" 
                content={myPlan ? (myPlan.work_type || myPlan.description) : "작업 없음"}
                subContent={myPlan ? `${myPlan.level} ${myPlan.zone_name}` : "배정된 작업이 없습니다"}
                icon={Briefcase}
                color="#3b82f6" // Blue 500
                span={2}
                onClick={() => {}}
            />

            {/* 2. 금일 나의 위험지역 (Orange) */}
            <Tile 
                title="주변 위험 지역" 
                content={`${dangerCount} 건`}
                subContent="작업 구간 내 위험 요소"
                icon={AlertTriangle}
                color="#f97316" // Orange 500
            />

            {/* 3. 날씨 (Gray Blue) - static for now */}
            <Tile 
                title="현장 날씨" 
                content="맑음 12°C"
                subContent="미세먼지: 좋음"
                icon={CloudSun}
                color="#64748b" // Slate 500
            />

            {/* 4. 긴급알림 (Red) */}
            <Tile 
                title="긴급 알림" 
                content="SOS 호출"
                subContent="위급 상황 발생 시 클릭"
                icon={Siren}
                color="#ef4444" // Red 500
                onClick={() => alert("긴급 호출 기능 준비 중입니다.")}
            />

            {/* 5. 일일 체크리스트 (Green) */}
            <Tile 
                title="일일 안전점검" 
                content="시작하기"
                subContent="작업 전 필수 점검"
                icon={CheckSquare}
                color="#10b981" // Emerald 500
                onClick={onChecklistClick}
            />

            {/* 6. 공지사항 (Indigo) */}
            <Tile 
                title="공지사항" 
                content={notice ? "신규 공지" : "공지 없음"}
                subContent={notice ? notice.title : "등록된 공지사항이 없습니다."}
                icon={Megaphone}
                color="#6366f1" // Indigo 500
                span={2}
            />
        </div>
    );
};

export default WorkerMainTiles;
