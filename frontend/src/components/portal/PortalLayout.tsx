import React, { ReactNode, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface PortalLayoutProps {
  children: ReactNode;
  role?: 'patient' | 'doctor';
  dark?: boolean;
}

const PortalLayout: React.FC<PortalLayoutProps> = ({ children, role, dark = false }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('portal_isAuthenticated') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('portal_isAuthenticated');
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    navigate('/portal/login');
  };

  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'bg-[#030712] text-white' : 'bg-slate-50/20'} relative font-sans transition-colors duration-300`}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-blue-900/90 via-indigo-800/90 to-purple-900/90 px-6 py-3.5 flex items-center justify-between border-b border-indigo-900/40 shadow-lg transition-all duration-300">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-8">
          {/* Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {role !== 'doctor' && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-blue-100 md:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                )}
              </button>
            )}
            
            <div
              className="flex items-center gap-2 cursor-pointer animate-fade-in"
              onClick={() => navigate(role === 'doctor' ? '/doctor/pemeriksaan' : '/portal/patient-dashboard')}
            >
              <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center text-[10px] font-extrabold text-center leading-tight text-blue-600 border border-blue-100 shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300">
                SIGIGI
              </div>
            </div>
          </div>
 
          {/* Navigation Links */}
          <nav className="flex items-center gap-2">
            {role !== 'doctor' ? (
              <>
                <Link to="/portal/patient-dashboard" className="text-white/90 font-bold text-sm px-4 py-2 rounded-2xl hover:bg-white/10 hover:text-white transition-all duration-300 hidden md:block">
                  Home
                </Link>
                <Link to="/portal/appointments" className="text-white/90 font-bold text-sm px-4 py-2 rounded-2xl hover:bg-white/10 hover:text-white transition-all duration-300 hidden md:block">
                  Appointment
                </Link>
                <Link to="/portal/queue" className="text-white/90 font-bold text-sm px-4 py-2 rounded-2xl hover:bg-white/10 hover:text-white transition-all duration-300 hidden md:block">
                  Antrian
                </Link>
                <Link to="/portal/history" className="text-white/90 font-bold text-sm px-4 py-2 rounded-2xl hover:bg-white/10 hover:text-white transition-all duration-300 hidden md:block">
                  Rekam Medis
                </Link>
              </>
            ) : (
              <span className="text-white font-extrabold text-lg tracking-tight ml-2">Klinik SIGIGI</span>
            )}
          </nav>
        </div>
 
        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* WhatsApp Customer Service */}
          {role !== 'doctor' && (
            <>
              <a
                href="https://wa.me/6287838590000?text=Halo%20Admin%20SIGIGI%2C%20saya%20butuh%20bantuan%20terkait%20layanan%20klinik%20SIGIGI."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/95 font-bold text-sm px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300 group shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-whatsapp transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 text-emerald-400 group-hover:text-emerald-350" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.69-4.98c-.204-.104-1.207-.596-1.393-.665-.186-.069-.32-.104-.455.098-.134.202-.519.665-.636.8-.117.135-.234.15-.438.048-.203-.104-.858-.316-1.634-1.006-.604-.539-1.012-1.207-1.13-1.412-.117-.203-.012-.313.09-.415.09-.092.204-.235.306-.353.102-.117.137-.202.204-.338.069-.136.035-.254-.017-.359-.052-.104-.455-1.096-.624-1.502-.164-.398-.331-.344-.455-.35-.117-.006-.254-.007-.39-.007-.136 0-.356.05-.542.254-.187.203-.712.696-.712 1.7 0 1.004.73 1.974.832 2.107.102.135 1.436 2.193 3.479 3.072.487.21 8.67.367 1.187.49.522.123 1.007.098 1.386.04.422-.063 1.207-.492 1.378-.944.171-.452.171-.84.12-.92-.051-.08-.186-.123-.39-.227z"/>
                </svg>
                <span className="hidden sm:inline">Hubungi CS</span>
              </a>
              <div className="h-5 w-px bg-white/20"></div>
            </>
          )}
 
          {/* Auth Section */}
          {!isAuthenticated ? (
            <button
              onClick={() => navigate('/portal/login')}
              className="bg-white text-blue-600 px-6 py-2 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-all shadow-md active:scale-98"
            >
              Login
            </button>
          ) : (
            /* User Profile Dropdown */
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/25 hover:shadow-lg transition-all duration-300 focus:outline-none"
              >
                <div className="bg-white rounded-full p-1.5 shadow-inner flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span className="text-white font-bold text-sm">{role === 'doctor' ? 'Dokter' : 'Profil'}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-white/80 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
 
              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
 
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-blue-50 py-2 z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        navigate('/portal/profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-blue-900 font-bold hover:bg-blue-50 flex items-center gap-3 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      Profil Saya
                    </button>
                    <div className="h-px bg-blue-50 mx-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-600 font-bold hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {/* Mobile Drawer Menu */}
        {role !== 'doctor' && isMobileMenuOpen && (
          <div className="md:hidden backdrop-blur-xl bg-blue-900/95 border-b border-indigo-500/20 shadow-2xl rounded-b-[2rem] px-6 py-6 space-y-2 absolute top-full left-0 w-full z-50 animate-fade-in-slide-down">
            <Link
              to="/portal/patient-dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 text-white font-bold hover:bg-white/10 p-3 rounded-2xl transition-all duration-300 group"
            >
              <div className="bg-white/10 rounded-xl p-2 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <span className="tracking-wide">Home</span>
            </Link>
            <Link
              to="/portal/appointments"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 text-white font-bold hover:bg-white/10 p-3 rounded-2xl transition-all duration-300 group"
            >
              <div className="bg-white/10 rounded-xl p-2 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <span className="tracking-wide">Appointment</span>
            </Link>
            <Link
              to="/portal/queue"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 text-white font-bold hover:bg-white/10 p-3 rounded-2xl transition-all duration-300 group"
            >
              <div className="bg-white/10 rounded-xl p-2 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span className="tracking-wide">Antrian</span>
            </Link>
            <Link
              to="/portal/history"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 text-white font-bold hover:bg-white/10 p-3 rounded-2xl transition-all duration-300 group"
            >
              <div className="bg-white/10 rounded-xl p-2 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <span className="tracking-wide">Rekam Medis</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10 p-6 pb-16 overflow-x-hidden">
        {children}
      </main>

      {/* Footer (Kivwear-inspired premium dark footer) */}
      <footer className="bg-slate-950 border-t border-slate-900 py-16 px-8 mt-auto shadow-2xl relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-blue-500/10">
                  SG
                </div>
                <span className="text-white font-black text-lg tracking-wider uppercase italic">
                  SIGIGI<span className="text-blue-500 font-extrabold not-italic">.</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-sm">
                Sistem Manajemen Praktek Mandiri & Layanan Portal Pasien Terintegrasi. Mengutamakan transparansi antrian aktif dan digitalisasi rekam medis secara instan dan aman.
              </p>
            </div>

            {/* Column 2: Navigasi */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Navigasi</h4>
              <ul className="space-y-2.5 text-xs font-bold">
                <li>
                  <Link to="/portal/patient-dashboard" className="text-slate-400 hover:text-white transition-colors duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/portal/appointments" className="text-slate-400 hover:text-white transition-colors duration-200">
                    Appointment
                  </Link>
                </li>
                <li>
                  <Link to="/portal/queue" className="text-slate-400 hover:text-white transition-colors duration-200">
                    Antrian Klinik
                  </Link>
                </li>
                <li>
                  <Link to="/portal/history" className="text-slate-400 hover:text-white transition-colors duration-200">
                    Rekam Medis
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Cabang */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cabang</h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-400">
                <li className="hover:text-white transition-colors duration-200 cursor-default">
                  SIGIGI Cibadak
                </li>
                <li className="hover:text-white transition-colors duration-200 cursor-default">
                  SIGIGI Lembang
                </li>
              </ul>
            </div>

          </div>

          {/* Huge Bottom Text (Kivwear Streetwear Branding Accent) */}
          <div className="border-t border-slate-900 pt-12 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright & University */}
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              &copy; 2026 SIGIGI &mdash; TELKOM UNIVERSITY. ALL RIGHTS RESERVED.
            </div>
            
            {/* Design Attribution or tag */}
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 select-none">
              DESIGNED FOR COMFORT & CLARITY
            </div>
          </div>

          {/* Giant Wordmark */}
          <div className="text-[6vw] font-black tracking-[0.2em] text-slate-900/30 uppercase select-none leading-none text-center pt-8 mt-8 border-t border-slate-900/50">
            SIGIGI
          </div>

        </div>
      </footer>
    </div>
  );
};

export default PortalLayout;
