import React, { useState } from 'react';
import { 
  Truck, 
  ArrowRight, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  Navigation,
  Thermometer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { executeRedistributionTransfer } from '../services/api';

export default function RedistributionHubView({ 
  redistData, 
  onRefreshData,
  highlightFacilityId, 
  highlightMedicineId 
}) {
  const [executingId, setExecutingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  if (!redistData) {
    return <div className="animate-fade" style={{ padding: '2rem', textAlign: 'center' }}>Calculating nearest-neighbor redistribution matrix...</div>;
  }

  const { recommendations, activeTransfers } = redistData;

  async function handleApproveTransfer(rec) {
    try {
      setExecutingId(rec.id);
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
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setSuccessMessage(res.message);
        setTimeout(() => setSuccessMessage(''), 6000);
        // Refresh platform data
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      alert(`Error executing transfer: ${err.message}`);
    } finally {
      setExecutingId(null);
    }
  }

  return (
    <div className="animate-fade">
      {successMessage && (
        <div className="animate-fade" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <CheckCircle2 size={20} />
          <strong style={{ fontSize: '0.9rem' }}>{successMessage}</strong>
        </div>
      )}

      {/* Rationale Banner */}
      <div className="content-card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.05))', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Sparkles size={20} color="#22d3ee" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f9fafb' }}>
            Autonomous Multi-Tier Healthcare Redistribution Optimization
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          The redistribution solver evaluates regional stock buffers, geolocated transport corridors, and disease outbreak velocity. Surplus nodes (&gt; 15 days supply) are safely paired with imminent deficit nodes (&lt; 4 days) without triggering secondary stock-outs at donor facilities.
        </p>
      </div>

      {/* Recommendations Cards */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <Truck size={20} color="#06b6d4" />
            AI Transfer Recommendations ({recommendations.length} Active Pairings)
          </div>
          <span className="badge badge-info">Multi-Facility Greedy Optimization</span>
        </div>

        {recommendations.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            All facilities currently maintain safe inventory equilibrium. No urgent transfers required.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recommendations.map(rec => {
              const isHighlighted = (highlightFacilityId && rec.targetFacility.id === highlightFacilityId) ||
                                    (highlightMedicineId && rec.medicineId === highlightMedicineId);

              return (
                <div 
                  key={rec.id}
                  style={{
                    background: isHighlighted ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-surface-elevated)',
                    border: isHighlighted ? '2px solid #06b6d4' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span className="badge badge-critical">{rec.urgency}</span>
                      <strong style={{ fontSize: '1.05rem', color: '#f9fafb' }}>{rec.medicineName}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({rec.category})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span><Navigation size={14} style={{ verticalAlign: 'middle' }} /> {rec.distanceKm} km</span>
                      <span><Clock size={14} style={{ verticalAlign: 'middle' }} /> ~{rec.estimatedTransitHours} hrs ETA</span>
                      {rec.tempControl.includes('Cold') && (
                        <span style={{ color: '#60a5fa' }}><Thermometer size={14} style={{ verticalAlign: 'middle' }} /> Cold Chain (2-8°C)</span>
                      )}
                    </div>
                  </div>

                  {/* Visual Source -> Target Route Flow */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                    {/* Donor Node */}
                    <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        DONOR (SURPLUS NODE)
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f3f4f6' }}>{rec.sourceFacility.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{rec.sourceFacility.districtName} ({rec.sourceFacility.stateId})</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span>Current Stock: <strong>{rec.sourceFacility.currentStock}</strong></span>
                        <span style={{ color: '#34d399' }}>Excess: <strong>+{rec.sourceFacility.surplusAvailable} units</strong></span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Post-transfer Stock: {rec.sourceFacility.postTransferStock} (Remains Safe)
                      </div>
                    </div>

                    {/* Middle Transfer Stats */}
                    <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>RECOMMENDED TRANSFER</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22d3ee' }}>
                        {rec.recommendedTransferQty.toLocaleString()} {rec.unit}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Est. Value: ₹{rec.estimatedCostINR.toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#06b6d4' }}>
                        <ArrowRight size={22} />
                      </div>
                    </div>

                    {/* Receiver Node */}
                    <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        RECEIVER (DEFICIT NODE)
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f3f4f6' }}>{rec.targetFacility.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{rec.targetFacility.districtName} ({rec.targetFacility.stateId})</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span>Current Runway: <strong style={{ color: '#f87171' }}>{rec.targetFacility.currentCoverageDays} Days</strong></span>
                        <span style={{ color: '#34d399' }}>After Transfer: <strong>{rec.targetFacility.postTransferCoverageDays} Days</strong></span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Restores critical buffer for next 2 weeks
                      </div>
                    </div>
                  </div>

                  {/* AI Rationale & Action Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: '1 1 400px' }}>
                      <strong>AI Rationale:</strong> {rec.aiRationale}
                    </div>

                    <button 
                      className="btn-primary" 
                      disabled={executingId === rec.id}
                      onClick={() => handleApproveTransfer(rec)}
                    >
                      <CheckCircle2 size={16} /> 
                      {executingId === rec.id ? 'Authorizing Dispatch...' : 'Approve & Dispatch Transfer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active In-Transit Orders Ledger */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={20} color="#3b82f6" />
            Active Redistribution Shipments & Fleet Ledger ({activeTransfers.length})
          </div>
          <span className="badge badge-success">GPS & Cold-Chain Monitored</span>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Medicine & Qty</th>
                <th>Source Hospital</th>
                <th>Target Hospital</th>
                <th>Transit Dist / ETA</th>
                <th>Cold Chain</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeTransfers.map(order => (
                <tr key={order.id}>
                  <td className="font-mono" style={{ color: '#93c5fd', fontWeight: 700 }}>{order.id}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{order.medicineName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.quantity.toLocaleString()} {order.unit}</div>
                  </td>
                  <td>{order.sourceFacilityName}</td>
                  <td>{order.targetFacilityName}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.distanceKm} km</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ETA: {new Date(order.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td>
                    {order.coldChainRequired ? (
                      <span className="badge badge-info">2-8°C Active</span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ambient</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-warning" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                      <Truck size={12} /> {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
