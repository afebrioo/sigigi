import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';

export default function PortalForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(api.portal.forgotPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengirim instruksi.');
      }

      setMessage({ type: 'success', text: result.message || 'Instruksi pemulihan telah dikirim ke email Anda!' });
      
      // Auto-redirect if success, testing reset page flow (since no email service yet)
      if (result.dev_token) {
        setTimeout(() => {
          navigate(`/portal/reset-password?email=${encodeURIComponent(email)}&token=${result.dev_token}`);
        }, 2000);
      } else {
        setTimeout(() => navigate('/portal/login'), 3000);
      }
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
          <h1 className="text-3xl font-black text-blue-900 italic tracking-tight">Lupa Kata Sandi?</h1>
          <p className="text-blue-600 font-bold italic text-sm mt-2 text-center">Jangan khawatir! Masukkan email Anda untuk memulihkan akun.</p>
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-2xl font-bold text-center text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
              placeholder="email@contoh.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all transform hover:translate-y-[-2px] uppercase tracking-widest mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengirim...
              </>
            ) : (
              'Kirim Instruksi'
            )}
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
