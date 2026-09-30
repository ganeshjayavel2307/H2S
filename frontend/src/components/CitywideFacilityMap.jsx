import React, { useState } from 'react';
import { Navigation, MapPin, Search, Filter, ShieldAlert, CheckCircle2, Activity, Info } from 'lucide-react';

export default function CitywideFacilityMap({ facilities, onSelectFacility }) {
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hoveredFacility, setHoveredFacility] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const cityName = facilities[0]?.city || 'Chennai';
  const zones = ['ALL', ...new Set(facilities.map(f => f.zone || 'Central Zone'))];

  const filteredFacilities = facilities.filter(f => {
    const matchZone = selectedZone === 'ALL' || f.zone === selectedZone;
    const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchSearch = searchQuery === '' || 
                        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        f.chiefDoctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (f.area && f.area.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchZone && matchStatus && matchSearch;
  });

  const criticalCount = facilities.filter(f => f.status === 'CRITICAL').length;
  const warningCount = facilities.filter(f => f.status === 'WARNING').length;
  const normalCount = facilities.filter(f => f.status === 'NORMAL').length;

  return (
    <div className="content-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '0.85rem' }}>
        <div>
          <div className="card-title">
            <Navigation size={18} color="#06b6d4" />
            {cityName} Healthcare Clinic Network Map ({facilities.length} Total Clinics)
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Geospatial stock health & shortage indicators across metropolitan clinic zones
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search clinic or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-select"
              style={{ fontSize: '0.76rem', padding: '0.3rem 0.6rem', width: '160px' }}
            />
          </div>

          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="filter-select"
            style={{ fontSize: '0.76rem', padding: '0.3rem 0.6rem' }}
          >
            {zones.map(z => (
              <option key={z} value={z}>{z === 'ALL' ? 'All Zones' : z}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Legend & Status Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        padding: '0.45rem 0.75rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '0.75rem',
        fontSize: '0.74rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter(statusFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f87171' }}
          >
            <span className="pulse-dot danger"></span>
            <strong>Critical ({criticalCount})</strong>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'WARNING' ? 'ALL' : 'WARNING')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24' }}
          >
            <span className="pulse-dot warning"></span>
            <strong>Warning ({warningCount})</strong>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'NORMAL' ? 'ALL' : 'NORMAL')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399' }}
          >
            <span className="pulse-dot success"></span>
            <strong>Normal ({normalCount})</strong>
          </button>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          Showing {filteredFacilities.length} clinics • Click any marker to inspect
        </div>
      </div>

      {/* Interactive Map Visual Canvas */}
      <div style={{
        flex: 1,
        minHeight: '400px',
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        background: 'radial-gradient(ellipse at 50% 50%, #151e30 0%, #0c121e 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Stylized Grid SVG */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <pattern id="cityGrid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="0.25" />
            </pattern>
          </defs>

          <rect width="100" height="100" fill="url(#cityGrid)" />
          <circle cx="50" cy="50" r="45" fill="url(#mapGlow)" />
          <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="0.3" strokeDasharray="1,1" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="0.3" strokeDasharray="1.5,1.5" />

          {/* Zone Watermarks */}
          <text x="8" y="12" fill="rgba(255, 255, 255, 0.15)" fontSize="2.5" fontWeight="700">NORTH SECTOR</text>
          <text x="70" y="12" fill="rgba(255, 255, 255, 0.15)" fontSize="2.5" fontWeight="700">EAST COAST</text>
          <text x="42" y="52" fill="rgba(6, 182, 212, 0.2)" fontSize="2.6" fontWeight="800">METRO CORE</text>
          <text x="8" y="94" fill="rgba(255, 255, 255, 0.15)" fontSize="2.5" fontWeight="700">WEST CORRIDOR</text>
          <text x="70" y="94" fill="rgba(255, 255, 255, 0.15)" fontSize="2.5" fontWeight="700">SOUTH SECTOR</text>
        </svg>

        {/* Render all Clinics Pins */}
        {filteredFacilities.map((fac) => {
          const coords = fac.mapCoords || { x: 50, y: 50 };
          const isCritical = fac.status === 'CRITICAL';
          const isWarning = fac.status === 'WARNING';
          const markerColor = isCritical ? '#ef4444' : (isWarning ? '#f59e0b' : '#10b981');
          const isHighlighted = hoveredFacility?.id === fac.id;

          return (
            <div
              key={fac.id}
              onClick={() => onSelectFacility(fac.id)}
              onMouseEnter={() => setHoveredFacility(fac)}
              onMouseLeave={() => setHoveredFacility(null)}
              style={{
                position: 'absolute',
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isHighlighted ? 25 : (isCritical ? 15 : 10),
                transition: 'transform 0.15s ease'
              }}
            >
              {/* Pulsing ring for critical/warning */}
              {(isCritical || isWarning) && (
                <div style={{
                  position: 'absolute',
                  inset: '-6px',
                  borderRadius: '50%',
                  background: isCritical ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.3)',
                  animation: 'pulseGlow 2s infinite ease-in-out',
                  pointerEvents: 'none'
                }}></div>
              )}

              {/* Pin */}
              <div style={{
                width: isCritical ? '24px' : '20px',
                height: isCritical ? '24px' : '20px',
                borderRadius: '50%',
                background: '#111827',
                border: `2px solid ${markerColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 10px ${markerColor}`,
                color: markerColor,
                fontWeight: 800,
                fontSize: '0.62rem'
              }}>
                <MapPin size={isCritical ? 13 : 11} color={markerColor} />
              </div>
            </div>
          );
        })}

        {/* Hover Tooltip Card */}
        {hoveredFacility && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(17, 24, 39, 0.96)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${hoveredFacility.status === 'CRITICAL' ? '#ef4444' : (hoveredFacility.status === 'WARNING' ? '#f59e0b' : '#10b981')}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            maxWidth: '300px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
            zIndex: 35,
            pointerEvents: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span className={`badge ${hoveredFacility.status === 'CRITICAL' ? 'badge-critical' : (hoveredFacility.status === 'WARNING' ? 'badge-warning' : 'badge-success')}`}>
                {hoveredFacility.status}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{hoveredFacility.zone}</span>
            </div>

            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '0.15rem' }}>
              {hoveredFacility.displayName || hoveredFacility.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#34d399', marginBottom: '0.45rem' }}>
              Chief Doctor: {hoveredFacility.chiefDoctor}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.72rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.3rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Beds: </span>
                <strong>{hoveredFacility.beds.occupied}/{hoveredFacility.beds.total}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.3rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Staff: </span>
                <strong style={{ color: '#34d399' }}>{hoveredFacility.staff.doctors.onDuty} Docs</strong>
              </div>
            </div>

            <div style={{ marginTop: '0.45rem', fontSize: '0.68rem', color: '#67e8f9', textAlign: 'center' }}>
              ✦ Click to open complete Clinic details & forecast
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
