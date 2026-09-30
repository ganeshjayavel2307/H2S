import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Bed, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  ArrowRight,
  Truck,
  CheckCircle2,
  Biohazard
} from 'lucide-react';

export default function OverviewDashboard({ stats, surveillance, onNavigate }) {
  if (!stats) {
    return <div className="animate-fade" style={{ padding: '2rem', textAlign: 'center' }}>Loading National Health Data...</div>;
  }

  const { beds, staff, supplyChainHealth, federatedAI } = stats;

  return (
    <div className="animate-fade">
      {/* Top Banner Notice */}
      <div className="alert-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="pulse-dot danger"></div>
          <div>
            <span style={{ fontWeight: 700, color: '#f87171' }}>NATIONAL EARLY WARNING: </span>
            <span style={{ color: '#e5e7eb', fontSize: '0.88rem' }}>
              {supplyChainHealth.criticalStockouts} Critical Medicine Stock-out Breaches detected across {stats.totalFacilities} monitored healthcare facilities.
            </span>
          </div>
        </div>
        <button className="btn-danger" onClick={() => onNavigate('alerts')}>
          Inspect Alerts <ArrowRight size={15} />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Patient Bed Occupancy</div>
            <div className="kpi-value">{beds.occupancyRate}%</div>
            <div className="kpi-subtext">{beds.occupied.toLocaleString()} / {beds.total.toLocaleString()} Beds Occupied</div>
            <div className="progress-bar-container">
              <div 
                className={`progress-bar-fill ${parseFloat(beds.occupancyRate) > 85 ? 'fill-red' : 'fill-cyan'}`}
                style={{ width: `${beds.occupancyRate}%` }}
              ></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan">
            <Bed size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">ICU Ventilator Capacity</div>
            <div className="kpi-value">{beds.icu.occupancyRate}%</div>
            <div className="kpi-subtext">{beds.icu.occupied} / {beds.icu.total} ICU Beds In Use</div>
            <div className="progress-bar-container">
              <div 
                className={`progress-bar-fill ${parseFloat(beds.icu.occupancyRate) > 85 ? 'fill-red' : 'fill-amber'}`}
                style={{ width: `${beds.icu.occupancyRate}%` }}
              ></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-red">
            <Activity size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Doctor Attendance</div>
            <div className="kpi-value">{staff.doctors.attendanceRate}%</div>
            <div className="kpi-subtext">{staff.doctors.onDuty} / {staff.doctors.total} Doctors On Duty</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-emerald" style={{ width: `${staff.doctors.attendanceRate}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald">
            <Users size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Critical Stockouts</div>
            <div className="kpi-value" style={{ color: '#f87171' }}>{supplyChainHealth.criticalStockouts}</div>
            <div className="kpi-subtext">{supplyChainHealth.lowStockCount} Additional Items on Low Watch</div>
          </div>
          <div className="kpi-icon-box kpi-icon-red">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Federated AI Accuracy</div>
            <div className="kpi-value" style={{ color: '#c084fc' }}>{federatedAI.globalAccuracy}%</div>
            <div className="kpi-subtext">Round #{federatedAI.currentRound} • 100% Privacy Preserved</div>
          </div>
          <div className="kpi-icon-box kpi-icon-violet">
            <Cpu size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Outbreak Surveillance & Supply Chain Actions */}
      <div className="grid-2">
        {/* Outbreak Surveillance Signals */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <Biohazard size={20} color="#f59e0b" />
              Active Epidemiological Surge Surveillance
            </div>
            <span className="badge badge-warning">{surveillance?.length || 0} Outbreaks Active</span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Integrated disease surveillance feeds calculate dynamic AI demand multipliers for emergency medicine stock.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {surveillance?.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', 
                  padding: '0.9rem' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: '#f3f4f6', fontSize: '0.92rem' }}>{item.disease}</span>
                  <span className="badge badge-critical">{item.riskLevel}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <strong>Vector/Risk Indicator:</strong> {item.vectorIndex}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>7-Day Cases: <strong>{item.reportedCases7d.toLocaleString()}</strong> (Positivity: {item.positivityRate})</span>
                  <span>Demand Multiplier: <strong style={{ color: '#22d3ee' }}>{item.demandMultiplier}x</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title">
              <Truck size={20} color="#06b6d4" />
              Autonomous Supply Chain Resilience Engine
            </div>
            <span className="badge badge-info">AI Optimization Ready</span>
          </div>

          <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} color="#22d3ee" />
              <strong style={{ color: '#e5e7eb', fontSize: '0.9rem' }}>Federated AI Privacy Guarantee</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Hospital and PHC patient records remain strictly confidential within local state nodes. Only encrypted weight gradient updates (ΔW) are aggregated at the national level using Secure FedAvg.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Surplus-Deficit Pairings</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{supplyChainHealth.activeSurplusRecommendations} Matches</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nearest neighbor optimization</div>
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Dispatches</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#67e8f9' }}>{supplyChainHealth.activeTransfersInTransit} In Transit</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cold chain tracking active</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => onNavigate('redistribution')}>
              <Truck size={16} /> Open Redistribution Hub
            </button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => onNavigate('federated')}>
              <Cpu size={16} /> Inspect Federated AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
