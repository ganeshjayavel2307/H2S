import React from 'react';
import { Bed, AlertTriangle, Users, Activity, TrendingUp, Sparkles, Navigation, ShieldCheck } from 'lucide-react';
import CitywideFacilityMap from './CitywideFacilityMap';
import AlertsFeed from './AlertsFeed';

export default function DashboardView({
  stats,
  facilities,
  alertsData,
  onSelectFacility
}) {
  const beds = stats?.beds || { occupancyRate: '82.4', occupied: 8200, total: 9800 };
  const supply = stats?.supplyChainHealth || { criticalStockouts: 4, lowStockCount: 6, activeSurplusRecommendations: 4 };

  return (
    <div className="animate-fade">
      {/* Top Quick Status Ribbon */}
      <div className="kpi-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="kpi-card" style={{ padding: '0.85rem 1rem' }}>
          <div>
            <div className="kpi-label">Monitored Facilities</div>
            <div className="kpi-value" style={{ fontSize: '1.45rem' }}>{facilities.length}</div>
            <div className="kpi-subtext">Hospitals & Health Centers</div>
          </div>
          <div className="kpi-icon-box kpi-icon-cyan"><Activity size={20} /></div>
        </div>

        <div className="kpi-card" style={{ padding: '0.85rem 1rem' }}>
          <div>
            <div className="kpi-label">Patient Bed Saturation</div>
            <div className="kpi-value" style={{ fontSize: '1.45rem' }}>{beds.occupancyRate}%</div>
            <div className="kpi-subtext">{beds.occupied?.toLocaleString()} Beds Occupied</div>
          </div>
          <div className="kpi-icon-box kpi-icon-red"><Bed size={20} /></div>
        </div>

        <div className="kpi-card" style={{ padding: '0.85rem 1rem', borderLeft: '3px solid #ef4444' }}>
          <div>
            <div className="kpi-label">Critical Stockouts</div>
            <div className="kpi-value" style={{ fontSize: '1.45rem', color: '#f87171' }}>
              {supply.criticalStockouts} Items
            </div>
            <div className="kpi-subtext">Under 2.5 Days Runway</div>
          </div>
          <div className="kpi-icon-box kpi-icon-red"><AlertTriangle size={20} /></div>
        </div>

        <div className="kpi-card" style={{ padding: '0.85rem 1rem' }}>
          <div>
            <div className="kpi-label">AI Redistribution Matches</div>
            <div className="kpi-value" style={{ fontSize: '1.45rem', color: '#34d399' }}>
              {supply.activeSurplusRecommendations} Routes
            </div>
            <div className="kpi-subtext">Surplus Available to Balance</div>
          </div>
          <div className="kpi-icon-box kpi-icon-emerald"><TrendingUp size={20} /></div>
        </div>
      </div>

      {/* Main Split Grid: Map on Left, Alerts on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(400px, 2fr) minmax(320px, 1fr)',
        gap: '1.25rem',
        alignItems: 'stretch'
      }}>
        {/* Left Side: Citywide Map */}
        <div style={{ minHeight: '520px' }}>
          <CitywideFacilityMap
            facilities={facilities}
            onSelectFacility={onSelectFacility}
          />
        </div>

        {/* Right Side: Priority Alerts Feed */}
        <div style={{ minHeight: '520px' }}>
          <AlertsFeed
            alertsData={alertsData}
            onSelectFacility={onSelectFacility}
          />
        </div>
      </div>
    </div>
  );
}
