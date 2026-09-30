import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Clock, ChevronRight, ShieldAlert, Zap, Filter } from 'lucide-react';

export default function AlertsFeed({ alertsData, onSelectFacility }) {
  const [filter, setFilter] = useState('ALL');

  if (!alertsData) {
    return (
      <div className="content-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading alert stream...
      </div>
    );
  }

  const { totalAlerts, criticalCount, highCount, alerts } = alertsData;

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'HIGH') return a.severity === 'HIGH' || a.severity === 'WARNING';
    return true;
  });

  return (
    <div className="content-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '0.75rem' }}>
        <div>
          <div className="card-title">
            <ShieldAlert size={18} color="#ef4444" />
            Live Priority Alerts Feed
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            {criticalCount} Critical & {highCount} Warning Signals
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            className="btn-secondary"
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.72rem',
              background: filter === 'ALL' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
              color: filter === 'ALL' ? '#0b0f19' : 'var(--text-primary)'
            }}
            onClick={() => setFilter('ALL')}
          >
            All ({alerts.length})
          </button>
          <button
            className="btn-secondary"
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.72rem',
              background: filter === 'CRITICAL' ? '#ef4444' : 'var(--bg-surface-elevated)',
              color: filter === 'CRITICAL' ? '#ffffff' : '#f87171'
            }}
            onClick={() => setFilter('CRITICAL')}
          >
            Critical ({criticalCount})
          </button>
        </div>
      </div>

      {/* Scrollable Alert List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '560px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        paddingRight: '0.25rem'
      }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No active alerts matching filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';

            return (
              <div
                key={alert.id}
                onClick={() => onSelectFacility(alert.facilityId, alert.medicineId)}
                style={{
                  background: isCrit ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface-elevated)',
                  border: `1px solid ${isCrit ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
                  borderLeft: `4px solid ${isCrit ? '#ef4444' : '#f59e0b'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(3px)';
                  e.currentTarget.style.borderColor = isCrit ? '#ef4444' : '#f59e0b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderColor = isCrit ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <span className={`badge ${isCrit ? 'badge-critical' : 'badge-warning'}`}>
                    {alert.severity}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {alert.facilityType?.split(' ')[0]}
                  </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f9fafb', marginBottom: '0.15rem' }}>
                  {alert.facilityName}
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                  {alert.stateId} • {alert.title}
                </div>

                {alert.medicineName && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '0.35rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.73rem',
                    marginBottom: '0.45rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#e5e7eb' }}>Resource: <strong>{alert.medicineName}</strong></span>
                    <span style={{ color: '#67e8f9', fontWeight: 700 }}>{alert.stock} left</span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  color: isCrit ? '#f87171' : '#fbbf24',
                  fontWeight: 600
                }}>
                  <span>Runway: {alert.metric}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#06b6d4' }}>
                    Inspect Details <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
