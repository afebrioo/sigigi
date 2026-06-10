import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '@/lib/api';

export default function GoogleCompleteRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve google data passed via router state
  const googleData = location.state as { email?: string; name?: string; google_id?: string } | null;

  const [formData, setFormData] = useState({
    name: googleData?.name || '',
    email: googleData?.email || '',
    google_id: googleData?.google_id || '',
    phone: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    alamat: '',
    golonganDarah: '',
    kontakDaruratNama: '',
    kontakDaruratTelepon: '',
    kontakDaruratRelasi: '',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If no Google data is present, send back to login
  useEffect(() => {
    if (!googleData || !googleData.email || !googleData.google_id) {
      navigate('/portal/login');
    }
  }, [googleData, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Frontend Validation
    if (!formData.phone || !formData.tempatLahir || !formData.tanggalLahir || !formData.jenisKelamin || !formData.alamat) {
      setMessage({ type: 'error', text: 'Harap lengkapi seluruh data diri wajib!' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(api.portal.googleRegister, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.name,
          google_id: formData.google_id,
          phone: formData.phone,
          tempat_lahir: formData.tempatLahir,
          tanggal_lahir: formData.tanggalLahir,
          jenis_kelamin: formData.jenisKelamin,
          alamat: formData.alamat,
          golongan_darah: formData.golonganDarah,
          kontak_darurat_nama: formData.kontakDaruratNama,
          kontak_darurat_telepon: formData.kontakDaruratTelepon,
          kontak_darurat_relasi: formData.kontakDaruratRelasi
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Registrasi gagal.');
      }

      setMessage({ type: 'success', text: 'Registrasi Berhasil! Mengalihkan ke Dashboard...' });
      
      // Save session credentials
      if (result.token) localStorage.setItem("portal_token", result.token);
      localStorage.setItem("portal_isAuthenticated", "true");
      localStorage.setItem("portal_user", JSON.stringify(result.user));

      setTimeout(() => {
        navigate('/portal/patient-dashboard');
      }, 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan saat menyimpan data.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 border-2 border-white transition-all duration-300">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black text-center leading-tight text-white border-4 border-blue-50 shadow-xl mb-4 relative">
            SIGIGI
            <span className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
          </div>
          <h1 className="text-3xl font-black text-blue-900 italic tracking-tight uppercase">Lengkapi Data Diri</h1>
          <p className="text-blue-600 font-bold italic text-sm mt-1 text-center">Akun Google terverifikasi! Lengkapi profil medis Anda sekali saja.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl font-bold text-center text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Google Account (Locked) */}
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4">
            <div className="flex items-center gap-3 text-blue-800 font-black text-xs uppercase tracking-widest italic mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
              Akun Google Terverifikasi
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-400 ml-4 tracking-[0.2em] italic">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  disabled
                  value={formData.name}
                  className="w-full bg-blue-100/50 border-2 border-blue-100 rounded-2xl px-6 py-4 outline-none font-bold text-blue-900 shadow-inner cursor-not-allowed opacity-80"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-400 ml-4 tracking-[0.2em] italic">Alamat Email</label>
                <input
                  type="email"
                  name="email"
                  disabled
                  value={formData.email}
                  className="w-full bg-blue-100/50 border-2 border-blue-100 rounded-2xl px-6 py-4 outline-none font-bold text-blue-900 shadow-inner cursor-not-allowed opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Biodata Diri Pasien (Wajib) */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-blue-900 tracking-widest italic border-b-2 border-blue-50 pb-2">1. Biodata Utama (Wajib)</h3>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Nomor HP Aktif</label>
              <input
                type="text"
                name="phone"
                required
                placeholder="08..."
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempatLahir"
                  required
                  placeholder="Kota Lahir"
                  value={formData.tempatLahir}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggalLahir"
                  required
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Jenis Kelamin</label>
                <select
                  name="jenisKelamin"
                  required
                  value={formData.jenisKelamin}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner cursor-pointer"
                >
                  <option value="">Pilih</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Alamat Tempat Tinggal</label>
                <textarea
                  name="alamat"
                  required
                  placeholder="Tulis alamat lengkap domisili saat ini..."
                  value={formData.alamat}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Gol. Darah</label>
                <select
                  name="golonganDarah"
                  value={formData.golonganDarah}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner cursor-pointer"
                >
                  <option value="">Pilih</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact (Optional) */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-blue-900 tracking-widest italic border-b-2 border-blue-50 pb-2">2. Kontak Darurat (Opsional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Nama Kontak</label>
                <input
                  type="text"
                  name="kontakDaruratNama"
                  placeholder="Nama kerabat..."
                  value={formData.kontakDaruratNama}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">No. HP Kontak</label>
                <input
                  type="text"
                  name="kontakDaruratTelepon"
                  placeholder="08..."
                  value={formData.kontakDaruratTelepon}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Relasi / Hubungan</label>
                <input
                  type="text"
                  name="kontakDaruratRelasi"
                  placeholder="Contoh: Orang Tua, Istri..."
                  value={formData.kontakDaruratRelasi}
                  onChange={handleChange}
                  className="w-full bg-blue-50 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-blue-50 flex items-center justify-between gap-4">
            <Link
              to="/portal/login"
              className="px-8 py-4 rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all font-black uppercase text-xs tracking-widest italic"
            >
              Batal
            </Link>
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all transform hover:translate-y-[-2px] active:translate-y-0 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan & Masuk Dashboard'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
