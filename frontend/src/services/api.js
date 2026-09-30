// Unified API Service for Smart Health & Supply Chain Platform

const BASE_URL = '/api';

export async function fetchCities() {
  const res = await fetch(`${BASE_URL}/cities`);
  if (!res.ok) throw new Error('Failed to fetch cities summary');
  return res.json();
}

export async function fetchDashboardStats(city = '') {
  const url = city ? `${BASE_URL}/dashboard/stats?city=${encodeURIComponent(city)}` : `${BASE_URL}/dashboard/stats`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchClinics(filters = {}) {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.zone) params.append('zone', filters.zone);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${BASE_URL}/clinics?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch clinics');
  return res.json();
}

export async function fetchClinicById(id) {
  const res = await fetch(`${BASE_URL}/clinics/${id}`);
  if (!res.ok) throw new Error('Failed to fetch clinic details');
  return res.json();
}

export async function fetchMedicines() {
  const res = await fetch(`${BASE_URL}/medicines`);
  if (!res.ok) throw new Error('Failed to fetch medicines');
  return res.json();
}

export async function fetchSupplyRequests(filters = {}) {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.clinicId) params.append('clinicId', filters.clinicId);
  if (filters.status) params.append('status', filters.status);

  const res = await fetch(`${BASE_URL}/requests?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch supply requests');
  return res.json();
}

export async function createSupplyRequest(requestData) {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create supply request');
  }
  return res.json();
}

export async function updateSupplyRequestStatus(id, status, note = '') {
  const res = await fetch(`${BASE_URL}/requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to update supply request status');
  }
  return res.json();
}

export async function fetchNotifications(role, clinicId = '', city = '') {
  const params = new URLSearchParams();
  if (role) params.append('role', role);
  if (clinicId) params.append('clinicId', clinicId);
  if (city) params.append('city', city);

  const res = await fetch(`${BASE_URL}/notifications?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function fetchAlerts(city = '', zone = '') {
  const params = new URLSearchParams();
  if (city) params.append('city', city);
  if (zone) params.append('zone', zone);

  const res = await fetch(`${BASE_URL}/alerts?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchDemandForecast(medicineId, facilityId, horizon = 30) {
  const params = new URLSearchParams({
    medicineId,
    facilityId,
    horizon
  });
  const res = await fetch(`${BASE_URL}/forecast?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch demand forecast');
  return res.json();
}

export async function fetchRedistributionRecommendations(city = '') {
  const url = city ? `${BASE_URL}/redistribution/recommendations?city=${encodeURIComponent(city)}` : `${BASE_URL}/redistribution/recommendations`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch redistribution recommendations');
  return res.json();
}

export async function executeRedistributionTransfer(transferData) {
  const res = await fetch(`${BASE_URL}/redistribution/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transferData)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to execute transfer');
  }
  return res.json();
}
