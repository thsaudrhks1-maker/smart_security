import React from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import DangerForm from '../forms/DangerForm';
import DangerCard from '../cards/DangerCard';

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
    onCancelDanger
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
                <DangerForm 
                    dangerForm={dangerForm}
                    setDangerForm={setDangerForm}
                    dangerTemplates={dangerTemplates}
                    files={files}
                    setFiles={setFiles}
                    onSubmit={onCreateDanger}
                    mode="MANAGER"
                    onCancel={onCancelDanger}
                />
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
                                onDelete={() => onDeleteDanger(danger.id)}
                            />
                        ))
                    )}
                </div>
            )}
        </section>
    );
};

export default DangerSection;
