import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Package, 
  AlertTriangle, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  TrendingUp, 
  Bed, 
  Users, 
  ArrowRight,
  ShieldAlert,
  Send,
  Sparkles,
  MapPin,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchDemandForecast, createSupplyRequest } from '../services/api';
import LocationSelector from './LocationSelector';
import LocationPromptBanner from './LocationPromptBanner';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DoctorDashboard({
  clinic,
  facilities = [],
  medicines = [],
  supplyRequests = [],
  onRefreshData,
  onOpenFacilityModal
}) {
  // Cascading Location Selection: City -> Area -> PHC
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPhcId, setSelectedPhcId] = useState('');

  const [selectedMedId, setSelectedMedId] = useState('MED-005'); // Default to Insulin
  const [forecastData, setForecastData] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestQty, setRequestQty] = useState(100);
  const [requestReason, setRequestReason] = useState('Critical stock shortage detected in OPD dispensary');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Handle City Change (Resets Area & PHC)
  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    setSelectedArea('');
    setSelectedPhcId('');
  };

  // Handle Area Change (Resets PHC)
  const handleAreaChange = (newArea) => {
    setSelectedArea(newArea);
    setSelectedPhcId('');
  };

  // Handle PHC Change
  const handlePhcChange = (newPhcId) => {
    setSelectedPhcId(newPhcId);
  };

  // Quick Load Assigned PHC (Chennai PHC 042)
  const handleQuickLoadAssigned = () => {
    setSelectedCity('Chennai');
    setSelectedArea('Anna Nagar');
    setSelectedPhcId('CHE-042');
  };

  // Find currently selected clinic
  const currentClinic = facilities.find(f => f.id === selectedPhcId) || (selectedPhcId === 'CHE-042' ? clinic : null);

  useEffect(() => {
    if (currentClinic?.id && selectedMedId) {
      loadForecast();
    }
  }, [currentClinic?.id, selectedMedId]);

  async function loadForecast() {
    try {
      const res = await fetchDemandForecast(selectedMedId, currentClinic.id, 30);
      if (res.success) setForecastData(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  // Filter requests for selected clinic
  const clinicRequests = currentClinic ? supplyRequests.filter(r => r.clinicId === currentClinic.id) : [];

  // Critical Shortage Items
  const criticalItems = currentClinic ? (currentClinic.inventory || []).filter(i => {
    const req = i.requiredStock || i.minThreshold || 100;
    return i.status === 'CRITICAL' || i.currentStock <= Math.max(3, req * 0.35);
  }) : [];

  const warningItems = currentClinic ? (currentClinic.inventory || []).filter(i => {
    const req = i.requiredStock || i.minThreshold || 100;
    return !criticalItems.includes(i) && (i.status === 'WARNING' || i.currentStock < req);
  }) : [];

  async function handleCreateRequest(e) {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      const targetMed = medicines.find(m => m.id === selectedMedId) || medicines[0];
      const payload = {
        clinicId: currentClinic.id,
        medicineId: targetMed.id,
        requestedQuantity: parseInt(requestQty, 10),
        reason: requestReason,
        chiefDoctor: currentClinic.chiefDoctor
      };

      const res = await createSupplyRequest(payload);
      if (res.success) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setSuccessToast(`Stock request for ${requestQty} ${targetMed.unit} submitted to Central Supplier!`);
        setShowRequestModal(false);
        setTimeout(() => setSuccessToast(''), 6000);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      alert(`Error submitting request: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Forecast Chart
  let chartData = null;
  const currentInv = currentClinic ? (currentClinic.inventory.find(i => i.medicineId === selectedMedId) || { minThreshold: 25, currentStock: 8, requiredStock: 100 }) : null;
  if (forecastData && currentInv) {
    const labels = forecastData.forecast.map(f => f.dayLabel);
    const trajectory = forecastData.forecast.map(f => f.projectedStock);
    const thresholdLine = new Array(labels.length).fill(currentInv.minThreshold);

    chartData = {
      labels,
      datasets: [
        {
          label: 'Projected Stock (Units)',
          data: trajectory,
          borderColor: currentInv.currentStock <= currentInv.minThreshold ? '#ef4444' : '#06b6d4',
          backgroundColor: currentInv.currentStock <= currentInv.minThreshold ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.15)',
          borderWidth: 3,
          pointRadius: 4,
          fill: true,
          tension: 0.2
        },
        {
          label: `Min Safety Threshold (${currentInv.minThreshold} units)`,
          data: thresholdLine,
          borderColor: '#f59e0b',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    };
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#e5e7eb', font: { family: 'Plus Jakarta Sans', size: 11 } } },
      tooltip: { backgroundColor: '#111827', titleColor: '#fff', bodyColor: '#d1d5db' }
    },
    scales: {
      x: { ticks: { color: '#9ca3af', maxTicksLimit: 8 }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  return (
    <div className="animate-fade">
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

      {/* Quick Load Assigned Clinic Helper */}
      {!selectedPhcId && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '-0.85rem',
          marginBottom: '1.25rem'
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleQuickLoadAssigned}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Stethoscope size={13} color="#10b981" /> Quick-Select Assigned PHC: <strong>Chennai PHC 042 (Anna Nagar)</strong>
          </button>
        </div>
      )}

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

      {/* 3. ONLY AFTER ALL THREE ARE SELECTED: RENDER COMPLETE PHC DATA */}
      {selectedCity && selectedArea && selectedPhcId && currentClinic && (
        <div className="animate-fade">
          {/* Clinic Header Banner */}
          <div className="content-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${currentClinic.status === 'CRITICAL' ? 'badge-critical' : 'badge-success'}`}>
                    {currentClinic.status} STATUS
                  </span>
                  <span className="badge badge-info">{currentClinic.city} • {currentClinic.area}</span>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentClinic.id}</span>
                </div>

                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                  {currentClinic.displayName || currentClinic.name}
                </h1>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Chief Doctor: <strong style={{ color: '#34d399' }}>{currentClinic.chiefDoctor}</strong> • Phone: {currentClinic.phone}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => setShowRequestModal(true)}
                  style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                >
                  <PlusCircle size={16} /> Create Stock Supply Request
                </button>
              </div>
            </div>
          </div>

          {successToast && (
            <div className="animate-fade" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem' }}>
              <CheckCircle2 size={18} /> {successToast}
            </div>
          )}

          {/* KPI Cards: Current Patients, Expected Forecast, Critical Shortages, Bed Occupancy */}
          <div className="kpi-grid">
            <div className="kpi-card" style={{ borderLeft: `4px solid ${criticalItems.length > 0 ? '#ef4444' : '#10b981'}` }}>
              <div>
                <div className="kpi-label">Critical Shortages</div>
                <div className="kpi-value" style={{ color: criticalItems.length > 0 ? '#f87171' : '#34d399' }}>
                  {criticalItems.length} Drugs
                </div>
                <div className="kpi-subtext">Immediate Supply Required</div>
              </div>
              <div className="kpi-icon-box kpi-icon-red"><AlertTriangle size={20} /></div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #06b6d4' }}>
              <div>
                <div className="kpi-label">Current Patients Today</div>
                <div className="kpi-value" style={{ color: '#22d3ee' }}>{currentClinic.currentPatients || 86}</div>
                <div className="kpi-subtext">Active OPD & Inpatients</div>
              </div>
              <div className="kpi-icon-box kpi-icon-cyan"><Users size={20} /></div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div>
                <div className="kpi-label">Expected Patients (Next 7d)</div>
                <div className="kpi-value" style={{ color: '#a78bfa' }}>
                  {currentClinic.expectedPatients?.next7Days || (currentClinic.expectedPatients?.tomorrow ? currentClinic.expectedPatients.tomorrow * 7 : 720)}
                </div>
                <div className="kpi-subtext">Tomorrow: ~{currentClinic.expectedPatients?.tomorrow || 105} ({currentClinic.patientDemandStatus || 'High Demand'})</div>
              </div>
              <div className="kpi-icon-box kpi-icon-violet"><TrendingUp size={20} /></div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div>
                <div className="kpi-label">Bed Occupancy & Staff</div>
                <div className="kpi-value">{currentClinic.beds?.occupied || 18} / {currentClinic.beds?.total || 22}</div>
                <div className="kpi-subtext">Staff: {currentClinic.staff?.doctors?.onDuty || 3} Drs, {currentClinic.staff?.nurses?.onDuty || 6} Nurses</div>
              </div>
              <div className="kpi-icon-box kpi-icon-amber"><Bed size={20} /></div>
            </div>
          </div>

          {/* Patient Demand & Stock Forecasting Alert Banner */}
          <div className="content-card" style={{ background: 'rgba(6, 182, 212, 0.05)', borderColor: 'rgba(6, 182, 212, 0.25)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.65rem', borderRadius: 'var(--radius-md)', color: '#22d3ee' }}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#f3f4f6', fontSize: '0.96rem' }}>
                    AI Patient Demand & Stock Run-Out Intelligence
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Today: <strong style={{ color: '#fff' }}>{currentClinic.currentPatients || 86} Patients</strong> → Expected Tomorrow: <strong style={{ color: '#38bdf8' }}>{currentClinic.expectedPatients?.tomorrow || 105}</strong> → Next 7 Days: <strong style={{ color: '#a78bfa' }}>{currentClinic.expectedPatients?.next7Days || 720}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {criticalItems.length > 0 ? (
                  <span className="badge badge-critical" style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}>
                    ⚠️ Potential Stock-Out Detected based on Expected Surge
                  </span>
                ) : (
                  <span className="badge badge-success" style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}>
                    ✓ Current Stock Sufficient for Forecasted Demand
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Split Grid: Critical Shortages / Request Tracker & AI Forecast */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 1.2fr) minmax(340px, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Left: Critical Shortages & Supply Request Tracker */}
            <div className="content-card">
              <div className="card-header">
                <div className="card-title">
                  <ShieldAlert size={18} color="#ef4444" />
                  Automated Shortage Alerts & Supply Pipeline
                </div>
                <span className="badge badge-critical">{criticalItems.length} Shortages</span>
              </div>

              {criticalItems.length > 0 ? (
                <div style={{ marginBottom: '1.25rem' }}>
                  {criticalItems.map((item, i) => {
                    const addReq = item.additionalRequired || Math.max(0, (item.requiredStock || item.minThreshold) - item.currentStock);
                    return (
                      <div 
                        key={i}
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem',
                          marginBottom: '0.65rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.92rem' }}>{item.medicineName}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                            Current: <strong style={{ color: '#fff' }}>{item.currentStock} {item.unit}</strong> • Required: <strong style={{ color: '#38bdf8' }}>{item.requiredStock || item.minThreshold} {item.unit}</strong> • Additional Needed: <strong style={{ color: '#f87171' }}>{addReq} {item.unit}</strong>
                          </div>
                        </div>

                        <button
                          className="btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: '#ef4444' }}
                          onClick={() => {
                            setSelectedMedId(item.medicineId);
                            setRequestQty(addReq || 100);
                            setShowRequestModal(true);
                          }}
                        >
                          <Send size={13} /> Request +{addReq} Units
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#34d399', fontSize: '0.82rem' }}>
                  <CheckCircle2 size={18} /> All primary medicine stocks are at or above required threshold.
                </div>
              )}

              {/* Active Supply Requests Tracker */}
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} color="#06b6d4" />
                Active Supply Request Status History ({clinicRequests.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {clinicRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No active supply orders pending.
                  </div>
                ) : (
                  clinicRequests.map((req) => {
                    const isRequested = req.status === 'REQUESTED';
                    const isAccepted = req.status === 'ACCEPTED';
                    const isDispatched = req.status === 'DISPATCHED';
                    const isDelivered = req.status === 'DELIVERED';

                    return (
                      <div 
                        key={req.id}
                        style={{
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span className="font-mono" style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700 }}>{req.id}</span>
                          <span className={`badge ${isDelivered ? 'badge-success' : (isDispatched ? 'badge-info' : (isAccepted ? 'badge-warning' : 'badge-critical'))}`}>
                            {req.status}
                          </span>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f3f4f6' }}>
                          {req.requestedQuantity} {req.unit} of {req.medicineName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                          Reason: {req.reason}
                        </div>

                        {/* Step Pipeline */}
                        <div className="status-pipeline">
                          <span className={`status-step ${isRequested || isAccepted || isDispatched || isDelivered ? 'completed' : ''}`}>1. Requested</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>
                          <span className={`status-step ${isAccepted || isDispatched || isDelivered ? 'completed' : (isRequested ? 'current' : '')}`}>2. Accepted</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>
                          <span className={`status-step ${isDispatched || isDelivered ? 'completed' : (isAccepted ? 'current' : '')}`}>3. Dispatched</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>
                          <span className={`status-step ${isDelivered ? 'completed' : (isDispatched ? 'current' : '')}`}>4. Delivered</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: AI Stock Forecast Chart for My Clinic */}
            <div className="content-card">
              <div className="card-header">
                <div className="card-title">
                  <TrendingUp size={18} color="#06b6d4" />
                  Stock & Run-Out Forecast vs Patient Demand
                </div>
                
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="filter-select"
                  style={{ fontSize: '0.76rem', padding: '0.3rem 0.6rem' }}
                >
                  {currentClinic.inventory.map(inv => (
                    <option key={inv.medicineId} value={inv.medicineId}>
                      {inv.medicineName || inv.medicineId}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.85rem', fontSize: '0.75rem' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Current Stock</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: currentInv.currentStock < (currentInv.requiredStock || currentInv.minThreshold) ? '#f87171' : '#34d399' }}>
                    {currentInv.currentStock} {currentInv.unit || 'units'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Required Stock</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#38bdf8' }}>
                    {currentInv.requiredStock || currentInv.minThreshold} {currentInv.unit || 'units'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Additional Needed</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: currentInv.additionalRequired > 0 ? '#fbbf24' : '#34d399' }}>
                    {currentInv.additionalRequired || Math.max(0, (currentInv.requiredStock || currentInv.minThreshold) - currentInv.currentStock)} {currentInv.unit || 'units'}
                  </div>
                </div>
              </div>

              <div style={{ height: '230px', width: '100%' }}>
                {chartData && <Line data={chartData} options={chartOptions} />}
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                💡 <strong>Dynamic Demand Model:</strong> Calculated from {currentClinic.currentPatients || 86} current patients and forecasted {currentClinic.expectedPatients?.tomorrow || 105} daily admissions.
              </div>
            </div>
          </div>

          {/* Complete Clinic Medicine Inventory Ledger */}
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <Package size={18} color="#06b6d4" />
                PHC Medicine Stock & Requirement Ledger ({currentClinic.inventory.length} Monitored Items)
              </div>
              <span className="badge badge-info">Real-Time Dispensary Telemetry</span>
            </div>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Current Stock</th>
                    <th>Required Stock</th>
                    <th>Additional Needed</th>
                    <th>Daily Burn Rate</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentClinic.inventory.map((inv) => {
                    const reqStock = inv.requiredStock || inv.minThreshold || 100;
                    const addNeeded = inv.additionalRequired !== undefined ? inv.additionalRequired : Math.max(0, reqStock - inv.currentStock);
                    const isCrit = inv.status === 'CRITICAL' || inv.currentStock <= Math.max(3, reqStock * 0.35);
                    const isWarn = !isCrit && (inv.status === 'WARNING' || inv.currentStock < reqStock);
                    const statusLabel = isCrit ? 'CRITICAL' : (isWarn ? 'WARNING' : 'NORMAL');

                    return (
                      <tr key={inv.medicineId}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#f3f4f6' }}>{inv.medicineName || inv.medicineId}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inv.category}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isCrit ? '#f87171' : (isWarn ? '#fbbf24' : '#34d399') }}>
                            {inv.currentStock} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inv.unit}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#e5e7eb' }}>
                            {reqStock} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inv.unit}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: addNeeded > 0 ? (isCrit ? '#f87171' : '#fbbf24') : '#34d399' }}>
                            {addNeeded > 0 ? `+${addNeeded} ${inv.unit}` : '0 (Sufficient)'}
                          </div>
                        </td>
                        <td>~{inv.dailyBurnRate || 10}/day</td>
                        <td>
                          <span className={`badge ${isCrit ? 'badge-critical' : (isWarn ? 'badge-warning' : 'badge-success')}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedMedId(inv.medicineId);
                              setRequestQty(addNeeded > 0 ? addNeeded : 50);
                              setShowRequestModal(true);
                            }}
                          >
                            <PlusCircle size={13} /> {addNeeded > 0 ? `Request +${addNeeded}` : 'Request Stock'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Request Creation Modal */}
          {showRequestModal && (
            <div className="modal-backdrop" onClick={() => setShowRequestModal(false)}>
              <div className="modal-content animate-fade" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#f9fafb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Stethoscope size={18} color="#10b981" />
                    Submit Medicine Stock Supply Request
                  </strong>
                </div>

                <form onSubmit={handleCreateRequest}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Target Medicine / Resource
                    </label>
                    <select
                      value={selectedMedId}
                      onChange={(e) => setSelectedMedId(e.target.value)}
                      className="filter-select"
                      style={{ width: '100%' }}
                    >
                      {currentClinic.inventory.map(inv => (
                        <option key={inv.medicineId} value={inv.medicineId}>
                          {inv.medicineName} (Current: {inv.currentStock} {inv.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Required Replenishment Quantity (Units)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      step="10"
                      value={requestQty}
                      onChange={(e) => setRequestQty(e.target.value)}
                      required
                      className="filter-select"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Clinical Justification / Reason
                    </label>
                    <textarea
                      rows="3"
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      className="filter-select"
                      style={{ width: '100%', resize: 'vertical' }}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowRequestModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      <Send size={15} /> {isSubmitting ? 'Transmitting...' : 'Confirm & Transmit to Supplier'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
