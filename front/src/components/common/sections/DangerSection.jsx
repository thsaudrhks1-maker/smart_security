import React from 'react';
import { AlertTriangle, Plus, Megaphone } from 'lucide-react';
import DangerForm from '../forms/DangerForm';
import DangerCard from '../cards/DangerCard';

/**
 * 위험 구역 섹션 - 다크 테마 적용
 */
const DangerSection = ({
    mode,
    setMode,
    dangers,
    dangerForm,
    setDangerForm,
    dangerTemplates,
    files,
    setFiles,
    onCreateDanger,
    onDeleteDanger,
    onCancelDanger,
    viewerType = 'MANAGER',
    onApprove
}) => {
    return (
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
                    color: '#f87171', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px' 
                }}>
                    <AlertTriangle size={20} /> 실시간 위험 현황
                </h3>
                {mode === 'view' && (
                    <button 
                        onClick={() => setMode('add_danger')}
                        className="dark-button"
                        style={{ 
                            padding: '8px 16px', 
                            background: viewerType === 'WORKER' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                            color: viewerType === 'WORKER' ? '#fbbf24' : '#f87171', 
                            borderColor: viewerType === 'WORKER' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                            fontSize: '0.85rem', 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {viewerType === 'WORKER' ? <><Megaphone size={16} /> 위험 요소 긴급 신고</> : <><Plus size={16} /> 신규 위험 구역 등록</>}
                    </button>
                )}
            </div>

            {mode === 'add_danger' ? (
                <DangerForm 
                    dangerForm={dangerForm}
                    setDangerForm={setDangerForm}
                    dangerTemplates={dangerTemplates}
                    files={files}
                    setFiles={setFiles}
                    onSubmit={onCreateDanger}
                    mode={viewerType}
                    onCancel={onCancelDanger}
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {dangers.length === 0 ? (
                        <div className="dark-empty-state" style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '20px' }}>
                            설정된 위험 구역이 없습니다.
                        </div>
                    ) : (
                        dangers.map(danger => (
                            <DangerCard 
                                key={danger.id} 
                                danger={danger}
                                onDelete={viewerType === 'MANAGER' ? () => onDeleteDanger(danger.id) : undefined}
                                onApprove={onApprove}
                                viewerType={viewerType}
                            />
                        ))
                    )}
                </div>
            )}
        </section>
    );
};

export default DangerSection;
