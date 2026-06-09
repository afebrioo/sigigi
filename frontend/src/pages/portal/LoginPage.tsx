import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';

export const checkProfileCompleteness = (user: any): boolean => {
  if (!user) return false;
  const bio = user.biodata;
  if (!bio) return false;

  const isPhoneValid = user.phone_number && user.phone_number.trim() !== '' && user.phone_number !== '1' && user.phone_number !== '-';
  const isNikValid = bio.nik && bio.nik.trim() !== '' && bio.nik !== '1' && bio.nik !== '-';
  const isTempatLahirValid = bio.tempat_lahir && bio.tempat_lahir.trim() !== '' && bio.tempat_lahir !== '1' && bio.tempat_lahir !== '-';
  const isTanggalLahirValid = bio.tanggal_lahir && bio.tanggal_lahir !== '';
  const isJenisKelaminValid = bio.jenis_kelamin === 'L' || bio.jenis_kelamin === 'P';
  const isAlamatValid = bio.alamat && bio.alamat.trim() !== '' && bio.alamat !== '1' && bio.alamat !== '-';

  return !!(isPhoneValid && isNikValid && isTempatLahirValid && isTanggalLahirValid && isJenisKelaminValid && isAlamatValid);
};

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLoginSuccess = async (response: any) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(api.portal.googleLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({
          credential: response.credential
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Login Google gagal.');
      }

      const isPortal = window.location.pathname.startsWith('/portal');

      if (result.success) {
        if (result.registered) {
          const userRole = result.user.role;
          if (userRole === 'patient') {
            if (!isPortal) {
              setErrorMsg("Akses ditolak. Akun Google Anda terdaftar sebagai pasien. Silakan login di portal pasien.");
              setIsLoading(false);
              return;
            }
            if (result.token) localStorage.setItem("portal_token", result.token);
            localStorage.setItem("portal_isAuthenticated", "true");
            localStorage.setItem("portal_user", JSON.stringify(result.user));
            if (checkProfileCompleteness(result.user)) {
              navigate('/portal/patient-dashboard');
            } else {
              navigate('/portal/profile', { state: { showIncompleteWarning: true } });
            }
          } else if (userRole === 'admin' || userRole === 'doctor') {
            if (isPortal) {
              setErrorMsg("Akses ditolak. Silakan gunakan halaman login khusus staf.");
              setIsLoading(false);
              return;
            }
            if (result.token) localStorage.setItem("token", result.token);
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("user", JSON.stringify(result.user));
            navigate('/dashboard');
          } else {
            setErrorMsg("Akses ditolak. Role tidak dikenal.");
          }
        } else {
          // Redirect to complete registration page with Google data passed in state
          navigate('/portal/google-complete-register', {
            state: {
              email: result.google_data.email,
              name: result.google_data.name,
              google_id: result.google_data.google_id
            }
          });
        }
      } else {
        setErrorMsg(result.message || "Gagal melakukan autentikasi Google");
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login via Google.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isPortal = window.location.pathname.startsWith('/portal');
    if (!isPortal) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      const google = (window as any).google;
      if (google) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '500732389360-15s1q147p42k5q4o9qf963a863gspq6b.apps.googleusercontent.com', // Dynamic Google Client ID from .env with demo fallback
          callback: handleGoogleLoginSuccess
        });

        google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          {
            theme: 'outline',
            size: 'large',
            width: window.innerWidth < 440 ? Math.min(window.innerWidth - 64, 380) : 380,
            shape: 'pill',
            logo_alignment: 'left'
          }
        );
      }
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) { }
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(api.portal.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({
          login: email,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Login gagal.');
      }

      const isPortal = window.location.pathname.startsWith('/portal');

      if (result && result.success) {
        const userRole = result.user.role;
        if (userRole === 'patient') {
          if (!isPortal) {
            setErrorMsg("Akses ditolak. Halaman ini khusus untuk staf klinik.");
            setIsLoading(false);
            return;
          }
          if (result.token) localStorage.setItem("portal_token", result.token);
          localStorage.setItem("portal_isAuthenticated", "true");
          localStorage.setItem("portal_user", JSON.stringify(result.user));
          if (checkProfileCompleteness(result.user)) {
            navigate('/portal/patient-dashboard');
          } else {
            navigate('/portal/profile', { state: { showIncompleteWarning: true } });
          }
        } else if (userRole === 'admin' || userRole === 'doctor') {
          if (isPortal) {
            setErrorMsg("Akses ditolak. Silakan gunakan halaman login khusus staf.");
            setIsLoading(false);
            return;
          }
          if (result.token) localStorage.setItem("token", result.token);
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("user", JSON.stringify(result.user));
          navigate('/dashboard');
        } else {
          setErrorMsg("Akses ditolak. Role tidak dikenal.");
        }
      } else {
        setErrorMsg(result?.message || "Email atau password salah");
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Login gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-center leading-tight text-white mb-4 border-4 border-blue-100 shadow-md">
              SIGIGI
            </div>
            <h1 className="text-2xl font-bold text-blue-700 uppercase tracking-tighter italic">
              {window.location.pathname.startsWith('/portal') ? 'Masuk ke SIGIGI' : 'SIGIGI Staf Portal'}
            </h1>
            <p className="text-blue-400 text-sm font-medium mt-1">
              {window.location.pathname.startsWith('/portal') ? 'Masuk ke akun anda' : 'Masuk sebagai Staf Klinik'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl font-bold text-center text-sm bg-red-50 text-red-600 border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-blue-900 ml-1 uppercase italic tracking-widest text-[10px]">Username / Email</label>
              <input
                type="text"
                placeholder="Username atau Email"
                className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-blue-900 ml-1 uppercase italic tracking-widest text-[10px]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/portal/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                Lupa Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 transform hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </form>

          {window.location.pathname.startsWith('/portal') && (
            <>
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-blue-50"></div>
                </div>
                <span className="relative px-4 bg-white text-xs font-black uppercase text-blue-300 tracking-widest italic">ATAU MASUK DENGAN</span>
              </div>

              <div className="flex justify-center mb-6">
                <div id="google-signin-btn" className="w-full flex justify-center hover:scale-[1.01] transition-transform"></div>
              </div>

              <div className="mt-8 text-center space-y-3">
                <p className="text-blue-300 font-bold italic text-sm">
                  Belum punya akun?{' '}
                  <Link to="/portal/register" className="text-blue-500 hover:text-blue-700 hover:underline">
                    Daftar
                  </Link>
                </p>
                <div>
                  <Link to="/auth/login" className="text-xs text-slate-400 hover:text-slate-600 hover:underline font-medium">
                    Masuk sebagai Staf Klinik
                  </Link>
                </div>
              </div>
            </>
          )}

          {!window.location.pathname.startsWith('/portal') && (
            <div className="mt-6 text-center">
              <Link to="/portal/login" className="text-xs text-slate-400 hover:text-slate-600 hover:underline font-medium">
                Masuk sebagai Pasien
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
