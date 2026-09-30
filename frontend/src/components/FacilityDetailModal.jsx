import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  Bed, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight,
  Send,
  PlusCircle
} from 'lucide-react';
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
import { Line } from 'react-chartjs-2';
import confetti from 'canvas-confetti';
import { fetchDemandForecast, executeRedistributionTransfer, createSupplyRequest } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function FacilityDetailModal({
  facilityId,
  initialMedicineId,
  facilities,
  medicines,
  supplyRequests = [],
  redistRecommendations = [],
  onClose,
  onRefreshData
}) {
  const facility = facilities.find(f => f.id === facilityId);
  const [selectedMedId, setSelectedMedId] = useState(initialMedicineId || (facility?.inventory[0]?.medicineId || 'MED-001'));
  const [horizon, setHorizon] = useState(30);
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [isExecutingTransfer, setIsExecutingTransfer] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderQty, setOrderQty] = useState(100);
  const [orderReason, setOrderReason] = useState('Urgent stock replenishment requested');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    if (facility && selectedMedId) {
      loadForecast();
    }
  }, [facilityId, selectedMedId, horizon]);

  async function loadForecast() {
    try {
      setForecastLoading(true);
      const res = await fetchDemandForecast(selectedMedId, facilityId, horizon);
      if (res.success) setForecastData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setForecastLoading(false);
    }
  }

  if (!facility) return null;

  const currentInvItem = facility.inventory.find(i => i.medicineId === selectedMedId) || {
    currentStock: 0,
    dailyBurnRate: 10,
    minThreshold: 50,
    unit: 'units'
  };

  const daysCover = currentInvItem.dailyBurnRate > 0 
    ? (currentInvItem.currentStock / currentInvItem.dailyBurnRate).toFixed(1)
    : 99;

  // Relevant alerts for this clinic
  const clinicAlerts = [];
  facility.inventory.forEach(inv => {
    const med = medicines.find(m => m.id === inv.medicineId) || { name: inv.medicineName || inv.medicineId, unit: inv.unit || 'units' };
    const d = inv.dailyBurnRate > 0 ? (inv.currentStock / inv.dailyBurnRate) : 99;

    if (inv.currentStock <= Math.max(3, inv.minThreshold * 0.35) || d <= 2.5) {
      clinicAlerts.push({
        severity: 'CRITICAL',
        title: `Critical Stockout: ${med.name}`,
        message: `Only ${inv.currentStock} ${med.unit} left (${d.toFixed(1)} days runway vs ${inv.minThreshold} min required).`
      });
    } else if (inv.currentStock <= inv.minThreshold || d <= 6.0) {
      clinicAlerts.push({
        severity: 'WARNING',
        title: `Low Safety Buffer: ${med.name}`,
        message: `Current stock (${inv.currentStock} ${med.unit}) has fallen below minimum reorder point (${inv.minThreshold} ${med.unit}).`
      });
    }
  });

  // Clinic Requests
  const clinicRequests = supplyRequests.filter(r => r.clinicId === facility.id);

  // Redistribution recommendation
  const matchingRedist = redistRecommendations.find(r => r.targetFacility?.id === facility.id);

  async function handleApproveTransfer(rec) {
    try {
      setIsExecutingTransfer(true);
      const payload = {
        sourceFacilityId: rec.sourceFacility.id,
        targetFacilityId: rec.targetFacility.id,
        medicineId: rec.medicineId,
        quantity: rec.recommendedTransferQty,
        distanceKm: rec.distanceKm,
        estimatedTransitHours: rec.estimatedTransitHours,
        urgency: rec.urgency
      };

      const res = await executeRedistributionTransfer(payload);
      if (res.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setTransferSuccess(res.message);
        setTimeout(() => setTransferSuccess(''), 5000);
        if (onRefreshData) onRefreshData();
        loadForecast();
      }
    } catch (err) {
      alert(`Error executing transfer: ${err.message}`);
    } finally {
      setIsExecutingTransfer(false);
    }
  }

  async function handleCreateOrder(e) {
    if (e) e.preventDefault();
    try {
      setIsSubmittingOrder(true);
      const targetMed = medicines.find(m => m.id === selectedMedId) || medicines[0];
      const payload = {
        clinicId: facility.id,
        medicineId: targetMed.id,
        requestedQuantity: parseInt(orderQty, 10),
        reason: orderReason,
        chiefDoctor: facility.chiefDoctor
      };

      const res = await createSupplyRequest(payload);
      if (res.success) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setTransferSuccess(`Order created: ${orderQty} ${targetMed.unit} of ${targetMed.name} submitted to supplier.`);
        setShowOrderForm(false);
        setTimeout(() => setTransferSuccess(''), 5000);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      alert(`Error creating order: ${err.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  // Chart Data
  let chartData = null;
  if (forecastData) {
    const labels = forecastData.forecast.map(f => f.dayLabel);
    const trajectory = forecastData.forecast.map(f => f.projectedStock);
    const thresholdLine = new Array(labels.length).fill(currentInvItem.minThreshold);

    chartData = {
      labels,
      datasets: [
        {
          label: 'Projected Stock Trajectory',
          data: trajectory,
          borderColor: currentInvItem.currentStock <= currentInvItem.minThreshold ? '#ef4444' : '#06b6d4',
          backgroundColor: currentInvItem.currentStock <= currentInvItem.minThreshold ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.15)',
          borderWidth: 3,
          pointRadius: 4,
          fill: true,
          tension: 0.2
        },
        {
          label: `Minimum Safety Threshold (${currentInvItem.minThreshold} units)`,
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

  const isCrit = facility.status === 'CRITICAL';
  const isWarn = facility.status === 'WARNING';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content animate-fade" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', width: '95%' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className={`badge ${isCrit ? 'badge-critical' : (isWarn ? 'badge-warning' : 'badge-success')}`}>
                {facility.status} STATUS
              </span>
              <span className="badge badge-info">{facility.city} • {facility.zone}</span>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{facility.id}</span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {facility.displayName || facility.name}
            </h2>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span><User size={13} style={{ verticalAlign: 'middle' }} color="#34d399" /> Chief Doctor: <strong style={{ color: '#fff' }}>{facility.chiefDoctor}</strong></span>
              <span><MapPin size={13} style={{ verticalAlign: 'middle' }} color="#06b6d4" /> {facility.area || facility.location}</span>
              <span><Phone size={13} style={{ verticalAlign: 'middle' }} color="#67e8f9" /> {facility.phone}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.45rem', borderRadius: '50%', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {transferSuccess && (
          <div className="animate-fade" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <CheckCircle2 size={18} /> {transferSuccess}
          </div>
        )}

        {/* Clinical Operations Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #06b6d4' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Bed Availability</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {facility.beds.occupied} / {facility.beds.total}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              ICU: {facility.beds.icu.occupied}/{facility.beds.icu.total} • Oxy: {facility.beds.oxygen.occupied}/{facility.beds.oxygen.total}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #10b981' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Medical Staff On-Duty</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
              {facility.staff.doctors.onDuty} Docs • {facility.staff.nurses.onDuty} Nurses
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{facility.staff.pharmacists.onDuty} Pharmacists</div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${isCrit ? '#ef4444' : '#fbbf24'}` }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Patient Load</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isCrit ? '#f87171' : '#f3f4f6' }}>
              {facility.patientLoad}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dispensary Flow Rate</div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #8b5cf6' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Active Supply Orders</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c084fc' }}>
              {clinicRequests.length} Orders
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {clinicRequests.filter(r => r.status === 'DELIVERED').length} Completed
            </div>
          </div>
        </div>

        {/* Active Shortage Alerts */}
        {clinicAlerts.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={15} /> Active Shortage Risk Signals ({clinicAlerts.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {clinicAlerts.map((alt, i) => (
                <div key={i} style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.8rem', fontSize: '0.78rem' }}>
                  <strong style={{ color: '#f87171' }}>{alt.title}: </strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{alt.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Forecast & Run-Out Estimation */}
        <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#06b6d4" />
              <strong style={{ fontSize: '0.92rem', color: '#f9fafb' }}>Stock Run-Out & Consumption Forecast</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="filter-select"
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                {facility.inventory.map(inv => (
                  <option key={inv.medicineId} value={inv.medicineId}>
                    {inv.medicineName || inv.medicineId}
                  </option>
                ))}
              </select>

              <button
                className="btn-primary"
                onClick={() => setShowOrderForm(!showOrderForm)}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                <PlusCircle size={13} /> Request Stock
              </button>
            </div>
          </div>

          {/* Quick Order Inline Form */}
          {showOrderForm && (
            <form onSubmit={handleCreateOrder} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.85rem', display: 'flex', gap: '0.65rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Quantity to Order</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  step="10"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Reason / Clinical Justification</label>
                <input
                  type="text"
                  value={orderReason}
                  onChange={(e) => setOrderReason(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={isSubmittingOrder} style={{ padding: '0.45rem 0.85rem' }}>
                <Send size={14} /> Submit Order
              </button>
            </form>
          )}

          {/* Forecast Telemetry Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '0.85rem', fontSize: '0.75rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Current Stock</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: currentInvItem.currentStock <= currentInvItem.minThreshold ? '#f87171' : '#34d399' }}>
                {currentInvItem.currentStock} {currentInvItem.unit || 'units'}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Minimum Threshold</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fbbf24' }}>
                {currentInvItem.minThreshold} {currentInvItem.unit || 'units'}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Stock Runway</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: parseFloat(daysCover) <= 3 ? '#f87171' : '#34d399' }}>
                {daysCover} Days
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Projected Run-Out Point</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: forecastData?.stockoutDay ? '#f87171' : '#34d399' }}>
                {forecastData?.stockoutDay ? forecastData.stockoutDay.dateFormatted : `Safe (> ${horizon}d)`}
              </div>
            </div>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            {forecastLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                Loading AI Forecast...
              </div>
            ) : chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : null}
          </div>
        </div>

        {/* Intra-City Redistribution Suggestion (if matched) */}
        {matchingRedist && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(59, 130, 246, 0.04))',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <strong style={{ fontSize: '0.88rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={16} color="#06b6d4" />
                Intra-City Redistribution Match Available
              </strong>
              <span className="badge badge-critical">{matchingRedist.urgency}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center', marginBottom: '0.65rem', fontSize: '0.78rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700 }}>SURPLUS DONOR</div>
                <div style={{ fontWeight: 700 }}>{matchingRedist.sourceFacility.name}</div>
              </div>

              <div style={{ textAlign: 'center', color: '#06b6d4', fontWeight: 800 }}>
                +{matchingRedist.recommendedTransferQty} {matchingRedist.unit}
                <ArrowRight size={16} style={{ display: 'block', margin: '0 auto' }} />
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700 }}>DEFICIT RECEIVER</div>
                <div style={{ fontWeight: 700 }}>{matchingRedist.targetFacility.name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', flex: 1 }}>
                {matchingRedist.aiRationale}
              </div>
              <button
                className="btn-primary"
                disabled={isExecutingTransfer}
                onClick={() => handleApproveTransfer(matchingRedist)}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              >
                <CheckCircle2 size={14} /> {isExecutingTransfer ? 'Authorizing...' : 'Approve Transfer'}
              </button>
            </div>
          </div>
        )}

        {/* Complete Clinic Medicine Inventory Ledger */}
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f9fafb', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Package size={16} color="#06b6d4" />
            Clinic Medicine Inventory Ledger ({facility.inventory.length} Monitored Items)
          </div>

          <div className="table-wrapper">
            <table className="custom-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Current Stock</th>
                  <th>Min Threshold</th>
                  <th>Daily Burn</th>
                  <th>Stock Cover</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {facility.inventory.map((inv) => {
                  const days = inv.dailyBurnRate > 0 ? (inv.currentStock / inv.dailyBurnRate).toFixed(1) : 99;
                  const isCrit = inv.currentStock <= Math.max(3, inv.minThreshold * 0.35) || parseFloat(days) <= 2.5;
                  const isWarn = !isCrit && (inv.currentStock <= inv.minThreshold || parseFloat(days) <= 6.0);
                  const isSelected = inv.medicineId === selectedMedId;

                  return (
                    <tr 
                      key={inv.medicineId} 
                      onClick={() => setSelectedMedId(inv.medicineId)}
                      style={{ cursor: 'pointer', background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent' }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: isSelected ? '#22d3ee' : '#f3f4f6' }}>
                          {inv.medicineName || inv.medicineId}
                        </div>
                      </td>
                      <td>
                        <strong>{inv.currentStock.toLocaleString()}</strong> <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inv.unit}</span>
                      </td>
                      <td>{inv.minThreshold}</td>
                      <td>~{inv.dailyBurnRate}/day</td>
                      <td>
                        <strong style={{ color: isCrit ? '#f87171' : (isWarn ? '#fbbf24' : '#34d399') }}>{days} Days</strong>
                      </td>
                      <td>
                        <span className={`badge ${isCrit ? 'badge-critical' : (isWarn ? 'badge-warning' : 'badge-success')}`}>
                          {isCrit ? 'CRITICAL' : (isWarn ? 'LOW BUFFER' : 'NORMAL')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
