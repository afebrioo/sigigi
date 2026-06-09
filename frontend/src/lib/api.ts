// src/lib/api.ts
export const getDefaultHeaders = (contentType = true) => {
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  }

  if (contentType) {
    headers['Content-Type'] = 'application/json'
  }

  const isPortal = window.location.pathname.startsWith('/portal');
  const token = isPortal ? localStorage.getItem('portal_token') : localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// Base URL sesuai dengan struktur project PHP kita
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getCleanImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  
  // Robustly extract the relative storage path if it exists
  const storageIndex = url.indexOf('/storage/');
  if (storageIndex !== -1) {
    const relativePath = url.substring(storageIndex);
    // Combine API_BASE_URL with the relative path, ensuring no double slashes
    return `${API_BASE_URL.replace(/\/$/, '')}${relativePath}`;
  }
  
  // Fallback if it's already a relative path or doesn't have /storage/
  if (url.startsWith('/')) {
    return `${API_BASE_URL.replace(/\/$/, '')}${url}`;
  }
  
  return url;
};

export const api = {
  auth: {
    login: `${API_BASE_URL}/api/login`,
    logout: `${API_BASE_URL}/api/logout`,
    me: `${API_BASE_URL}/api/user`,
  },
  master: {
    // Endpoint yang sudah ada
    penyakit: `${API_BASE_URL}/api/master-kode-penyakit`,
    obat: `${API_BASE_URL}/api/master-obat`,
    tindakan: `${API_BASE_URL}/api/master-tindakan`,
    hargaObat: `${API_BASE_URL}/api/master-harga-obat`,
    hargaTindakan: `${API_BASE_URL}/api/master-harga-tindakan`,

    // Alias untuk konsistensi dengan tindakan-medis.ts
    diseases: `${API_BASE_URL}/api/master-kode-penyakit`,
    drugs: `${API_BASE_URL}/api/master-obat`,
    treatments: `${API_BASE_URL}/api/master-tindakan`,
    drugPrices: `${API_BASE_URL}/api/master-harga-obat`,
    treatmentPrices: `${API_BASE_URL}/api/master-harga-tindakan`,
    users: `${API_BASE_URL}/api/users`,
  },
  odontogram: `${API_BASE_URL}/api/tindakan-odontogram`,
  dashboard: {
    all: `${API_BASE_URL}/api/dashboard/all`,
    summary: `${API_BASE_URL}/api/dashboard/summary`,
    todaySchedule: `${API_BASE_URL}/api/dashboard/today-schedule`,
    popularTreatments: `${API_BASE_URL}/api/dashboard/popular-treatments`,
    charts: `${API_BASE_URL}/api/dashboard/charts`,
  },
  klinik: `${API_BASE_URL}/api/klinik`,
  dokter: `${API_BASE_URL}/api/dokter`,
  dokterKlinik: `${API_BASE_URL}/api/dokter-klinik`,
  pasien: `${API_BASE_URL}/api/pasien`,
  tindakan: {
    rekamMedis: `${API_BASE_URL}/api/tindakan-rekam-medis`,
    resep: `${API_BASE_URL}/api/tindakan-resep`,
    odontogram: `${API_BASE_URL}/api/tindakan-odontogram`,
  },
  portal: {
    login: `${API_BASE_URL}/api/portal/login`,
    register: `${API_BASE_URL}/api/portal/register`,
    forgotPassword: `${API_BASE_URL}/api/portal/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/portal/reset-password`,
    googleLogin: `${API_BASE_URL}/api/portal/google-login`,
    googleRegister: `${API_BASE_URL}/api/portal/google-register`,
    profile: `${API_BASE_URL}/api/portal/profile`,
  },
  appointments: `${API_BASE_URL}/api/appointments`,
  queueToday: `${API_BASE_URL}/api/queue/today`,
  analyzeAppointment: (id: number | string) => `${API_BASE_URL}/api/appointments/${id}/analyze`,
  finalizeAppointment: (id: number | string) => `${API_BASE_URL}/api/appointments/${id}/finalize`,
  upload: `${API_BASE_URL}/api/upload`,

  // Alias untuk konsistensi dengan tindakan-medis.ts
  medicalRecords: `${API_BASE_URL}/api/tindakan-rekam-medis`,
  patients: `${API_BASE_URL}/api/pasien`,
};