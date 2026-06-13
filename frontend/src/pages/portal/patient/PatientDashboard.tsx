import { useState, useEffect } from 'react';
import PortalLayout from '@/components/portal/PortalLayout';
import { useNavigate, Link } from 'react-router-dom';
import { checkProfileCompleteness } from '../LoginPage';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isComplete, setIsComplete] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<'cibadak' | 'lembang'>('cibadak');

  useEffect(() => {
    const isAuth = localStorage.getItem('portal_isAuthenticated') === 'true';
    setIsAuthenticated(isAuth);

    const userStr = localStorage.getItem('portal_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsComplete(checkProfileCompleteness(user));
      } catch (e) {
        setIsComplete(false);
      }
    } else {
      setIsComplete(false);
    }
  }, []);

  const handleProtectedAction = (path: string) => {
    const isAuth = localStorage.getItem('portal_isAuthenticated') === 'true';
    if (isAuth) {
      if (path === '/portal/appointments/new' && !isComplete) {
        navigate('/portal/profile', { state: { showIncompleteWarning: true } });
        return;
      }
      navigate(path);
    } else {
      navigate('/portal/login');
    }
  };

  return (
    <PortalLayout role="patient">
      {/* Background Ornaments */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute top-[500px] right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[1100px] left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Floating 3D Cartoon Teeth (Decentralized background decorations) */}
      <div className="absolute top-[12%] left-[8%] w-24 h-24 sm:w-32 sm:h-32 pointer-events-none opacity-[0.65] z-10 animate-float-gentle">
        <img src="/tooth_happy.png?v=2" alt="Happy Tooth Mascot" className="w-full h-full object-contain filter drop-shadow-md" />
      </div>
      <div className="absolute top-[18%] right-[8%] w-24 h-24 sm:w-32 sm:h-32 pointer-events-none opacity-[0.65] z-10 animate-float-reverse">
        <img src="/tooth_sparkle.png?v=2" alt="Sparkling Tooth Mascot" className="w-full h-full object-contain filter drop-shadow-md" />
      </div>
      <div className="absolute top-[48%] left-[4%] w-20 h-20 sm:w-28 sm:h-28 pointer-events-none opacity-[0.6] z-10 animate-float-slow hidden md:block">
        <img src="/tooth_cool.png?v=2" alt="Cool Tooth Mascot" className="w-full h-full object-contain filter drop-shadow-md" />
      </div>
      <div className="absolute top-[72%] right-[5%] w-24 h-24 sm:w-32 sm:h-32 pointer-events-none opacity-[0.65] z-10 animate-float-gentle hidden lg:block">
        <img src="/tooth_happy.png?v=2" alt="Happy Tooth Mascot" className="w-full h-full object-contain filter drop-shadow-md" />
      </div>
      <div className="absolute top-[88%] left-[6%] w-24 h-24 sm:w-32 sm:h-32 pointer-events-none opacity-[0.65] z-10 animate-float-reverse">
        <img src="/tooth_sparkle.png?v=2" alt="Sparkling Tooth Mascot" className="w-full h-full object-contain filter drop-shadow-md" />
      </div>

      {/* Decorative dot matrix grids on the sides */}
      <div className="absolute left-6 top-[35%] w-24 h-24 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:12px_12px] opacity-35 pointer-events-none z-0 hidden xl:block"></div>
      <div className="absolute right-6 top-[65%] w-24 h-24 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:12px_12px] opacity-35 pointer-events-none z-0 hidden xl:block"></div>

      {/* Left Side Fixed Accent Rail */}
      <div className="fixed left-4 top-1/3 z-20 hidden xl:flex flex-col items-center gap-6 pointer-events-none opacity-30 select-none">
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 rotate-90 my-8 whitespace-nowrap leading-none">
          SIGIGI CARE • SERVICES
        </span>
        <div className="w-2 h-2 rounded-full border border-blue-500/50 bg-blue-50/50 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
        </div>
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-indigo-500 to-transparent"></div>
      </div>

      {/* Right Side Fixed Accent Rail */}
      <div className="fixed right-4 top-1/3 z-20 hidden xl:flex flex-col items-center gap-6 pointer-events-none opacity-30 select-none">
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-purple-500 to-transparent"></div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 -rotate-90 my-8 whitespace-nowrap leading-none">
          EXCELLENCE • DENTAL CARE
        </span>
        <div className="w-2 h-2 rounded-full border border-purple-500/50 bg-purple-50/50 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
        </div>
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-pink-500 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
        {!isAuthenticated && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center gap-4 text-amber-900 shadow-lg shadow-amber-100/50 animate-pulse">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="font-black uppercase text-xs tracking-wider italic text-amber-900">Peringatan: Anda Belum Login!</h4>
              <p className="text-sm font-bold opacity-90">Silakan login terlebih dahulu untuk membuat janji temu baru.</p>
            </div>
            <Link to="/portal/login" className="bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-3 rounded-xl shadow transition-all transform active:scale-95 uppercase tracking-widest text-xs flex-shrink-0">
              Login Sekarang
            </Link>
          </div>
        )}

        {isAuthenticated && !isComplete && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center gap-4 text-amber-900 shadow-lg shadow-amber-100/50 animate-pulse">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="font-black uppercase text-xs tracking-wider italic text-amber-900">Peringatan: Profil Belum Lengkap!</h4>
              <p className="text-sm font-bold opacity-90">Silakan lengkapi data diri Anda (Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Alamat, dan Nomor HP) untuk dapat melakukan pendaftaran appointment baru.</p>
            </div>
            <Link to="/portal/profile" state={{ showIncompleteWarning: true }} className="bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-3 rounded-xl shadow transition-all transform active:scale-95 uppercase tracking-widest text-xs flex-shrink-0">
              Lengkapi Sekarang
            </Link>
          </div>
        )}
      </div>

      {/* Page Header */}
      <div className="text-center mt-20 mb-36 px-6 relative z-10 animate-fade-in max-w-5xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-100 bg-blue-50/50 text-blue-600 text-xs font-bold tracking-wide backdrop-blur-md shadow-sm hover:border-blue-200 transition-colors duration-300">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            SIGIGI • Aplikasi Klinik Gigi Mandiri
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none uppercase italic mb-8">
          <span className="text-blue-950 block mb-3">Portal Layanan Pasien</span>
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent text-2xl sm:text-3xl md:text-4xl lg:text-5xl block font-extrabold tracking-normal normal-case not-italic">
            Solusi Modern Perawatan & Kesehatan Gigi
          </span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 font-semibold max-w-3xl mx-auto leading-relaxed">
          Akses pendaftaran janji temu, pantau antrian klinik secara real-time, dan lihat riwayat rekam medis Anda dalam satu platform terintegrasi secara mudah.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 pt-6 px-6 pb-16 max-w-6xl mx-auto w-full relative z-10">
        {/* Reservation Card */}
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/60 p-10 flex flex-col items-center text-center border border-slate-100 hover:border-blue-500 hover:shadow-blue-100/40 transform hover:translate-y-[-8px] transition-all duration-300 relative group mx-auto overflow-hidden animate-fade-in animation-delay-100">
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-[2rem] mb-6 shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-95">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-blue-950 mb-2 tracking-tight italic uppercase group-hover:text-blue-600 transition-colors">Appointment</h2>
          <p className="text-slate-400 font-bold mb-8 italic text-xs leading-relaxed">Buat janji temu dengan dokter kami secara instan</p>
          <button
            onClick={() => handleProtectedAction('/portal/appointments/new')}
            className="w-full mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-blue-100 hover:shadow-blue-200/50 transition-all transform hover:scale-[1.02] active:scale-98 uppercase tracking-widest text-xs"
          >
            Buat Janji Temu
          </button>
        </div>

        {/* View Queue Card */}
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/60 p-10 flex flex-col items-center text-center border border-slate-100 hover:border-blue-500 hover:shadow-blue-100/40 transform hover:translate-y-[-8px] transition-all duration-300 relative group mx-auto overflow-hidden animate-fade-in animation-delay-200">
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-[2rem] mb-6 shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-95">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-blue-950 mb-2 tracking-tight italic uppercase group-hover:text-blue-600 transition-colors">Antrian</h2>
          <p className="text-slate-400 font-bold mb-8 italic text-xs leading-relaxed">Cek status antrian klinik hari ini</p>
          <button
            onClick={() => navigate('/portal/queue')}
            className="w-full mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-blue-100 hover:shadow-blue-200/50 transition-all transform hover:scale-[1.02] active:scale-98 uppercase tracking-widest text-xs"
          >
            Lihat Antrian
          </button>
        </div>

        {/* Medical Record Card */}
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/60 p-10 flex flex-col items-center text-center border border-slate-100 hover:border-blue-500 hover:shadow-blue-100/40 transform hover:translate-y-[-8px] transition-all duration-300 relative group mx-auto overflow-hidden animate-fade-in animation-delay-300">
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-[2rem] mb-6 shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-95">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-blue-950 mb-2 tracking-tight italic uppercase group-hover:text-blue-600 transition-colors">Rekam Medis</h2>
          <p className="text-slate-400 font-bold mb-8 italic text-xs leading-relaxed">Lihat riwayat perawatan dan kesehatan gigi Anda</p>
          <button
            onClick={() => handleProtectedAction('/portal/history')}
            className="w-full mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-blue-100 hover:shadow-blue-200/50 transition-all transform hover:scale-[1.02] active:scale-98 uppercase tracking-widest text-xs"
          >
            Buka Riwayat
          </button>
        </div>
      </div>

      {/* Interactive Journey Steps */}
      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">Alur Layanan</h2>
          <h3 className="text-3xl font-black text-blue-950 uppercase italic tracking-tight">3 Langkah Mudah Berobat</h3>
          <p className="text-slate-500 font-bold mt-2 max-w-xl mx-auto text-sm">
            Kami mempermudah proses kunjungan medis Anda agar lebih nyaman, transparan, dan teratur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 -translate-y-1/2 z-0 hidden md:block"></div>

          {/* Step 1 */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-8 relative z-10 shadow-lg shadow-slate-100/40 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 group flex flex-col justify-between animate-fade-in animation-delay-100">
            <div>
              <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                01
              </div>
              <h4 className="text-lg font-black text-blue-950 uppercase italic tracking-tight mb-2">Daftar & Pilih Jadwal</h4>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Tentukan dokter pilihan dan jam kedatangan Anda. Lengkapi biodata medis singkat dari mana saja secara online.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-8 relative z-10 shadow-lg shadow-slate-100/40 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 group flex flex-col justify-between animate-fade-in animation-delay-200">
            <div>
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                02
              </div>
              <h4 className="text-lg font-black text-blue-950 uppercase italic tracking-tight mb-2">Pantau Antrian</h4>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Tidak perlu menunggu lama di klinik. Cek antrian aktif di dashboard secara langsung sebelum Anda berangkat.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-8 relative z-10 shadow-lg shadow-slate-100/40 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 group flex flex-col justify-between animate-fade-in animation-delay-300">
            <div>
              <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xl mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                03
              </div>
              <h4 className="text-lg font-black text-blue-950 uppercase italic tracking-tight mb-2">Pemeriksaan & Resep</h4>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Dapatkan perawatan terbaik dari tim medis kami. Seluruh resep obat & diagnosis dicatat otomatis di rekam medis digital Anda.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic Location Section */}
      <div className="max-w-5xl mx-auto px-6 pb-20 relative z-10 animate-fade-in">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/60 p-8 md:p-12 flex flex-col md:flex-row gap-10 items-stretch">
          {/* Location Info */}
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-100 bg-blue-50/50 text-blue-600 text-xs font-bold tracking-wide">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  Lokasi Klinik
                </div>
              </div>

              {/* Branch Selector Tabs */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mb-6">
                <button
                  onClick={() => setSelectedBranch('cibadak')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    selectedBranch === 'cibadak'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cabang Cibadak
                </button>
                <button
                  onClick={() => setSelectedBranch('lembang')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    selectedBranch === 'lembang'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cabang Lembang
                </button>
              </div>

              {selectedBranch === 'cibadak' ? (
                <>
                  <h3 className="text-2xl font-black text-blue-950 tracking-tight italic uppercase mb-2">Praktek drg. Marlin Himawati, Sp.Ort (Cibadak)</h3>
                  <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                    Jl. Cibadak No. 194, Cibadak, Kec. Astanaanyar, Kota Bandung, Jawa Barat 40241
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-blue-950 tracking-tight italic uppercase mb-2">Praktek drg. Marlin Himawati, Sp.Ort (Lembang)</h3>
                  <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                    Jl. Grand Hotel No. 70, Lembang, Kec. Lembang, Kabupaten Bandung Barat, Jawa Barat 40391
                  </p>
                </>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Jam Operasional</h4>
                  {selectedBranch === 'cibadak' ? (
                    <>
                      <p className="text-sm font-black text-slate-700 italic">Senin - Kamis: 16.00 - 20.00 WIB</p>
                      <p className="text-sm font-black text-slate-700 italic">Sabtu: 16.00 - 18.00 WIB</p>
                    </>
                  ) : (
                    <p className="text-sm font-black text-slate-700 italic">Jumat: 16.00 - 20.00 WIB</p>
                  )}
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Minggu & Hari Libur Nasional: Tutup</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Kontak Klinik</h4>
                  <p className="text-sm font-black text-slate-700 italic">
                    WA:{' '}
                    <a
                      href="https://wa.me/6287838590000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      +62 878-3859-••••
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <a
              href={
                selectedBranch === 'cibadak'
                  ? 'https://maps.google.com/?q=Jl.+Cibadak+No.194,+Cibadak,+Kec.+Astanaanyar,+Kota+Bandung'
                  : 'https://maps.google.com/?q=Jl.+Grand+Hotel+No.70,+Lembang'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 px-6 rounded-xl shadow-md transition-all transform hover:scale-[1.02] active:scale-98 uppercase tracking-widest text-[10px] w-fit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
              Buka di Google Maps
            </a>
          </div>

          {/* Map Embed Container */}
          <div className="flex-1 h-[300px] md:h-auto min-h-[280px] rounded-3xl overflow-hidden border border-slate-100 shadow-inner relative z-10 group">
            {selectedBranch === 'cibadak' ? (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.8123282218776!2d107.5976527!3d-6.918991200000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e624f11f4cc5%3A0x6bcfd30e54d8f8a8!2sJl.%20Cibadak%20No.194%2C%20Cibadak%2C%20Kec.%20Astanaanyar%2C%20Kota%20Bandung%2C%20Jawa%20Barat%2040241!5e0!3m2!1sid!2sid!4v1717750100000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[20%] contrast-[110%] group-hover:scale-[1.01] transition-transform duration-500 h-full w-full"
              />
            ) : (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.3533816656717!2d107.616335!3d-6.8119864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e05c8cc087bd%3A0x868c2f1f0a8d6268!2sJl.%20Grand%20Hotel%20No.70%2C%20Lembang%2C%20Kec.%20Lembang%2C%20Kabupaten%20Bandung%20Barat%2C%20Jawa%20Barat%2040391!5e0!3m2!1sid!2sid!4v1717750200000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[20%] contrast-[110%] group-hover:scale-[1.01] transition-transform duration-500 h-full w-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tagline section below Google Maps */}
      <div className="max-w-4xl mx-auto px-6 pb-20 text-center relative z-10 animate-fade-in">
        <p className="text-base sm:text-lg text-slate-500 font-bold leading-relaxed max-w-3xl mx-auto border-t border-slate-100/80 pt-10">
          Kesehatan gigi Anda adalah prioritas utama kami. Kami menghadirkan kemudahan pelayanan melalui transparansi antrian aktif dan integrasi rekam medis digital yang instan dan aman.
        </p>
      </div>
    </PortalLayout>
  );
}
