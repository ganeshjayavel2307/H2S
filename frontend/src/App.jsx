import React, { useState, useEffect } from 'react';
import './App.css';

import {
  fetchCities,
  fetchDashboardStats,
  fetchClinics,
  fetchMedicines,
  fetchSupplyRequests,
  fetchAlerts,
  fetchRedistributionRecommendations,
  fetchNotifications
} from './services/api';

import LoginView from './components/LoginView';
import Navbar from './components/Navbar';
import DoctorDashboard from './components/DoctorDashboard';
import MinisterDashboard from './components/MinisterDashboard';
import SupplierDashboard from './components/SupplierDashboard';
import InventoryView from './components/InventoryView';
import FacilityDetailModal from './components/FacilityDetailModal';

function App() {
  // Authentication state from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sanjeevani_auth');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Selected City ('Chennai' vs 'Coimbatore')
  const [selectedCity, setSelectedCity] = useState('Chennai');

  // Routing state
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (!currentUser) return 'login';
    const role = currentUser.role;
    if (role === 'DOCTOR') return 'doctor';
    if (role === 'SUPPLIER') return 'supplier';
    return 'minister';
  });

  // Modal inspection state
  const [activeFacilityId, setActiveFacilityId] = useState(null);
  const [activeMedicineId, setActiveMedicineId] = useState(null);

  // Platform Data
  const [loading, setLoading] = useState(true);
  const [citySummaries, setCitySummaries] = useState([]);
  const [stats, setStats] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [alertsData, setAlertsData] = useState(null);
  const [redistData, setRedistData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Load Platform Data on Mount & City change & Auth change
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [currentUser, selectedCity]);

  async function loadAllData() {
    try {
      setLoading(true);
      const [
        citiesRes,
        statsRes,
        clinicsRes,
        medicinesRes,
        requestsRes,
        alertsRes,
        redistRes,
        notifsRes
      ] = await Promise.all([
        fetchCities(),
        fetchDashboardStats(),
        fetchClinics(),
        fetchMedicines(),
        fetchSupplyRequests(),
        fetchAlerts(),
        fetchRedistributionRecommendations(),
        fetchNotifications(currentUser.role, currentUser.assignedClinicId)
      ]);

      setCitySummaries(citiesRes.data || []);
      setStats(statsRes.data || null);
      setFacilities(clinicsRes.data || []);
      setMedicines(medicinesRes.data || []);
      setSupplyRequests(requestsRes.data || []);
      setAlertsData(alertsRes.data || null);
      setRedistData(redistRes.data || null);
      setNotifications(notifsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch platform data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Login
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    if (userData.role === 'DOCTOR') {
      setCurrentRoute('doctor');
    } else if (userData.role === 'SUPPLIER') {
      setCurrentRoute('supplier');
    } else {
      setCurrentRoute('minister');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('sanjeevani_auth');
    setCurrentUser(null);
    setCurrentRoute('login');
    setActiveFacilityId(null);
  };

  // Handle City Change
  const handleCityChange = (city) => {
    setSelectedCity(city);
  };

  // Handle Facility Modal Selection
  const handleSelectFacility = (facilityId, medicineId = null) => {
    setActiveFacilityId(facilityId);
    setActiveMedicineId(medicineId);
  };

  const handleCloseModal = () => {
    setActiveFacilityId(null);
    setActiveMedicineId(null);
  };

  // 1. Strict Protected Route: Unauthenticated users ALWAYS see Login Screen
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Find assigned clinic for Doctor
  const doctorClinic = facilities.find(f => f.id === (currentUser.assignedClinicId || 'CHE-042')) || facilities[0];

  return (
    <div className="app-container">
      {/* Persistent SaaS Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        onLogout={handleLogout}
        currentUser={currentUser}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
        notifications={notifications}
        alertCount={alertsData?.criticalCount || 0}
      />

      {/* Main Screen Content based on Role & Route */}
      <main className="main-content" style={{ padding: '1.25rem 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div className="pulse-dot primary" style={{ width: '16px', height: '16px', marginBottom: '1rem' }}></div>
            <div>Synchronizing Healthcare Resource Stream...</div>
          </div>
        ) : (
          <>
            {/* DOCTOR DASHBOARD */}
            {currentRoute === 'doctor' && (
              <DoctorDashboard
                clinic={doctorClinic}
                facilities={facilities}
                medicines={medicines}
                supplyRequests={supplyRequests}
                onRefreshData={loadAllData}
                onOpenFacilityModal={handleSelectFacility}
              />
            )}

            {/* MINISTER DASHBOARD */}
            {currentRoute === 'minister' && (
              <MinisterDashboard
                stats={stats}
                citySummaries={citySummaries}
                facilities={facilities}
                alertsData={alertsData}
                supplyRequests={supplyRequests}
                redistData={redistData}
                onSelectFacility={handleSelectFacility}
                onRefreshData={loadAllData}
              />
            )}

            {/* SUPPLIER DASHBOARD */}
            {currentRoute === 'supplier' && (
              <SupplierDashboard
                facilities={facilities}
                supplyRequests={supplyRequests}
                onRefreshData={loadAllData}
              />
            )}

            {/* UNIFIED INVENTORY VIEW */}
            {currentRoute === 'inventory' && (
              <InventoryView
                facilities={facilities}
                medicines={medicines}
                onSelectFacility={handleSelectFacility}
              />
            )}
          </>
        )}
      </main>

      {/* Facility / Clinic Detail Modal */}
      {activeFacilityId && (
        <FacilityDetailModal
          facilityId={activeFacilityId}
          initialMedicineId={activeMedicineId}
          facilities={facilities}
          medicines={medicines}
          supplyRequests={supplyRequests}
          redistRecommendations={redistData?.recommendations || []}
          onClose={handleCloseModal}
          onRefreshData={loadAllData}
        />
      )}

      {/* Global Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '0.85rem 1.5rem', textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
        <div>
          HEALTHFLOW AI • Smart Health & Supply Chain Platform • Citywide Clinic Operations for Chennai & Coimbatore
        </div>
      </footer>
    </div>
  );
}

export default App;
