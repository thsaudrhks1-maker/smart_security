
import React, { useState, useEffect } from 'react';
import apiClient from '@/api/client';
import { FileText, Shield, HardHat, Info, ChevronRight, CheckCircle } from 'lucide-react';

const AdminContents = () => {
  const [contents, setContents] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, rRes] = await Promise.all([
          apiClient.get('/sys/contents'),
          apiClient.get('/sys/resources')
        ]);
        setContents(Array.isArray(cRes.data) ? cRes.data : []);
        setResources(Array.isArray(rRes.data) ? rRes.data : []);
      } catch (e) {
        console.error('콘텐츠 로드 실패', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allRules = resources.flatMap((r) => (r.safety_rules || []).map((text) => ({ resourceName: r.name, text })));

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontWeight: '800' }}>콘텐츠 데이터를 불러오는 중...</div>;
  }

  return (
    <div style={{ padding: '2.5rem', maxWidth: '1000px', margin: '0 auto', color: '#1e293b' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
          <FileText size={32} color="#3b82f6" /> 통합 콘텐츠 및 안전 자원 관리
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          시스템에 등록된 공정별 안전 장비, 장비별 필수 수칙을 확인합니다.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
        
        {/* Safety Rules Section */}
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={22} color="#10b981" /> 공종별 통합 안전 수칙
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allRules.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', color: '#94a3b8' }}>등록된 수칙이 없습니다.</div>
            ) : allRules.map((item, idx) => (
              <div key={idx} style={{ padding: '1.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', gap: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#10b981', marginBottom: '4px', textTransform: 'uppercase' }}>{item.resourceName}</div>
                  <div style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600', lineHeight: 1.5 }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Equipments Section */}
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardHat size={22} color="#3b82f6" /> 관리 대상 안전 장비
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {resources.map((res) => (
              <div key={res.id} style={{ padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%' }} />
                    <span style={{ fontWeight: '800', color: '#1e293b' }}>{res.name}</span>
                 </div>
                 <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>수칙 {res.safety_rules?.length || 0}건</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#eff6ff', borderRadius: '20px', border: '1px dashed #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Info size={18} color="#3b82f6" />
              <span style={{ fontWeight: '900', color: '#1e40af', fontSize: '0.95rem' }}>관리자 안내</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.6 }}>
              현재는 시스템에 사전 등록된 고정 데이터를 표시합니다. 향후 **콘텐츠 에디터** 기능을 통해 관리자가 직접 수칙을 수정하고 새로운 장비를 등록할 수 있는 기능이 업데이트될 예정입니다.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminContents;
