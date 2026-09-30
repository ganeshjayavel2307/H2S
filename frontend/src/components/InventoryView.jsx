import React, { useState, useMemo } from 'react';
import { Package, Search, Filter, ArrowUpDown, ChevronRight, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function InventoryView({ facilities, medicines, onSelectFacility }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [drugFilter, setDrugFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('daysRemaining');
  const [sortAsc, setSortAsc] = useState(true);

  // Flatten all clinic inventory rows into a unified table
  const unifiedInventory = useMemo(() => {
    const list = [];
    facilities.forEach(fac => {
      fac.inventory.forEach(inv => {
        const med = medicines.find(m => m.id === inv.medicineId) || { name: inv.medicineName || inv.medicineId, category: inv.category || 'Essential', unit: inv.unit || 'units' };
        const daysRemaining = inv.dailyBurnRate > 0 ? (inv.currentStock / inv.dailyBurnRate) : 999;
        
        let status = 'NORMAL';
        if (inv.currentStock <= Math.max(3, inv.minThreshold * 0.35) || daysRemaining <= 2.5) {
          status = 'CRITICAL';
        } else if (inv.currentStock <= inv.minThreshold || daysRemaining <= 6.0) {
          status = 'WARNING';
        } else if (inv.currentStock >= inv.minThreshold * 3.0) {
          status = 'SURPLUS';
        }

        list.push({
          clinicId: fac.id,
          clinicName: fac.displayName || fac.name,
          city: fac.city,
          zone: fac.zone || 'Central Zone',
          area: fac.area || '',
          chiefDoctor: fac.chiefDoctor,
          medicineId: inv.medicineId,
          medicineName: med.name,
          category: med.category,
          unit: med.unit,
          currentStock: inv.currentStock,
          minThreshold: inv.minThreshold,
          dailyBurnRate: inv.dailyBurnRate,
          daysRemaining: parseFloat(daysRemaining.toFixed(1)),
          batchNo: inv.batchNo || 'BATCH-01',
          status
        });
      });
    });
    return list;
  }, [facilities, medicines]);

  // Unique filter lists
  const cities = useMemo(() => ['ALL', ...new Set(unifiedInventory.map(i => i.city))], [unifiedInventory]);
  const zones = useMemo(() => {
    const subset = cityFilter === 'ALL' ? unifiedInventory : unifiedInventory.filter(i => i.city === cityFilter);
    return ['ALL', ...new Set(subset.map(i => i.zone))];
  }, [unifiedInventory, cityFilter]);
  const drugNames = useMemo(() => ['ALL', ...new Set(medicines.map(m => m.name))], [medicines]);

  // Filtering
  const filteredList = useMemo(() => {
    return unifiedInventory.filter(item => {
      const matchSearch = item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.chiefDoctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.zone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCity = cityFilter === 'ALL' || item.city === cityFilter;
      const matchZone = zoneFilter === 'ALL' || item.zone === zoneFilter;
      const matchDrug = drugFilter === 'ALL' || item.medicineName === drugFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchSearch && matchCity && matchZone && matchDrug && matchStatus;
    });
  }, [unifiedInventory, searchTerm, cityFilter, zoneFilter, drugFilter, statusFilter]);

  // Sorting
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredList, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="animate-fade">
      <div className="content-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Package size={18} color="#06b6d4" />
              Unified Public Healthcare Medicine Inventory
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Real-time stock ledger across {facilities.length} primary health clinics in Chennai & Coimbatore
            </div>
          </div>
          <span className="badge badge-info">{sortedList.length} Inventory Records</span>
        </div>

        {/* Filter Controls Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginBottom: '1.15rem' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search clinic, medicine, doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-select"
              style={{ width: '100%', paddingLeft: '2.2rem' }}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* City Filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setZoneFilter('ALL');
              }}
              className="filter-select"
              style={{ width: '100%' }}
            >
              {cities.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Cities (Chennai & Coimbatore)' : `${c} City`}</option>
              ))}
            </select>
          </div>

          {/* Zone Filter */}
          <div>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="filter-select"
              style={{ width: '100%' }}
            >
              {zones.map(z => (
                <option key={z} value={z}>{z === 'ALL' ? 'All Zones' : z}</option>
              ))}
            </select>
          </div>

          {/* Drug Filter */}
          <div>
            <select
              value={drugFilter}
              onChange={(e) => setDrugFilter(e.target.value)}
              className="filter-select"
              style={{ width: '100%' }}
            >
              {drugNames.map(d => (
                <option key={d} value={d}>{d === 'ALL' ? 'All Medicines' : d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
              style={{ width: '100%' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical Shortage</option>
              <option value="WARNING">Low Buffer (Warning)</option>
              <option value="NORMAL">Normal Buffer</option>
              <option value="SURPLUS">Surplus Buffer</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('clinicName')} style={{ cursor: 'pointer' }}>
                  Clinic <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th onClick={() => handleSort('city')} style={{ cursor: 'pointer' }}>
                  City / Zone <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th onClick={() => handleSort('chiefDoctor')} style={{ cursor: 'pointer' }}>
                  Chief Doctor <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th onClick={() => handleSort('medicineName')} style={{ cursor: 'pointer' }}>
                  Medicine <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th onClick={() => handleSort('currentStock')} style={{ cursor: 'pointer' }}>
                  Current Stock <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th onClick={() => handleSort('minThreshold')} style={{ cursor: 'pointer' }}>
                  Min Required <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th onClick={() => handleSort('daysRemaining')} style={{ cursor: 'pointer' }}>
                  Forecast / Cover <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Status <ArrowUpDown size={12} style={{ verticalAlign: 'middle' }} />
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No inventory records match the selected filters.
                  </td>
                </tr>
              ) : (
                sortedList.slice(0, 100).map((item, idx) => {
                  let badgeClass = 'badge-success';
                  let badgeLabel = 'NORMAL';
                  if (item.status === 'CRITICAL') {
                    badgeClass = 'badge-critical';
                    badgeLabel = 'CRITICAL';
                  } else if (item.status === 'WARNING') {
                    badgeClass = 'badge-warning';
                    badgeLabel = 'WARNING';
                  } else if (item.status === 'SURPLUS') {
                    badgeClass = 'badge-violet';
                    badgeLabel = 'SURPLUS';
                  }

                  return (
                    <tr 
                      key={`${item.clinicId}-${item.medicineId}-${idx}`}
                      onClick={() => onSelectFacility(item.clinicId, item.medicineId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: '#f3f4f6' }}>{item.clinicName}</div>
                        <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.clinicId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.city}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.zone}</div>
                      </td>
                      <td>
                        <span style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 600 }}>{item.chiefDoctor}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#67e8f9' }}>{item.medicineName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.category}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                          {item.currentStock.toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Burn: ~{item.dailyBurnRate}/d</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.84rem' }}>{item.minThreshold.toLocaleString()}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: item.daysRemaining <= 3 ? '#f87171' : (item.daysRemaining <= 7 ? '#fbbf24' : '#f3f4f6') }}>
                          {item.daysRemaining} Days
                        </div>
                        <div className="progress-bar-container" style={{ width: '75px' }}>
                          <div 
                            className={`progress-bar-fill ${item.daysRemaining <= 3 ? 'fill-red' : (item.daysRemaining <= 7 ? 'fill-amber' : 'fill-cyan')}`}
                            style={{ width: `${Math.min(100, item.daysRemaining * 4)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFacility(item.clinicId, item.medicineId);
                          }}
                        >
                          <TrendingUp size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {sortedList.length > 100 && (
            <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)' }}>
              Showing first 100 of {sortedList.length} records. Refine filters or search to narrow results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
