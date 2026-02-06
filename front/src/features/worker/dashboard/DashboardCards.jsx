import React from 'react';
import { 
  Briefcase, AlertTriangle, Cloud, Bell, CheckCircle, Shield, FileText, ChevronRight
} from 'lucide-react';

/**
 * Í∑ºÎ°ú???Ä?úÎ≥¥???ÑÏö© Ïπ¥Îìú Ïª¥Ìè¨?åÌä∏ Î™®Ïùå
 */

export const WorkCard = ({ plan, count, onClick }) => (
  <div 
    onClick={onClick}
    className="dashboard-card"
    style={{ 
      gridColumn: '1 / 2',
      gridRow: 'span 2',
      background: '#3b82f6', 
      color: 'white',
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between'
    }}
  >
    <div>
      <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Briefcase size={18} /> Í∏àÏùº ?òÏùò ?ëÏóÖ
      </div>
      {plan ? (
        <>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '4px 8px', 
            borderRadius: '12px', 
            display: 'inline-block', 
            fontSize: '0.75rem', 
            marginBottom: '0.5rem' 
          }}>
            {plan.work_type}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', lineHeight: '1.35', wordBreak: 'keep-all' }}>
            {plan.description || ''}
          </div>
          {plan.calculated_risk_score >= 50 && (
            <div style={{ 
              marginTop: '6px', 
              fontSize: '0.75rem', 
              background: plan.calculated_risk_score >= 80 ? 'rgba(255,50,50,0.4)' : 'rgba(255,165,0,0.4)', 
              border: '1px solid rgba(255,255,255,0.4)', 
              color: '#fff', 
              padding: '2px 6px', 
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertTriangle size={12} /> ?ÑÌóò??{plan.calculated_risk_score}
            </div>
          )}
          <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.5rem' }}>
             {plan.zone_name}
          </div>
          {count > 1 && (
              <div style={{ fontSize: '0.75rem', marginTop: '6px', opacity: 0.8 }}>
                  + ??{count - 1}Í±?
              </div>
          )}
        </>
      ) : (
        <div style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '1rem' }}>Î∞∞Ï†ï???ëÏóÖ???ÜÏäµ?àÎã§.</div>
      )}
    </div>
    <div style={{ alignSelf: 'flex-end' }}>
       <ChevronRight size={20} style={{ opacity: 0.7 }} />
    </div>
  </div>
);

export const WeatherCard = ({ weather }) => (
  <div style={{ background: '#60a5fa', color: 'white' }} className="dashboard-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
          {weather?.temperature || '-'}
        </div>
        <div style={{ fontSize: '0.8rem' }}>
          {weather?.condition || '?ïÎ≥¥?ÜÏùå'}
        </div>
      </div>
      <Cloud size={24} style={{ opacity: 0.8 }} />
    </div>
  </div>
);

export const EmergencyAlertCard = ({ alert, onClick }) => (
  <div 
    onClick={onClick}
    style={{ background: '#ef4444', color: 'white' }} 
    className="dashboard-card"
  >
    <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Bell size={14} /> Í∏¥Í∏â?åÎ¶º
    </div>
    <div style={{ fontSize: '0.9rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {alert?.title || '?åÎ¶º ?ÜÏùå'}
    </div>
     {alert && (
      <div style={{ 
        width: '8px', height: '8px', background: 'white', borderRadius: '50%', 
        position: 'absolute', top: '10px', right: '10px',
        animation: 'blink 1s infinite'
      }} />
    )}
  </div>
);

export const RiskCard = ({ risks, onClick }) => (
  <div 
    onClick={onClick}
    className="dashboard-card"
    style={{ 
      gridColumn: '1 / 2',
      gridRow: 'span 2',
      background: '#f97316', 
      color: 'white',
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between'
    }}
  >
    <div>
      <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <AlertTriangle size={18} /> ?ÑÌóòÏßÄ??
      </div>
      {risks.length > 0 ? (
        <div>
          <div style={{ fontSize: '1.0rem', fontWeight: '800', lineHeight: '1.4', marginBottom: '6px', wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>
            {risks[0].description}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
             {risks[0].name}
          </div>
          {risks.length > 1 && (
            <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>
              ??{risks.length - 1}Í±?
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <CheckCircle size={20} /> ?àÏ†Ñ??
        </div>
      )}
    </div>
     <div style={{ alignSelf: 'flex-end' }}>
       <Shield size={24} style={{ opacity: 0.3 }} />
    </div>
  </div>
);

export const SafetyInfoCard = ({ count, onClick }) => (
  <div 
    onClick={onClick}
     style={{ background: '#10b981', color: 'white' }} 
     className="dashboard-card"
  >
    <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>?ºÏùº ?àÏ†Ñ?ïÎ≥¥</div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
         <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{count || 0}</span>
         <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '2px' }}>Í±?/span>
      </div>
      <FileText size={20} style={{ opacity: 0.5 }} />
    </div>
  </div>
);

export const NoticeBar = ({ notice, onClick }) => (
  <div 
    onClick={onClick}
    className="dashboard-card"
    style={{ 
      gridColumn: '1 / -1', 
      background: '#64748b', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Bell size={18} />
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '2px' }}>Í≥µÏ??¨Ìï≠</div>
        <div style={{ fontSize: '0.9rem' }}>
          {notice ? notice.title : '?±Î°ù??Í≥µÏ?Í∞Ä ?ÜÏäµ?àÎã§.'}
        </div>
      </div>
    </div>
    <ChevronRight size={18} style={{ opacity: 0.7 }} />
  </div>
);

export const StatCards = ({ violations, incidentFreeDays }) => (
  <>
    <div key="violation" style={{ background: '#8b5cf6', color: 'white', textAlign: 'center' }} className="dashboard-card">
        <div style={{ fontSize: '0.7rem' }}>?àÏ†Ñ?ÑÎ∞ò</div>
        <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{violations || 0}Í±?/div>
    </div>
    <div key="accident-free" style={{ background: '#6366f1', color: 'white', textAlign: 'center' }} className="dashboard-card">
        <div style={{ fontSize: '0.7rem' }}>Î¨¥Ïû¨??/div>
        <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{incidentFreeDays || 0}??/div>
    </div>
  </>
);
