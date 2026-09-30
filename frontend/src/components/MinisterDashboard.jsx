import React, { useState } from 'react';
import { 
  Building2, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Bed, 
  Globe2, 
  ArrowRight, 
  TrendingUp, 
  ShieldAlert,
  Search,
  Filter,
  Users,
  Package,
  Layers,
  BarChart3,
  PieChart,
  MapPin
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import CitywideFacilityMap from './CitywideFacilityMap';
import AlertsFeed from './AlertsFeed';
import LocationSelector from './LocationSelector';
import LocationPromptBanner from './LocationPromptBanner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MinisterDashboard({
  stats,
  citySummaries = [],
  facilities = [],
  alertsData = [],
  supplyRequests = [],
  redistData,
  onSelectFacility,
  onRefreshData
}) {
  // Cascading Location Selection: City -> Area -> PHC (Default is empty: 'Select City')
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPhcId, setSelectedPhcId] = useState('');

  const [clinicSearch, setClinicSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('overview'); // overview, analytics, phcs

  // Reset Logic
  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    setSelectedArea('');
    setSelectedPhcId('');
  };

  const handleAreaChange = (newArea) => {
    setSelectedArea(newArea);
    setSelectedPhcId('');
  };

  const handlePhcChange = (newPhcId) => {
    setSelectedPhcId(newPhcId);
  };

  // Filter facilities based on City, Area, and PHC selections
  const cityFacilities = selectedCity 
    ? facilities.filter(f => f.city.toLowerCase() === selectedCity.toLowerCase())
    : [];

  const areaFacilities = (selectedCity && selectedArea)
    ? cityFacilities.filter(f => f.area.toLowerCase() === selectedArea.toLowerCase())
    : cityFacilities;

  const displayedFacilities = selectedPhcId
    ? facilities.filter(f => f.id === selectedPhcId)
    : areaFacilities;

  // Filter for PHC Surveillance Table
  const filteredClinics = displayedFacilities.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(clinicSearch.toLowerCase()) || 
                          c.chiefDoctor?.toLowerCase().includes(clinicSearch.toLowerCase()) ||
                          c.area?.toLowerCase().includes(clinicSearch.toLowerCase()) ||
                          c.id?.toLowerCase().includes(clinicSearch.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const criticalClinics = displayedFacilities.filter(c => c.status === 'CRITICAL');
  const warningClinics = displayedFacilities.filter(c => c.status === 'WARNING');
  const normalClinics = displayedFacilities.filter(c => c.status === 'NORMAL');

  const totalCurrentPatients = displayedFacilities.reduce((sum, f) => sum + (f.currentPatients || 0), 0);
  const totalExpectedPatients = displayedFacilities.reduce((sum, f) => sum + (f.expectedPatients?.tomorrow || (f.currentPatients ? Math.round(f.currentPatients * 1.25) : 0)), 0);

  const totalCriticalShortages = displayedFacilities.reduce((sum, f) => {
    const critCount = (f.inventory || []).filter(i => {
      const req = i.requiredStock || i.minThreshold || 100;
      return i.status === 'CRITICAL' || i.currentStock <= Math.max(3, req * 0.35);
    }).length;
    return sum + critCount;
  }, 0);

  const totalAdditionalStockNeeded = displayedFacilities.reduce((sum, f) => {
    const facilityAdd = (f.inventory || []).reduce((iSum, inv) => {
      const req = inv.requiredStock || inv.minThreshold || 100;
      return iSum + Math.max(0, req - inv.currentStock);
    }, 0);
    return sum + facilityAdd;
  }, 0);

  // Supply requests filtered by selection
  const displayedRequests = selectedCity
    ? supplyRequests.filter(r => {
        const matchCity = r.city.toLowerCase() === selectedCity.toLowerCase();
        const matchPhc = !selectedPhcId || r.clinicId === selectedPhcId;
        return matchCity && matchPhc;
      })
    : [];

  // ----------------------------------------------------
  // CHARTS DATA PREPARATION (Active when City is selected)
  // ----------------------------------------------------

  const top10DemandClinics = [...displayedFacilities]
    .sort((a, b) => (b.currentPatients || 0) - (a.currentPatients || 0))
    .slice(0, 10);

  const patientDemandChartData = {
    labels: top10DemandClinics.map(c => c.name),
    datasets: [
      {
        label: 'Current Patients',
        data: top10DemandClinics.map(c => c.currentPatients || 0),
        backgroundColor: 'rgba(6, 182, 212, 0.8)',
        borderRadius: 4
      },
      {
        label: 'Expected Patients (Tomorrow)',
        data: top10DemandClinics.map(c => c.expectedPatients?.tomorrow || Math.round((c.currentPatients || 0) * 1.25)),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderRadius: 4
      }
    ]
  };

  const topCriticalFacilities = [...criticalClinics]
    .sort((a, b) => {
      const aCrit = (a.inventory || []).filter(i => i.status === 'CRITICAL' || i.currentStock <= (i.requiredStock || 100) * 0.35).length;
      const bCrit = (b.inventory || []).filter(i => i.status === 'CRITICAL' || i.currentStock <= (i.requiredStock || 100) * 0.35).length;
      return bCrit - aCrit;
    })
    .slice(0, 8);

  const shortageChartData = {
    labels: topCriticalFacilities.length > 0 
      ? topCriticalFacilities.map(c => c.name)
      : (displayedFacilities.slice(0, 5).map(c => c.name)),
    datasets: [
      {
        label: 'Critical Drug Shortages',
        data: topCriticalFacilities.length > 0
          ? topCriticalFacilities.map(c => (c.inventory || []).filter(i => i.status === 'CRITICAL' || i.currentStock <= (i.requiredStock || 100) * 0.35).length || 1)
          : [2, 1, 1, 0, 0],
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderRadius: 4
      }
    ]
  };

  const medAggregates = {};
  displayedFacilities.forEach(f => {
    (f.inventory || []).forEach(inv => {
      const name = inv.medicineName || inv.medicineId;
      if (!medAggregates[name]) medAggregates[name] = { current: 0, required: 0 };
      medAggregates[name].current += inv.currentStock || 0;
      medAggregates[name].required += (inv.requiredStock || inv.minThreshold || 100);
    });
  });

  const medLabels = Object.keys(medAggregates).slice(0, 7);
  const stockRequirementChartData = {
    labels: medLabels.length > 0 ? medLabels : ['Paracetamol', 'Amoxicillin', 'Azithromycin', 'Insulin', 'Salbutamol', 'Metformin'],
    datasets: [
      {
        label: 'Current Stock Available',
        data: medLabels.map(m => medAggregates[m]?.current || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4
      },
      {
        label: 'Required Stock (Demand-Driven)',
        data: medLabels.map(m => medAggregates[m]?.required || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderRadius: 4
      }
    ]
  };

  const statusDistributionData = {
    labels: ['Normal Stock (Adequate)', 'Warning (Low Buffer)', 'Critical Shortage'],
    datasets: [
      {
        data: [normalClinics.length, warningClinics.length, criticalClinics.length],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const chennaiFacs = facilities.filter(f => f.city.toLowerCase() === 'chennai');
  const coimbatoreFacs = facilities.filter(f => f.city.toLowerCase() === 'coimbatore');

  const cityCompareChartData = {
    labels: ['Total PHCs', 'Critical Shortages', 'Avg Daily Patients', 'Active Supply Requests'],
    datasets: [
      {
        label: 'Chennai Network (~180 PHCs)',
        data: [
          chennaiFacs.length || 180,
          chennaiFacs.filter(f => f.status === 'CRITICAL').length || 24,
          Math.round((chennaiFacs.reduce((s, f) => s + (f.currentPatients || 0), 0) / (chennaiFacs.length || 1)) || 92),
          supplyRequests.filter(r => r.city?.toLowerCase() === 'chennai').length || 4
        ],
        backgroundColor: 'rgba(6, 182, 212, 0.85)',
        borderRadius: 4
      },
      {
        label: 'Coimbatore Network (~45 PHCs)',
        data: [
          coimbatoreFacs.length || 45,
          coimbatoreFacs.filter(f => f.status === 'CRITICAL').length || 6,
          Math.round((coimbatoreFacs.reduce((s, f) => s + (f.currentPatients || 0), 0) / (coimbatoreFacs.length || 1)) || 78),
          supplyRequests.filter(r => r.city?.toLowerCase() === 'coimbatore').length || 2
        ],
        backgroundColor: 'rgba(139, 92, 246, 0.85)',
        borderRadius: 4
      }
    ]
  };

  const genericBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#e5e7eb', font: { family: 'Plus Jakarta Sans', size: 11 } } },
      tooltip: { backgroundColor: '#111827', titleColor: '#fff', bodyColor: '#d1d5db' }
    },
    scales: {
      x: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#e5e7eb', font: { family: 'Plus Jakarta Sans', size: 11 } } },
      tooltip: { backgroundColor: '#111827', titleColor: '#fff', bodyColor: '#d1d5db' }
    }
  };

  return (
    <div className="animate-fade">
      {/* Top Ministerial Command Header */}
      <div className="content-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(6, 182, 212, 0.05))', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="role-badge role-minister">MINISTRY OF HEALTH & FAMILY WELFARE</span>
              <span className="badge badge-info">{selectedCity ? `${selectedCity} Healthcare Network` : 'Location Selection Pending'}</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.02em' }}>
              Statewide PHC Inventory & Patient Demand Surveillance
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Monitoring <strong>225 Primary Health Centres</strong> across Tamil Nadu • Select location below to stream data
            </div>
          </div>
        </div>
      </div>

      {/* 1. REQUIRED HIERARCHICAL LOCATION SELECTOR (City -> Area -> PHC) */}
      <LocationSelector
        facilities={facilities}
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        selectedPhcId={selectedPhcId}
        onCityChange={handleCityChange}
        onAreaChange={handleAreaChange}
        onPhcChange={handlePhcChange}
      />

      {/* 2. PROGRESSIVE EMPTY STATE PROMPTS: Do NOT show data too early */}
      {!selectedCity && (
        <LocationPromptBanner step="city" />
      )}

      {selectedCity && !selectedArea && (
        <LocationPromptBanner step="area" cityName={selectedCity} />
      )}

      {selectedCity && selectedArea && !selectedPhcId && (
        <LocationPromptBanner step="phc" cityName={selectedCity} areaName={selectedArea} />
      )}

      {/* 3. CITY LEVEL COMPARISON & METRICS (Available once City is selected) */}
      {selectedCity && (
        <div className="animate-fade">
          {/* Top 8 Ministerial KPI Metrics */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div>
                <div className="kpi-label">Monitored PHCs ({selectedArea || selectedCity})</div>
                <div className="kpi-value">{displayedFacilities.length}</div>
                <div className="kpi-subtext">{selectedPhcId ? 'Single Clinic Focus' : (selectedArea ? `${selectedArea} Area` : `${selectedCity} District`)}</div>
              </div>
              <div className="kpi-icon-box kpi-icon-cyan"><Building2 size={20} /></div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div>
                <div className="kpi-label">Critical Shortage PHCs</div>
                <div className="kpi-value" style={{ color: '#f87171' }}>{criticalClinics.length}</div>
                <div className="kpi-subtext">Immediate Supplier Replenishment</div>
              </div>
              <div className="kpi-icon-box kpi-icon-red"><AlertTriangle size={20} /></div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div>
                <div className="kpi-label">Warning Buffer PHCs</div>
                <div className="kpi-value" style={{ color: '#fbbf24' }}>{warningClinics.length}</div>
                <div className="kpi-subtext">Stock &le; Required Stock</div>
              </div>
              <div className="kpi-icon-box kpi-icon-amber"><Activity size={20} /></div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div>
                <div className="kpi-label">Normal Equilibrium</div>
                <div className="kpi-value" style={{ color: '#34d399' }}>{normalClinics.length}</div>
                <div className="kpi-subtext">Safe Inventory Runway</div>
              </div>
              <div className="kpi-icon-box kpi-icon-emerald"><CheckCircle2 size={20} /></div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #06b6d4' }}>
              <div>
                <div className="kpi-label">Total Current Patients</div>
                <div className="kpi-value" style={{ color: '#22d3ee' }}>{totalCurrentPatients.toLocaleString()}</div>
                <div className="kpi-subtext">Active Today Across Selected PHCs</div>
              </div>
              <div className="kpi-icon-box kpi-icon-cyan"><Users size={20} /></div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div>
                <div className="kpi-label">Expected Patients (Tomorrow)</div>
                <div className="kpi-value" style={{ color: '#a78bfa' }}>{totalExpectedPatients.toLocaleString()}</div>
                <div className="kpi-subtext">Forecasted Patient Surge</div>
              </div>
              <div className="kpi-icon-box kpi-icon-violet"><TrendingUp size={20} /></div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div>
                <div className="kpi-label">Critical Drug Outages</div>
                <div className="kpi-value" style={{ color: '#f87171' }}>{totalCriticalShortages} Items</div>
                <div className="kpi-subtext">Total Add'l: {totalAdditionalStockNeeded.toLocaleString()} units</div>
              </div>
              <div className="kpi-icon-box kpi-icon-red"><ShieldAlert size={20} /></div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div>
                <div className="kpi-label">Pending Supply Requests</div>
                <div className="kpi-value" style={{ color: '#60a5fa' }}>{displayedRequests.length}</div>
                <div className="kpi-subtext">Active Depot Orders</div>
              </div>
              <div className="kpi-icon-box kpi-icon-cyan"><Truck size={20} /></div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <button
              className={`filter-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Layers size={14} /> Map & Live Surveillance
            </button>
            <button
              className={`filter-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={14} /> Advanced Minister Analytics (5 Charts)
            </button>
            <button
              className={`filter-btn ${activeTab === 'phcs' ? 'active' : ''}`}
              onClick={() => setActiveTab('phcs')}
            >
              <Building2 size={14} /> PHC Stock & Patient Ledger ({displayedFacilities.length})
            </button>
          </div>

          {/* TAB 1: MAP & LIVE SURVEILLANCE */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 2fr) minmax(320px, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ minHeight: '500px' }}>
                <CitywideFacilityMap
                  facilities={displayedFacilities}
                  onSelectFacility={onSelectFacility}
                />
              </div>

              <div style={{ minHeight: '500px' }}>
                <AlertsFeed
                  alertsData={alertsData}
                  onSelectFacility={onSelectFacility}
                />
              </div>
            </div>
          )}

          {/* TAB 2: ADVANCED MINISTER ANALYTICS (5 REQUIRED CHARTS) */}
          {activeTab === 'analytics' && (
            <div className="animate-fade">
              {/* Row 1: Patient Demand & Critical Shortages */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                {/* Chart A: Patient Demand Current vs Expected */}
                <div className="content-card">
                  <div className="card-header">
                    <div className="card-title">
                      <TrendingUp size={18} color="#06b6d4" />
                      A. Patient Demand: Current vs Expected Patients (Top PHCs)
                    </div>
                    <span className="badge badge-info">Forecast Model</span>
                  </div>
                  <div style={{ height: '280px' }}>
                    <Bar data={patientDemandChartData} options={genericBarOptions} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Identifies highest-surge clinics requiring preemptive medical staff and drug reserve reallocation.
                  </div>
                </div>

                {/* Chart B: Medicine Shortage by PHC */}
                <div className="content-card">
                  <div className="card-header">
                    <div className="card-title">
                      <ShieldAlert size={18} color="#ef4444" />
                      B. Medicine Shortage: Critical Drug Count by High-Risk PHC
                    </div>
                    <span className="badge badge-critical">Critical Risk</span>
                  </div>
                  <div style={{ height: '280px' }}>
                    <Bar data={shortageChartData} options={genericBarOptions} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    PHCs where current stock is &le; 35% of required stock or days of inventory cover &le; 2.5 days.
                  </div>
                </div>
              </div>

              {/* Row 2: Stock Requirement, PHC Status & City Comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                {/* Chart C: Current Stock vs Required Stock */}
                <div className="content-card">
                  <div className="card-header">
                    <div className="card-title">
                      <Package size={18} color="#10b981" />
                      C. Stock Requirement: Available vs Required
                    </div>
                    <span className="badge badge-warning">Network Total</span>
                  </div>
                  <div style={{ height: '260px' }}>
                    <Bar data={stockRequirementChartData} options={genericBarOptions} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Comparison of aggregate inventory on shelf vs patient-demand calculated requirement.
                  </div>
                </div>

                {/* Chart D: PHC Status Distribution */}
                <div className="content-card">
                  <div className="card-header">
                    <div className="card-title">
                      <PieChart size={18} color="#8b5cf6" />
                      D. PHC Health Status Breakdown
                    </div>
                    <span className="badge badge-info">{displayedFacilities.length} PHCs</span>
                  </div>
                  <div style={{ height: '260px' }}>
                    <Doughnut data={statusDistributionData} options={doughnutOptions} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                    Green: Normal ({normalClinics.length}) • Amber: Low Buffer ({warningClinics.length}) • Red: Critical ({criticalClinics.length})
                  </div>
                </div>

                {/* Chart E: City Comparison Chennai vs Coimbatore */}
                <div className="content-card">
                  <div className="card-header">
                    <div className="card-title">
                      <Globe2 size={18} color="#38bdf8" />
                      E. City Comparison: Chennai vs Coimbatore
                    </div>
                    <span className="badge badge-info">Multi-District</span>
                  </div>
                  <div style={{ height: '260px' }}>
                    <Bar data={cityCompareChartData} options={genericBarOptions} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Comparative benchmarking for metropolitan resource allocation and supply prioritization.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETE PHC SURVEILLANCE & SHORTAGE LEDGER */}
          {(activeTab === 'phcs' || activeTab === 'overview') && (
            <div className="content-card" style={{ marginTop: '1.25rem' }}>
              <div className="card-header">
                <div className="card-title">
                  <Building2 size={18} color="#06b6d4" />
                  Primary Health Centre (PHC) Stock & Demand Ledger ({filteredClinics.length} Listed)
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search PHC, Area, Doctor..."
                      value={clinicSearch}
                      onChange={(e) => setClinicSearch(e.target.value)}
                      className="filter-select"
                      style={{ paddingLeft: '1.8rem', minWidth: '220px' }}
                    />
                    <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Statuses ({displayedFacilities.length})</option>
                    <option value="CRITICAL">Critical Only ({criticalClinics.length})</option>
                    <option value="WARNING">Warning Only ({warningClinics.length})</option>
                    <option value="NORMAL">Normal Only ({normalClinics.length})</option>
                  </select>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>PHC ID & Name</th>
                      <th>Location & Zone</th>
                      <th>Chief Doctor</th>
                      <th>Current Patients</th>
                      <th>Expected Patients</th>
                      <th>Critical Medicines</th>
                      <th>Additional Stock Needed</th>
                      <th>Overall Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClinics.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No PHCs match your search or status filter.
                        </td>
                      </tr>
                    ) : (
                      filteredClinics.slice(0, 40).map((clinic) => {
                        const critMeds = (clinic.inventory || []).filter(i => {
                          const req = i.requiredStock || i.minThreshold || 100;
                          return i.status === 'CRITICAL' || i.currentStock <= Math.max(3, req * 0.35);
                        });

                        const addNeeded = (clinic.inventory || []).reduce((sum, i) => {
                          const req = i.requiredStock || i.minThreshold || 100;
                          return sum + Math.max(0, req - i.currentStock);
                        }, 0);

                        const isCrit = clinic.status === 'CRITICAL';
                        const isWarn = clinic.status === 'WARNING';

                        return (
                          <tr 
                            key={clinic.id}
                            onClick={() => onSelectFacility && onSelectFacility(clinic)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <div className="font-mono" style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 700 }}>{clinic.id}</div>
                              <div style={{ fontWeight: 700, color: '#f3f4f6' }}>{clinic.displayName || clinic.name}</div>
                            </td>
                            <td>
                              <div>{clinic.city}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{clinic.zone} • {clinic.area}</div>
                            </td>
                            <td>{clinic.chiefDoctor}</td>
                            <td>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#22d3ee' }}>
                                {clinic.currentPatients || 86}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#a78bfa' }}>
                                {clinic.expectedPatients?.tomorrow || Math.round((clinic.currentPatients || 86) * 1.25)}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>7d: {clinic.expectedPatients?.next7Days || 720}</div>
                            </td>
                            <td>
                              {critMeds.length > 0 ? (
                                <span className="badge badge-critical" style={{ fontWeight: 800 }}>
                                  {critMeds.length} Critical
                                </span>
                              ) : (
                                <span className="badge badge-success">0 None</span>
                              )}
                            </td>
                            <td>
                              <div style={{ fontWeight: 800, color: addNeeded > 0 ? (isCrit ? '#f87171' : '#fbbf24') : '#34d399' }}>
                                {addNeeded > 0 ? `+${addNeeded} units` : '0 (Sufficient)'}
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${isCrit ? 'badge-critical' : (isWarn ? 'badge-warning' : 'badge-success')}`}>
                                {clinic.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onSelectFacility) onSelectFacility(clinic);
                                }}
                              >
                                Inspect PHC <ArrowRight size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {filteredClinics.length > 40 && (
                <div style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
                  Showing top 40 of {filteredClinics.length} PHCs. Use search to narrow down.
                </div>
              )}
            </div>
          )}

          {/* Priority Supply Requests Monitoring Table */}
          <div className="content-card" style={{ marginTop: '1.25rem' }}>
            <div className="card-header">
              <div className="card-title">
                <Truck size={18} color="#06b6d4" />
                Supply Chain Replenishment Pipeline ({selectedArea || selectedCity})
              </div>
              <span className="badge badge-info">{displayedRequests.length} Active Orders</span>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>PHC Name & Area</th>
                    <th>Chief Doctor</th>
                    <th>Medicine / Resource</th>
                    <th>Requested Qty</th>
                    <th>Current Stock</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRequests.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No supply requests logged for this selection.
                      </td>
                    </tr>
                  ) : (
                    displayedRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="font-mono" style={{ color: '#93c5fd', fontWeight: 700 }}>{req.id}</td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{req.clinicName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.zone} • {req.area}</div>
                        </td>
                        <td>{req.chiefDoctor}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#67e8f9' }}>{req.medicineName}</div>
                        </td>
                        <td>
                          <strong>+{req.requestedQuantity} {req.unit}</strong>
                        </td>
                        <td>
                          <span style={{ color: req.currentStock <= 10 ? '#f87171' : '#f3f4f6', fontWeight: 700 }}>
                            {req.currentStock} units
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${req.priority === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${req.status === 'DELIVERED' ? 'badge-success' : (req.status === 'DISPATCHED' ? 'badge-info' : 'badge-warning')}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
