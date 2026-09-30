import React, { useState } from 'react';
import { Package, Search, Filter, AlertCircle, CheckCircle2, TrendingUp, Thermometer, ShieldAlert } from 'lucide-react';

export default function MedicineInventory({ facilities, medicines, onSelectMedicineForecast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedFacility, setSelectedFacility] = useState('ALL');

  // Flatten inventory items across all facilities
  const allInventoryItems = [];
  facilities.forEach(fac => {
    fac.inventory.forEach(inv => {
      const med = medicines.find(m => m.id === inv.medicineId);
      if (med) {
        const daysRemaining = inv.dailyBurnRate > 0 ? (inv.currentStock / inv.dailyBurnRate) : 999;
        allInventoryItems.push({
          ...inv,
          facilityId: fac.id,
          facilityName: fac.name,
          facilityType: fac.type,
          stateId: fac.stateId,
          districtId: fac.districtId,
          medicine: med,
          daysRemaining: parseFloat(daysRemaining.toFixed(1))
        });
      }
    });
  });

  const categories = ['ALL', ...new Set(medicines.map(m => m.category))];

  const filteredItems = allInventoryItems.filter(item => {
    const matchesSearch = item.medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.facilityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.medicine.category === selectedCategory;
    const matchesFacility = selectedFacility === 'ALL' || item.facilityId === selectedFacility;
    return matchesSearch && matchesCategory && matchesFacility;
  });

  return (
    <div className="animate-fade">
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">
            <Package size={20} color="#06b6d4" />
            National Medicine Stock & Supply Chain Visibility
          </div>
          <span className="badge badge-info">{filteredItems.length} Stock Ledger Records</span>
        </div>

        {/* Filters and Search Strip */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search medicine, batch number, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-select"
              style={{ width: '100%', paddingLeft: '2.2rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
              style={{ width: '100%' }}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Therapeutic Categories' : c}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 220px' }}>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="filter-select"
              style={{ width: '100%' }}
            >
              <option value="ALL">All Facilities (DH / CHC / PHC)</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.type.split(' ')[0]})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Medicine & Category</th>
                <th>Healthcare Facility</th>
                <th>Current Stock</th>
                <th>Daily Burn Rate</th>
                <th>Stock Cover (Days)</th>
                <th>Storage Temp</th>
                <th>Batch / Restock</th>
                <th>Status</th>
                <th>AI Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                let badgeClass = 'badge-success';
                let statusLabel = 'Safe Buffer';
                if (item.daysRemaining <= 2.5) {
                  badgeClass = 'badge-critical';
                  statusLabel = 'CRITICAL STOCKOUT';
                } else if (item.daysRemaining <= 6.0) {
                  badgeClass = 'badge-warning';
                  statusLabel = 'LOW BUFFER';
                } else if (item.daysRemaining >= 25.0) {
                  badgeClass = 'badge-violet';
                  statusLabel = 'SURPLUS STOCK';
                }

                return (
                  <tr key={`${item.facilityId}-${item.medicine.id}-${idx}`}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f9fafb' }}>{item.medicine.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.medicine.category}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.facilityName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.facilityType} • {item.stateId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {item.currentStock.toLocaleString()} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.medicine.unit}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Min Req: {item.minThreshold}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#67e8f9' }}>{item.dailyBurnRate}</span> {item.medicine.unit}/day
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: item.daysRemaining <= 3 ? '#f87171' : '#f3f4f6' }}>
                        {item.daysRemaining} Days
                      </div>
                      <div className="progress-bar-container" style={{ width: '90px' }}>
                        <div 
                          className={`progress-bar-fill ${item.daysRemaining <= 3 ? 'fill-red' : (item.daysRemaining <= 7 ? 'fill-amber' : 'fill-cyan')}`}
                          style={{ width: `${Math.min(100, item.daysRemaining * 5)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: item.medicine.tempControl.includes('Cold') ? '#60a5fa' : 'var(--text-secondary)' }}>
                        <Thermometer size={14} /> {item.medicine.tempControl}
                      </span>
                    </td>
                    <td>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#93c5fd' }}>{item.batchNo}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Restocked: {item.lastRestocked}</div>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => onSelectMedicineForecast(item.medicine.id, item.facilityId)}
                      >
                        <TrendingUp size={13} /> Forecast
                      </button>
                    </td>
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
