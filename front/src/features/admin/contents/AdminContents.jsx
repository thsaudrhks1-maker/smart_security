import React, { useState, useEffect } from 'react';
import { FileText, HardHat, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { workApi } from '../../../api/workApi';

const TAB = { PROCESS: '공정', RULES: '안전수칙', EQUIPMENT: '안전공구' };

/**
 * 최고관리자 - 콘텐츠 관리 (공정·안전장비·안전수칙 열람)
 * DB에 등록된 작업 공정과 장구류, 안전수칙을 토글 카테고리로 표시
 */
const AdminContents = () => {
  const [activeTab, setActiveTab] = useState(TAB.PROCESS);
  const [templates, setTemplates] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [contents, allResources] = await Promise.all([
          workApi.getTemplatesContents(),
          workApi.getSafetyResources(),
        ]);
        setTemplates(Array.isArray(contents) ? contents : []);
        setResources(Array.isArray(allResources) ? allResources : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allRules = resources.flatMap((r) => (r.safety_rules || []).map((text) => ({ resourceName: r.name, text })));

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>로딩 중...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
        <FileText size={28} color="#3b82f6" />
        콘텐츠 관리
      </h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        등록된 공정·안전장비·안전수칙을 확인합니다. (추후 관리자 직접 수정 기능 추가 예정)
      </p>

      {/* 카테고리 토글 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[TAB.PROCESS, TAB.EQUIPMENT, TAB.RULES].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: activeTab === tab ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              background: activeTab === tab ? '#eff6ff' : 'white',
              color: activeTab === tab ? '#1d4ed8' : '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {tab === TAB.PROCESS && <HardHat size={18} />}
            {tab === TAB.EQUIPMENT && <Shield size={18} />}
            {tab === TAB.RULES && <FileText size={18} />}
            {tab}
          </button>
        ))}
      </div>

      {/* 공정 리스트 */}
      {activeTab === TAB.PROCESS && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>공정 목록 ({templates.length}건)</div>
          {templates.map((t) => {
            const isExpanded = expandedId === `t-${t.id}`;
            return (
              <div key={t.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: 'white' }}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : `t-${t.id}`)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 16px',
                    border: 'none',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#1e293b',
                  }}
                >
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  {t.work_type}
                  <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
                    위험도 {t.base_risk_score} · 장구류 {t.required_resources?.length ?? 0}종
                  </span>
                </button>
                {isExpanded && (
                  <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                    {t.checklist_items?.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>점검 항목</div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#334155' }}>
                          {t.checklist_items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {t.required_resources?.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>필요 안전공구</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {t.required_resources.map((r) => (
                            <span key={r.id} style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                              {r.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 안전공구 리스트 */}
      {activeTab === TAB.EQUIPMENT && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>안전공구·장비 목록 ({resources.length}건)</div>
          {resources.map((r) => {
            const isExpanded = expandedId === `r-${r.id}`;
            return (
              <div key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: 'white' }}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : `r-${r.id}`)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 16px',
                    border: 'none',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#1e293b',
                  }}
                >
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  {r.name}
                  <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>{r.type}</span>
                </button>
                {isExpanded && (
                  <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                    {r.description && <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '10px' }}>{r.description}</p>}
                    {r.safety_rules?.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>안전수칙</div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#334155' }}>
                          {r.safety_rules.map((rule, i) => (
                            <li key={i}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 안전수칙 리스트 (장비별 수칙 모음) */}
      {activeTab === TAB.RULES && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>안전수칙 ({allRules.length}건)</div>
          {allRules.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>등록된 안전수칙이 없습니다.</div>
          ) : (
            allRules.map((item, i) => (
              <div key={i} style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: '600', color: '#475569' }}>[{item.resourceName}]</span> {item.text}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminContents;
