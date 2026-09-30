import React, { useState } from 'react';
import { Bed, Activity, Wind, HeartPulse, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function BedCapacityView({ facilities }) {
  const [tierFilter, setTierFilter] = useState('ALL');

  const filteredFacilities = facilities.filter(f => {
    if (tierFilter === 'ALL') return true;
    return f.type.toLowerCase().includes(tierFilter.toLowerCase());
  });

  // Aggregated totals
  let totalBeds = 0, occupiedBeds = 0;
  let totalIcu = 0, occupiedIcu = 0;
  let totalOxygen = 0, occupiedOxygen = 0;
  let totalGeneral = 0, occupiedGeneral = 0;

  filteredFacilities.forEach(f => {
    totalBeds += f.beds.total;
    occupiedBeds += f.beds.occupied;
    totalIcu += f.beds.icu.total;
    occupiedIcu += f.beds.icu.occupied;
    totalOxygen += f.beds.oxygen.total;
    occupiedOxygen += f.beds.oxygen.occupied;
    totalGeneral += f.beds.general.total;
    occupiedGeneral += f.beds.general.occupied;
  });

  return (
    <div className="animate-fade">
      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Total Bed Utilization</div>
            <div className="kpi-value">{totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0}%</div>
            <div className="kpi-subtext">{occupiedBeds.toLocaleString()} / {totalBeds.toLocaleString()} Occupied</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-cyan" style={{ width: `${totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan"><Bed size={22} /></div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">ICU / Ventilator Beds</div>
            <div className="kpi-value" style={{ color: (occupiedIcu/totalIcu) > 0.85 ? '#f87171' : '#f3f4f6' }}>
              {totalIcu > 0 ? ((occupiedIcu / totalIcu) * 100).toFixed(1) : 0}%
            </div>
            <div className="kpi-subtext">{occupiedIcu} / {totalIcu} ICU Beds In Use</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-red" style={{ width: `${totalIcu > 0 ? (occupiedIcu / totalIcu) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-red"><Activity size={22} /></div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Oxygen-Equipped Beds</div>
            <div className="kpi-value">{totalOxygen > 0 ? ((occupiedOxygen / totalOxygen) * 100).toFixed(1) : 0}%</div>
            <div className="kpi-subtext">{occupiedOxygen} / {totalOxygen} Oxygen Beds In Use</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-amber" style={{ width: `${totalOxygen > 0 ? (occupiedOxygen / totalOxygen) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber"><Wind size={22} /></div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">General Ward Beds</div>
            <div className="kpi-value">{totalGeneral > 0 ? ((occupiedGeneral / totalGeneral) * 100).toFixed(1) : 0}%</div>
            <div className="kpi-subtext">{occupiedGeneral} / {totalGeneral} Beds Occupied</div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill fill-emerald" style={{ width: `${totalGeneral > 0 ? (occupiedGeneral / totalGeneral) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald"><HeartPulse size={22} /></div>
        </div>
      </div>

      {/* Facilities Bed Matrix */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <Bed size={20} color="#06b6d4" />
            Healthcare Facility Bed Occupancy & Capacity Matrix
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'District Hospital', 'CHC', 'PHC'].map(t => (
              <button
                key={t}
                className={`btn-secondary ${tierFilter === t ? 'active' : ''}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: tierFilter === t ? 'var(--primary)' : 'var(--bg-surface-elevated)', color: tierFilter === t ? '#0b0f19' : 'var(--text-primary)' }}
                onClick={() => setTierFilter(t)}
              >
                {t === 'ALL' ? 'All Tiers' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Facility Name & Tier</th>
                <th>State & District</th>
                <th>Total Beds</th>
                <th>Total Occupancy</th>
                <th>ICU / Ventilator (Avail)</th>
                <th>Oxygen Beds (Avail)</th>
                <th>General Wards (Avail)</th>
                <th>Surge Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacilities.map(f => {
                const totalPct = ((f.beds.occupied / f.beds.total) * 100).toFixed(1);
                const icuAvail = f.beds.icu.total - f.beds.icu.occupied;
                const oxyAvail = f.beds.oxygen.total - f.beds.oxygen.occupied;
                const genAvail = f.beds.general.total - f.beds.general.occupied;

                let surgeBadge = <span className="badge badge-success">Normal Flow</span>;
                if (parseFloat(totalPct) >= 90 || icuAvail <= 2) {
                  surgeBadge = <span className="badge badge-critical">CRITICAL CAPACITY</span>;
                } else if (parseFloat(totalPct) >= 80) {
                  surgeBadge = <span className="badge badge-warning">HIGH OCCUPANCY</span>;
                }

                return (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f3f4f6' }}>{f.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{f.type}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.stateId}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.location}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{f.beds.total}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Capacity</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: parseFloat(totalPct) >= 85 ? '#f87171' : '#f3f4f6' }}>
                        {f.beds.occupied} ({totalPct}%)
                      </div>
                      <div className="progress-bar-container" style={{ width: '100px' }}>
                        <div 
                          className={`progress-bar-fill ${parseFloat(totalPct) >= 85 ? 'fill-red' : 'fill-cyan'}`}
                          style={{ width: `${totalPct}%` }}
                        ></div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: icuAvail <= 2 ? '#f87171' : '#34d399' }}>
                        {icuAvail} Available
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {f.beds.icu.occupied} / {f.beds.icu.total} In Use
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: oxyAvail <= 5 ? '#fbbf24' : '#34d399' }}>
                        {oxyAvail} Available
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {f.beds.oxygen.occupied} / {f.beds.oxygen.total} In Use
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {genAvail} Available
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {f.beds.general.occupied} / {f.beds.general.total} In Use
                      </div>
                    </td>
                    <td>{surgeBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
