import React from 'react';
import { Globe2, MapPin, Building2, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function LocationSelector({
  facilities = [],
  selectedCity = '',
  selectedArea = '',
  selectedPhcId = '',
  onCityChange,
  onAreaChange,
  onPhcChange,
  className = ''
}) {
  // Extract distinct cities from facilities
  const cities = ['Chennai', 'Coimbatore'];

  // Extract distinct areas for the selected city
  const availableAreas = selectedCity
    ? Array.from(new Set(
        facilities
          .filter(f => f.city.toLowerCase() === selectedCity.toLowerCase() && f.area)
          .map(f => f.area)
      )).sort()
    : [];

  // Extract available PHCs for the selected city + area
  const availablePhcs = (selectedCity && selectedArea)
    ? facilities.filter(f => 
        f.city.toLowerCase() === selectedCity.toLowerCase() && 
        f.area.toLowerCase() === selectedArea.toLowerCase()
      )
    : [];

  const handleCitySelect = (e) => {
    const newCity = e.target.value;
    onCityChange(newCity);
  };

  const handleAreaSelect = (e) => {
    const newArea = e.target.value;
    onAreaChange(newArea);
  };

  const handlePhcSelect = (e) => {
    const newPhcId = e.target.value;
    onPhcChange(newPhcId);
  };

  return (
    <div className={`location-selector-bar ${className}`} style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        paddingBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#22d3ee',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            <NavigationIcon size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f9fafb' }}>
              Hierarchical Location Navigation
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Step 1: Select City &nbsp;→&nbsp; Step 2: Select Area &nbsp;→&nbsp; Step 3: Select PHC
            </div>
          </div>
        </div>

        {/* Step Indicator Badges */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span className={`badge ${selectedCity ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
            1. City: {selectedCity || 'None'}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>
          <span className={`badge ${selectedArea ? 'badge-success' : (selectedCity ? 'badge-warning' : 'badge-neutral')}`} style={{ fontSize: '0.7rem' }}>
            2. Area: {selectedArea || 'None'}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>
          <span className={`badge ${selectedPhcId ? 'badge-success' : (selectedArea ? 'badge-warning' : 'badge-neutral')}`} style={{ fontSize: '0.7rem' }}>
            3. PHC: {selectedPhcId ? 'Selected' : 'None'}
          </span>
        </div>
      </div>

      {/* 3 Cascading Dropdowns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        alignItems: 'center'
      }}>
        {/* DROPDOWN 1: CITY */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            marginBottom: '0.4rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            1. City Selection
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCity}
              onChange={handleCitySelect}
              className="filter-select"
              style={{
                width: '100%',
                paddingLeft: '2.2rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                borderColor: selectedCity ? 'var(--primary)' : 'var(--border-subtle)',
                background: selectedCity ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-surface-elevated)'
              }}
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <Globe2 size={15} style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: selectedCity ? '#22d3ee' : 'var(--text-muted)'
            }} />
          </div>
        </div>

        {/* DROPDOWN 2: AREA */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: selectedCity ? 'var(--text-secondary)' : 'var(--text-muted)',
            marginBottom: '0.4rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            2. Area Selection {selectedCity ? `(${availableAreas.length} Areas)` : ''}
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedArea}
              onChange={handleAreaSelect}
              disabled={!selectedCity}
              className="filter-select"
              style={{
                width: '100%',
                paddingLeft: '2.2rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                opacity: selectedCity ? 1 : 0.55,
                cursor: selectedCity ? 'pointer' : 'not-allowed',
                borderColor: selectedArea ? 'var(--primary)' : 'var(--border-subtle)',
                background: selectedArea ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-surface-elevated)'
              }}
            >
              <option value="">Select Area</option>
              {availableAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <MapPin size={15} style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: selectedArea ? '#22d3ee' : 'var(--text-muted)'
            }} />
          </div>
        </div>

        {/* DROPDOWN 3: PHC */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: selectedArea ? 'var(--text-secondary)' : 'var(--text-muted)',
            marginBottom: '0.4rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            3. PHC Clinic Selection {selectedArea ? `(${availablePhcs.length} Clinics)` : ''}
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedPhcId}
              onChange={handlePhcSelect}
              disabled={!selectedArea}
              className="filter-select"
              style={{
                width: '100%',
                paddingLeft: '2.2rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                opacity: selectedArea ? 1 : 0.55,
                cursor: selectedArea ? 'pointer' : 'not-allowed',
                borderColor: selectedPhcId ? '#10b981' : 'var(--border-subtle)',
                background: selectedPhcId ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface-elevated)'
              }}
            >
              <option value="">Select PHC</option>
              {availablePhcs.map(phc => (
                <option key={phc.id} value={phc.id}>
                  {phc.displayName || phc.name}
                </option>
              ))}
            </select>
            <Building2 size={15} style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: selectedPhcId ? '#34d399' : 'var(--text-muted)'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavigationIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
    </svg>
  );
}
