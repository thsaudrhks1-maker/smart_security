import React, { useState, useEffect } from 'react';
import { workApi } from '../../../api/workApi';
import { getMyWorkers } from '../../../api/managerApi';
import apiClient from '../../../api/client'; // zone api 호출용
import { Calendar, Plus, MapPin, HardHat, Users, AlertTriangle, ChevronLeft, ChevronRight, X } from 'lucide-react';

const DailyPlanManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 데이터 로딩
  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await workApi.getPlans({ date: selectedDate });
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [selectedDate]);

  // 날짜 이동
  const handleDateChange = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar color="#3b82f6" size={28} /> 일일 작업 계획
          </h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>작업 구역과 근로자를 배정하고 위험도를 관리합니다.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* 날짜 네비게이터 */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '5px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <button onClick={() => handleDateChange(-1)} style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer', color: '#64748b' }}><ChevronLeft size={20}/></button>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', fontSize: '1rem', fontWeight: '700', color: '#334155', padding: '0 10px', outline: 'none' }}
            />
            <button onClick={() => handleDateChange(1)} style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer', color: '#64748b' }}><ChevronRight size={20}/></button>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: '#3b82f6', color: 'white', padding: '10px 20px', 
              borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' 
            }}
          >
            <Plus size={20} /> 작업 등록
          </button>
        </div>
      </div>

      {/* 작업 리스트 (Kanban Card Style) */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>데이터 로딩 중...</div>
        ) : plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#94a3b8' }}>
                <HardHat size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>등록된 작업 계획이 없습니다.</p>
                <p>상단의 버튼을 눌러 작업을 추가하세요.</p>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {plans.map(plan => (
                    <PlanCard key={plan.id} plan={plan} />
                ))}
            </div>
        )}
      </div>

      {showModal && (
        <CreatePlanModal 
            onClose={() => setShowModal(false)} 
            currDate={selectedDate}
            onSuccess={() => { setShowModal(false); loadPlans(); }} 
        />
      )}
    </div>
  );
};

// 개별 작업 카드 컴포넌트
const PlanCard = ({ plan }) => {
    // Risk Score에 따른 색상
    const riskColor = plan.calculated_risk_score >= 80 ? '#ef4444' : plan.calculated_risk_score >= 50 ? '#f59e0b' : '#22c55e';
    const riskText = plan.calculated_risk_score >= 80 ? '고위험' : plan.calculated_risk_score >= 50 ? '주의' : '양호';

    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: `5px solid ${riskColor}`, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ 
                    background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', 
                    fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' 
                }}>
                    <MapPin size={12} /> {plan.zone_name}
                </span>
                <span style={{ color: riskColor, fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={14} /> {riskText} ({plan.calculated_risk_score})
                </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                {plan.work_type}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                {plan.description || "상세 설명이 없습니다."}
            </p>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>배정 인원</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {plan.allocations.length > 0 ? plan.allocations.map(a => (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '6px' }}>
                            <div style={{ width: '24px', height: '24px', background: '#cbd5e1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={14} color="white" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{a.worker_name}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{a.role}</span>
                            </div>
                        </div>
                    )) : (
                        <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>배정된 인원이 없습니다.</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// 작업 등록 모달
const CreatePlanModal = ({ onClose, currDate, onSuccess }) => {
    // 폼 상태
    const [formData, setFormData] = useState({
        date: currDate,
        zone_id: '',
        template_id: '',
        description: '',
        equipment_flags: [],
        worker_ids: [] // 단순화를 위해 ID만 저장
    });

    // 데이터 소스
    const [zones, setZones] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [workers, setWorkers] = useState([]);
    
    useEffect(() => {
        const loadSources = async () => {
            const z = await apiClient.get('/safety/zones');
            const t = await workApi.getTemplates();
            const w = await getMyWorkers(); // API 필요
            setZones(z.data);
            setTemplates(t);
            setWorkers(w);
        };
        loadSources();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 데이터 변환
        const payload = {
            site_id: 1, // 임시 고정 (로그인 유저 기준 가져와야 함)
            zone_id: parseInt(formData.zone_id),
            template_id: parseInt(formData.template_id),
            date: formData.date,
            description: formData.description,
            equipment_flags: [], // UI 미구현으로 빈배열
            status: "PLANNED",
            allocations: formData.worker_ids.map(id => ({ worker_id: parseInt(id), role: "작업자" }))
        };

        try {
            await workApi.createPlan(payload);
            onSuccess();
        } catch (err) {
            alert('등록 실패');
            console.error(err);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', width: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>새 작업 등록</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* 날짜 */}
                    <label>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569' }}>작업일자</div>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </label>

                    {/* 구역 */}
                    <label>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569' }}>작업 구역</div>
                        <select value={formData.zone_id} onChange={e => setFormData({...formData, zone_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required>
                            <option value="">선택하세요</option>
                            {zones.map(z => <option key={z.id} value={z.id}>[{z.level}] {z.name}</option>)}
                        </select>
                    </label>

                    {/* 공종(템플릿) */}
                    <label>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569' }}>작업 종류(공종)</div>
                        <select value={formData.template_id} onChange={e => setFormData({...formData, template_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required>
                            <option value="">선택하세요</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.work_type} (위험도: {t.base_risk_score})</option>)}
                        </select>
                    </label>

                    {/* 내용 */}
                    <label>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569' }}>상세 내용</div>
                        <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="예: 2층 A구역 벽체 미장 작업" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </label>

                    {/* 작업자 (Multi Select 대용 - 체크박스 리스트) */}
                    <div>
                        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#475569' }}>작업자 배정</div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                            {workers.map(w => {
                                const isSelected = formData.worker_ids.includes(w.id);
                                return (
                                    <div 
                                        key={w.id} 
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', 
                                            marginBottom: '4px',
                                            borderRadius: '6px',
                                            background: isSelected ? '#eff6ff' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onClick={() => {
                                            const newIds = isSelected 
                                                ? formData.worker_ids.filter(id => id !== w.id)
                                                : [...formData.worker_ids, w.id];
                                            setFormData({...formData, worker_ids: newIds});
                                        }}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={isSelected}
                                            readOnly
                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                        />
                                        <span style={{ 
                                            color: '#1e293b', // 진한 색상으로 변경
                                            fontSize: '0.95rem',
                                            fontWeight: isSelected ? '600' : '400'
                                        }}>
                                            {w.full_name} <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({w.job_type})</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: '1rem', background: '#3b82f6', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                        등록하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DailyPlanManagement;
