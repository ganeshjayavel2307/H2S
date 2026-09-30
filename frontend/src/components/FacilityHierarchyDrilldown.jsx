import React, { useState } from 'react';
import { Building2, MapPin, Phone, User, Bed, Package, Users, ChevronRight, Activity } from 'lucide-react';

export default function FacilityHierarchyDrilldown({ 
  states, 
  districts, 
  facilities,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  onSelectFacility
}) {
  const [tierFilter, setTierFilter] = useState('ALL');

  const filteredDistricts = selectedState 
    ? districts.filter(d => d.stateId === selectedState)
    : districts;

  const filteredFacilities = facilities.filter(f => {
    const matchState = !selectedState || f.stateId === selectedState;
    const matchDistrict = !selectedDistrict || f.districtId === selectedDistrict;
    const matchTier = tierFilter === 'ALL' || f.type.toLowerCase().includes(tierFilter.toLowerCase());
    return matchState && matchDistrict && matchTier;
  });

  return (
    <div className="animate-fade">
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={20} color="#06b6d4" />
            National Healthcare Tiered Infrastructure & Facility Directory
          </div>
          <span className="badge badge-info">{filteredFacilities.length} Facilities in Scope</span>
        </div>

        {/* Drill-down Selector Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Select State / UT
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('');
              }}
              className="filter-select"
              style={{ width: '100%' }}
            >
              <option value="">All States ({states.length})</option>
              {states.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.zone} Zone)</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Select District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="filter-select"
              style={{ width: '100%' }}
            >
              <option value="">All Districts ({filteredDistricts.length})</option>
              {filteredDistricts.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.tier})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Facility Tier
            </label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="filter-select"
              style={{ width: '100%' }}
            >
              <option value="ALL">All Tiers (DH, CHC, PHC)</option>
              <option value="District Hospital">District Hospitals</option>
              <option value="CHC">Community Health Centres (CHC)</option>
              <option value="PHC">Primary Health Centres (PHC)</option>
            </select>
          </div>
        </div>

        {/* Facility Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredFacilities.map(f => {
            const occPct = ((f.beds.occupied / f.beds.total) * 100).toFixed(1);
            const lowStockCount = f.inventory.filter(i => (i.currentStock / i.dailyBurnRate) <= 4).length;

            return (
              <div 
                key={f.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-info">{f.type}</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.id}</span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.35rem' }}>
                    {f.name}
                  </h3>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    <MapPin size={14} color="#67e8f9" /> {f.location}, {f.stateId}
                  </div>

                  {/* Contact Info */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.85rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e5e7eb', marginBottom: '0.2rem' }}>
                      <User size={13} color="#38bdf8" /> {f.contactPerson}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                      <Phone size={13} color="#34d399" /> {f.phone}
                    </div>
                  </div>

                  {/* Resource Micro Badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Beds Full</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: parseFloat(occPct) > 85 ? '#f87171' : '#f3f4f6' }}>{occPct}%</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Doctors</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#34d399' }}>{f.staff.doctors.onDuty} / {f.staff.doctors.total}</div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Deficit Meds</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: lowStockCount > 0 ? '#f87171' : '#34d399' }}>{lowStockCount} Items</div>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
                  onClick={() => onSelectFacility(f.id)}
                >
                  Inspect Facility Telemetry <ChevronRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
