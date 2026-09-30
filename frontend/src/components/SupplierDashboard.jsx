import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  AlertTriangle, 
  ArrowRight, 
  Send, 
  Building2, 
  Sparkles,
  Search,
  Filter,
  MapPin,
  Globe2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateSupplyRequestStatus } from '../services/api';
import LocationSelector from './LocationSelector';

export default function SupplierDashboard({
  facilities = [],
  supplyRequests = [],
  onRefreshData
}) {
  // Cascading Location Filter: City -> Area -> PHC
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPhcId, setSelectedPhcId] = useState('');

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

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

  // Filter requests based on City, Area, PHC and Status
  const filteredRequests = supplyRequests.filter(r => {
    const matchCity = !selectedCity || r.city.toLowerCase() === selectedCity.toLowerCase();
    const matchArea = !selectedArea || (r.area && r.area.toLowerCase() === selectedArea.toLowerCase());
    const matchPhc = !selectedPhcId || r.clinicId === selectedPhcId;
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchCity && matchArea && matchPhc && matchStatus;
  });

  const pendingCount = supplyRequests.filter(r => r.status === 'REQUESTED').length;
  const acceptedCount = supplyRequests.filter(r => r.status === 'ACCEPTED').length;
  const dispatchedCount = supplyRequests.filter(r => r.status === 'DISPATCHED').length;
  const deliveredCount = supplyRequests.filter(r => r.status === 'DELIVERED').length;

  async function handleStatusTransition(req, nextStatus) {
    try {
      setProcessingId(req.id);
      const res = await updateSupplyRequestStatus(req.id, nextStatus, `Supplier action: Order moved to ${nextStatus}`);
      if (res.success) {
        if (nextStatus === 'DELIVERED') {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          setToastMessage(`✓ Order ${req.id} delivered! ${req.requestedQuantity} ${req.unit} of ${req.medicineName} added to ${req.clinicName} inventory.`);
        } else if (nextStatus === 'DISPATCHED') {
          setToastMessage(`✓ Order ${req.id} dispatched for delivery to ${req.clinicName}.`);
        } else {
          setToastMessage(`✓ Order ${req.id} accepted by Central Medical Depot.`);
        }
        setTimeout(() => setToastMessage(''), 6000);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      alert(`Error updating request: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="animate-fade">
      {/* Supplier Header Banner */}
      <div className="content-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(6, 182, 212, 0.05))', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span className="role-badge role-supplier">CENTRAL STOCK SUPPLIER & DEPOT</span>
              <span className="badge badge-warning">Active Fulfillment Operations</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.02em' }}>
              Hospital & Clinic Supply Fulfillment Queue
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Filter by City &rarr; Area &rarr; PHC to process emergency replenishment requests and courier dispatches
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="animate-fade" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem' }}>
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

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

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div>
            <div className="kpi-label">Pending Requests</div>
            <div className="kpi-value" style={{ color: '#f87171' }}>{pendingCount}</div>
            <div className="kpi-subtext">Awaiting Depot Acceptance</div>
          </div>
          <div className="kpi-icon-box kpi-icon-red"><Clock size={20} /></div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div>
            <div className="kpi-label">Accepted / Packing</div>
            <div className="kpi-value" style={{ color: '#fbbf24' }}>{acceptedCount}</div>
            <div className="kpi-subtext">Preparing for Dispatch</div>
          </div>
          <div className="kpi-icon-box kpi-icon-amber"><Package size={20} /></div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #06b6d4' }}>
          <div>
            <div className="kpi-label">Dispatched / In-Transit</div>
            <div className="kpi-value" style={{ color: '#22d3ee' }}>{dispatchedCount}</div>
            <div className="kpi-subtext">En-Route to Clinics</div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan"><Truck size={20} /></div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div>
            <div className="kpi-label">Completed Deliveries</div>
            <div className="kpi-value" style={{ color: '#34d399' }}>{deliveredCount}</div>
            <div className="kpi-subtext">PHCs Replenished</div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald"><CheckCircle2 size={20} /></div>
        </div>
      </div>

      {/* Supply Requests Processing Queue Table */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <Truck size={18} color="#06b6d4" />
            Supply Requests & Dispatch Control Queue ({filteredRequests.length} Orders)
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
              style={{ fontSize: '0.78rem' }}
            >
              <option value="ALL">All Request Statuses</option>
              <option value="REQUESTED">Requested (Action Needed)</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID & Date</th>
                <th>PHC Clinic & Chief Doctor</th>
                <th>City & Zone</th>
                <th>Medicine</th>
                <th>Current Stock</th>
                <th>Required Stock</th>
                <th>Additional Needed</th>
                <th>Priority</th>
                <th>Status Pipeline</th>
                <th>Supplier Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No supply requests match the selected location or status filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.status === 'REQUESTED';
                  const isAccepted = req.status === 'ACCEPTED';
                  const isDispatched = req.status === 'DISPATCHED';
                  const isDelivered = req.status === 'DELIVERED';
                  const isCurrentProc = processingId === req.id;
                  const reqStock = req.requiredStock || (req.currentStock + req.requestedQuantity);
                  const addNeeded = req.additionalRequired || req.requestedQuantity;

                  return (
                    <tr key={req.id}>
                      <td>
                        <div className="font-mono" style={{ fontWeight: 700, color: '#93c5fd' }}>{req.id}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(req.requestDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#f3f4f6' }}>{req.clinicName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chief Dr: {req.chiefDoctor}</div>
                      </td>
                      <td>
                        <div>{req.city}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.zone} • {req.area}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#67e8f9' }}>{req.medicineName}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: req.currentStock <= 25 ? '#f87171' : '#f3f4f6' }}>
                          {req.currentStock} {req.unit}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#e5e7eb' }}>
                          {reqStock} {req.unit}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#fbbf24' }}>
                          +{addNeeded} {req.unit}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${req.priority === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td>
                        <div className="status-pipeline">
                          <span className={`status-step ${isPending || isAccepted || isDispatched || isDelivered ? 'completed' : ''}`}>Requested</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>→</span>
                          <span className={`status-step ${isAccepted || isDispatched || isDelivered ? 'completed' : (isPending ? 'current' : '')}`}>Accepted</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>→</span>
                          <span className={`status-step ${isDispatched || isDelivered ? 'completed' : (isAccepted ? 'current' : '')}`}>Dispatched</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>→</span>
                          <span className={`status-step ${isDelivered ? 'completed' : (isDispatched ? 'current' : '')}`}>Delivered</span>
                        </div>
                      </td>
                      <td>
                        {isPending && (
                          <button
                            className="btn-primary"
                            disabled={isCurrentProc}
                            onClick={() => handleStatusTransition(req, 'ACCEPTED')}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                          >
                            <CheckCircle2 size={13} /> {isCurrentProc ? 'Processing...' : 'Accept Order'}
                          </button>
                        )}

                        {isAccepted && (
                          <button
                            className="btn-primary"
                            disabled={isCurrentProc}
                            onClick={() => handleStatusTransition(req, 'DISPATCHED')}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}
                          >
                            <Truck size={13} /> {isCurrentProc ? 'Dispatching...' : 'Dispatch Stock'}
                          </button>
                        )}

                        {isDispatched && (
                          <button
                            className="btn-primary"
                            disabled={isCurrentProc}
                            onClick={() => handleStatusTransition(req, 'DELIVERED')}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                          >
                            <CheckCircle2 size={13} /> {isCurrentProc ? 'Updating...' : 'Confirm Delivery'}
                          </button>
                        )}

                        {isDelivered && (
                          <span className="badge badge-success">
                            ✓ Stock Added to PHC
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
