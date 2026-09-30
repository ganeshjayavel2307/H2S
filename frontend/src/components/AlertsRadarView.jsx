import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Clock, ShieldAlert, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AlertsRadarView({ alertsData, onNavigateToRedistribution }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');

  if (!alertsData) {
    return <div className="animate-fade" style={{ padding: '2rem', textAlign: 'center' }}>Scanning early warning radar...</div>;
  }

  const { totalAlerts, criticalCount, highCount, mediumCount, alerts } = alertsData;

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="animate-fade">
      {/* Alert Severity KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div>
            <div className="kpi-label">Critical Stockouts</div>
            <div className="kpi-value" style={{ color: '#f87171' }}>{criticalCount}</div>
            <div className="kpi-subtext">Immediate action (&lt; 2.5 days stock)</div>
          </div>
          <div className="kpi-icon-box kpi-icon-red"><AlertTriangle size={22} /></div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div>
            <div className="kpi-label">High Priority Risks</div>
            <div className="kpi-value" style={{ color: '#fbbf24' }}>{highCount}</div>
            <div className="kpi-subtext">Buffer breach (&lt; 6 days stock / &gt;90% beds)</div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber"><AlertCircle size={22} /></div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #06b6d4' }}>
          <div>
            <div className="kpi-label">Moderate Watchlist</div>
            <div className="kpi-value" style={{ color: '#22d3ee' }}>{mediumCount}</div>
            <div className="kpi-subtext">Staffing & inventory surveillance</div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan"><Clock size={22} /></div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Total Active Signals</div>
            <div className="kpi-value">{totalAlerts}</div>
            <div className="kpi-subtext">Across all state tiers</div>
          </div>
          <div className="kpi-icon-box kpi-icon-violet"><ShieldAlert size={22} /></div>
        </div>
      </div>

      {/* Main Alert Stream */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <ShieldAlert size={20} color="#ef4444" />
            Real-Time Healthcare Supply Chain Early Warning Stream
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(s => (
              <button
                key={s}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: severityFilter === s ? 'var(--primary)' : 'var(--bg-surface-elevated)', color: severityFilter === s ? '#0b0f19' : 'var(--text-primary)' }}
                onClick={() => setSeverityFilter(s)}
              >
                {s} ({s === 'ALL' ? totalAlerts : (s === 'CRITICAL' ? criticalCount : (s === 'HIGH' ? highCount : mediumCount))})
              </button>
            ))}
          </div>
        </div>

        {/* Alert List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-subtle)'}`,
                borderLeft: `5px solid ${alert.severity === 'CRITICAL' ? '#ef4444' : (alert.severity === 'HIGH' ? '#f59e0b' : '#06b6d4')}`,
                borderRadius: 'var(--radius-md)',
                padding: '1.15rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ flex: '1 1 500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${alert.severity === 'CRITICAL' ? 'badge-critical' : (alert.severity === 'HIGH' ? 'badge-warning' : 'badge-info')}`}>
                    {alert.severity}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#f9fafb' }}>{alert.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {alert.facilityName} ({alert.stateId})</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', lineHeight: 1.5 }}>
                  {alert.message}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span><strong>Metric:</strong> <span style={{ color: '#22d3ee' }}>{alert.metric}</span></span>
                  <span><strong>Action:</strong> <span style={{ color: '#fbbf24' }}>{alert.actionRequired}</span></span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
                {alert.category.includes('STOCKOUT') || alert.category.includes('LOW_STOCK') ? (
                  <button 
                    className="btn-primary" 
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', justifyContent: 'center' }}
                    onClick={() => onNavigateToRedistribution(alert.facilityId, alert.medicineId)}
                  >
                    <Truck size={14} /> Resolve with AI Transfer
                  </button>
                ) : (
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', justifyContent: 'center' }}
                    onClick={() => alert(`Escalation notification dispatched to State Health Director for ${alert.facilityName}.`)}
                  >
                    <CheckCircle2 size={14} /> Acknowledge Alert
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
