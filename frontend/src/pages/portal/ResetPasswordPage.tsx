import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';

export default function PortalResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const e = searchParams.get('email');
    const t = searchParams.get('token');
    
    if (e) setEmail(e);
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(api.portal.resetPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, token, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengubah password.');
      }

      setMessage({ type: 'success', text: result.message || 'Password berhasil diubah!' });
      
      setTimeout(() => {
        navigate('/portal/login');
      }, 3000);
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 border-2 border-white">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-[14px] font-black text-center leading-tight text-white border-4 border-blue-50 shadow-xl mb-6">
            SIGIGI
          </div>
          <h1 className="text-3xl font-black text-blue-900 italic tracking-tight">Ubah Kata Sandi</h1>
          <p className="text-blue-600 font-bold italic text-sm mt-2 text-center">Masukkan kata sandi baru Anda.</p>
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-2xl font-bold text-center text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" value={email} />
          <input type="hidden" value={token} />

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Password Baru</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
              placeholder="Masukkan ulang password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all transform hover:translate-y-[-2px] uppercase tracking-widest mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Memproses...' : 'Simpan Password'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link to="/portal/login" className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-bold italic text-sm transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
