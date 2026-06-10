// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'

// Admin Pages

import DashboardPage from '@/pages/dashboard/DashboardPage'
import KlinikPage from '@/pages/klinik/KlinikPage'
import DokterPage from '@/pages/dokter/DokterPage'
import PasienPage from '@/pages/pasien/PasienPage'
import TindakanPage from '@/pages/tindakan/TindakanPage'
import PenggunaPage from '@/pages/pengguna/PenggunaPage'

// Master Pages
import ObatPage from '@/pages/master/obat/ObatPage'
import TindakanMasterPage from '@/pages/master/tindakan/TindakanPage'
import PenyakitPage from '@/pages/master/penyakit/PenyakitPage'
import HargaObatPage from '@/pages/master/harga-obat/HargaObatPage'
import HargaTindakanPage from '@/pages/master/harga-tindakan/HargaTindakanPage'
import DokterKlinikPage from './pages/dokter-klinik/DokterKlinikPage'

// =============================================
// Portal Pages (Migrated from Sigigi 2.0)
// =============================================
import PortalLoginPage from '@/pages/portal/LoginPage'
import PortalRegisterPage from '@/pages/portal/RegisterPage'
import GoogleCompleteRegisterPage from '@/pages/portal/GoogleCompleteRegisterPage'

// Portal - Patient Pages
import PatientDashboard from '@/pages/portal/patient/PatientDashboard'
import PatientAppointments from '@/pages/portal/patient/PatientAppointments'
import NewAppointmentPage from '@/pages/portal/patient/NewAppointmentPage'
import AppointmentQuestionnairePage from '@/pages/portal/patient/AppointmentQuestionnairePage'
import PatientHistory from '@/pages/portal/patient/PatientHistory'
import QueuePage from '@/pages/portal/patient/QueuePage'

// Portal - Doctor Pages
import DoctorAppointments from '@/pages/portal/doctor/DoctorAppointments'
import DoctorPatientDetail from '@/pages/portal/doctor/DoctorPatientDetail'
import DoctorNewAppointment from '@/pages/portal/doctor/DoctorNewAppointment'

// Portal - Shared Pages
import PortalProfilePage from '@/pages/portal/shared/ProfilePage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/portal/patient-dashboard" replace />} />
          <Route path="/auth/login" element={<PortalLoginPage />} />

          {/* Protected Routes - Admin */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/klinik" element={<KlinikPage />} />
            <Route path="/dokter-klinik" element={<DokterKlinikPage />} />
            <Route path="/dokter" element={<DokterPage />} />
            <Route path="/pasien" element={<PasienPage />} />
            <Route path="/tindakan/*" element={<TindakanPage />} />
            <Route path="/pengguna" element={<PenggunaPage />} />

            {/* Master Routes */}
            <Route path="/master/obat" element={<ObatPage />} />
            <Route path="/master/tindakan" element={<TindakanMasterPage />} />
            <Route path="/master/penyakit" element={<PenyakitPage />} />
            <Route path="/master/harga-obat" element={<HargaObatPage />} />
            <Route path="/master/harga-tindakan" element={<HargaTindakanPage />} />

            {/* Catch all route - Admin */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            {/* Doctor Routes (Moved from Portal) */}
            <Route path="/doctor/pemeriksaan" element={<DoctorAppointments />} />
            <Route path="/doctor/pemeriksaan/new" element={<DoctorNewAppointment />} />
            <Route path="/doctor/patient/:id" element={<DoctorPatientDetail />} />
          </Route>

          {/* ============================================= */}
          {/* Portal Routes - Public (Sigigi 2.0 Features) */}
          {/* ============================================= */}

          {/* Auth Portal */}
          <Route path="/portal/login" element={<PortalLoginPage />} />
          <Route path="/portal/register" element={<PortalRegisterPage />} />
          <Route path="/portal/google-complete-register" element={<GoogleCompleteRegisterPage />} />

          {/* Patient Portal Routes */}
          <Route path="/portal/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/portal/appointments" element={<PatientAppointments />} />
          <Route path="/portal/appointments/new" element={<NewAppointmentPage />} />
          <Route path="/portal/appointments/questionnaire" element={<AppointmentQuestionnairePage />} />
          <Route path="/portal/history" element={<PatientHistory />} />
          <Route path="/portal/queue" element={<QueuePage />} />
          <Route path="/portal/profile" element={<PortalProfilePage />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App