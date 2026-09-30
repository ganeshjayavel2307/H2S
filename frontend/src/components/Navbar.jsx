import React, { useState } from 'react';
import { 
  Activity, 
  Package, 
  LogOut, 
  Building2, 
  Stethoscope, 
  Truck, 
  Bell, 
  Globe2, 
  CheckCircle2, 
  AlertTriangle,
  X,
  User
} from 'lucide-react';

export default function Navbar({
  currentRoute,
  onNavigate,
  onLogout,
  currentUser,
  selectedCity,
  onCityChange,
  notifications = [],
  alertCount = 0
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const role = currentUser?.role || 'DOCTOR';

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div 
          className="brand-wrapper" 
          style={{ cursor: 'pointer' }} 
          onClick={() => onNavigate(role === 'DOCTOR' ? 'doctor' : (role === 'SUPPLIER' ? 'supplier' : 'minister'))}
        >
          <div>
            <div className="brand-title">HEALTHFLOW AI</div>
            <div className="brand-subtitle">
              <span>Smart Health & Supply Chain Resilience</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {role === 'DOCTOR' && (
            <>
              <button
                className={`nav-tab-btn ${currentRoute === 'doctor' ? 'active' : ''}`}
                onClick={() => onNavigate('doctor')}
              >
                <Stethoscope size={15} /> My Clinic (042)
              </button>
              <button
                className={`nav-tab-btn ${currentRoute === 'inventory' ? 'active' : ''}`}
                onClick={() => onNavigate('inventory')}
              >
                <Package size={15} /> Citywide Inventory
              </button>
            </>
          )}

          {role === 'MINISTER' && (
            <>
              <button
                className={`nav-tab-btn ${currentRoute === 'minister' ? 'active' : ''}`}
                onClick={() => onNavigate('minister')}
              >
                <Building2 size={15} /> Command Center
              </button>
              <button
                className={`nav-tab-btn ${currentRoute === 'inventory' ? 'active' : ''}`}
                onClick={() => onNavigate('inventory')}
              >
                <Package size={15} /> Network Inventory
              </button>
            </>
          )}

          {role === 'SUPPLIER' && (
            <>
              <button
                className={`nav-tab-btn ${currentRoute === 'supplier' ? 'active' : ''}`}
                onClick={() => onNavigate('supplier')}
              >
                <Truck size={15} /> Supply & Dispatch
              </button>
              <button
                className={`nav-tab-btn ${currentRoute === 'inventory' ? 'active' : ''}`}
                onClick={() => onNavigate('inventory')}
              >
                <Package size={15} /> Clinic Inventory
              </button>
            </>
          )}
        </div>

        {/* Right Section: Notification Bell + Role Badge + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="btn-secondary"
              style={{ padding: '0.45rem', borderRadius: '50%', position: 'relative' }}
              title="Notifications"
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifs && (
              <div className="notif-dropdown animate-fade">
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#f3f4f6' }}>Live Notifications</strong>
                  <button onClick={() => setShowNotifs(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={15} />
                  </button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} style={{ padding: '0.6rem 0.75rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.03)', marginBottom: '0.4rem', borderLeft: `3px solid ${n.type === 'CRITICAL' ? '#ef4444' : (n.type === 'WARNING' ? '#f59e0b' : '#06b6d4')}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700, color: n.type === 'CRITICAL' ? '#f87171' : '#e5e7eb' }}>{n.title}</span>
                          <span>{n.timestamp}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Badge */}
          <div className={`role-badge ${role === 'DOCTOR' ? 'role-doctor' : (role === 'MINISTER' ? 'role-minister' : 'role-supplier')}`}>
            {role === 'DOCTOR' && <Stethoscope size={13} />}
            {role === 'MINISTER' && <Building2 size={13} />}
            {role === 'SUPPLIER' && <Truck size={13} />}
            <span>{role}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="btn-secondary"
            title="Sign out"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
