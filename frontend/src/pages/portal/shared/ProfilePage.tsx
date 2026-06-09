import { useState, useEffect } from 'react';
import PortalLayout from '@/components/portal/PortalLayout';
import { useLocation } from 'react-router-dom';
import { api, getDefaultHeaders } from '@/lib/api';

export default function ProfilePage() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nik: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    alamat: '',
    golonganDarah: '',
    kontakDaruratNama: '',
    kontakDaruratTelepon: '',
    kontakDaruratRelasi: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    joinedYear: '2026',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (location.state?.showIncompleteWarning) {
      setShowWarning(true);
    }
  }, [location]);

  useEffect(() => {
    const userStr = localStorage.getItem('portal_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const bio = user.biodata || {};
        setFormData(prev => ({
          ...prev,
          name: user.full_name || user.nama_lengkap || '',
          email: user.email || '',
          phone: user.phone_number || user.phone || bio.telepon || '',
          nik: bio.nik || '',
          tempatLahir: bio.tempat_lahir || '',
          tanggalLahir: bio.tanggal_lahir || '',
          jenisKelamin: bio.jenis_kelamin || '',
          alamat: bio.alamat || '',
          golonganDarah: bio.golongan_darah || '',
          kontakDaruratNama: bio.kontak_darurat_nama || '',
          kontakDaruratTelepon: bio.kontak_darurat_telepon || '',
          kontakDaruratRelasi: bio.kontak_darurat_relasi || '',
          joinedYear: user.created_at ? new Date(user.created_at).getFullYear().toString() : '2026',
        }));
      } catch (e) {
        console.error("Failed to parse portal user", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch(api.portal.profile, {
        method: "PUT",
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          nama_lengkap: formData.name,
          phone: formData.phone,
          nik: formData.nik,
          tempat_lahir: formData.tempatLahir,
          tanggal_lahir: formData.tanggalLahir,
          jenis_kelamin: formData.jenisKelamin,
          alamat: formData.alamat,
          golongan_darah: formData.golonganDarah,
          kontak_darurat_nama: formData.kontakDaruratNama,
          kontak_darurat_telepon: formData.kontakDaruratTelepon,
          kontak_darurat_relasi: formData.kontakDaruratRelasi
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Gagal memperbarui profil.');
      }

      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      localStorage.setItem("portal_user", JSON.stringify(result.user));
      setShowWarning(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat menyimpan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok!' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(api.portal.profile, {
        method: "PUT",
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          nama_lengkap: formData.name,
          phone: formData.phone,
          nik: formData.nik,
          tempat_lahir: formData.tempatLahir,
          tanggal_lahir: formData.tanggalLahir,
          jenis_kelamin: formData.jenisKelamin,
          alamat: formData.alamat,
          golongan_darah: formData.golonganDarah,
          kontak_darurat_nama: formData.kontakDaruratNama,
          kontak_darurat_telepon: formData.kontakDaruratTelepon,
          kontak_darurat_relasi: formData.kontakDaruratRelasi,
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Gagal memperbarui kata sandi.');
      }

      setMessage({ type: 'success', text: 'Kata sandi berhasil diperbarui!' });
      localStorage.setItem("portal_user", JSON.stringify(result.user));
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat mengubah kata sandi.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PortalLayout role="patient">
      <div className="max-w-4xl mx-auto space-y-8 pt-8 px-4 pb-12">
        {/* Incomplete Profile Alert */}
        {showWarning && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-[2.5rem] p-8 text-amber-900 shadow-xl shadow-amber-100/50 flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md flex-shrink-0 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-black uppercase tracking-wider italic">Mohon Lengkapi Profil Anda</h3>
              <p className="text-sm font-bold opacity-90 leading-relaxed">
                Anda baru saja login (atau mendaftar melalui Google) dan memiliki data diri yang belum lengkap di klinik kami. 
                Sistem mengharuskan pengisian **NIK, Tempat & Tanggal Lahir, Jenis Kelamin, Alamat Domisili, dan Nomor HP** sebelum Anda diizinkan untuk menjadwalkan kunjungan dokter (appointment).
              </p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 overflow-hidden border border-blue-100">
          {/* Cover Header */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800 relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0">
              <div className="h-24 w-24 rounded-3xl bg-white p-1.5 shadow-xl border border-blue-100">
                <div className="h-full w-full rounded-2xl bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-12 px-6 md:px-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 mb-10 text-center md:text-left">
              <div>
                <h1 className="text-3xl font-black text-blue-900 italic tracking-tight uppercase leading-none">{formData.name || 'Nama Pasien'}</h1>
                <p className="text-blue-600 font-bold text-sm tracking-widest uppercase mt-1">Patient Account</p>
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-blue-100 transition-all transform active:scale-95 uppercase tracking-widest text-xs w-full md:w-auto disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>

            {message && (
              <div className={`mb-8 p-4 rounded-2xl font-bold text-center ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {message.text}
              </div>
            )}

            {/* Profile Info Grid */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase text-blue-900 tracking-widest italic border-b border-blue-50 pb-2 mb-6">1. Biodata Utama (Wajib)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                      <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Nama Lengkap</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-transparent text-blue-900 font-black text-xl outline-none"
                        required
                      />
                    </div>
                    
                    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                      <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-transparent text-blue-900 font-bold outline-none cursor-not-allowed opacity-60"
                      />
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                      <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">NIK (No. KTP)</label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik}
                        onChange={handleChange}
                        className="w-full bg-transparent text-blue-900 font-bold outline-none"
                        required
                      />
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                      <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Tempat Lahir</label>
                      <input
                        type="text"
                        name="tempatLahir"
                        value={formData.tempatLahir}
                        onChange={handleChange}
                        className="w-full bg-transparent text-blue-900 font-bold outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                      <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Nomor HP</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-transparent text-blue-900 font-bold outline-none"
                        required
                      />
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                      <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Tanggal Lahir</label>
                      <input
                        type="date"
                        name="tanggalLahir"
                        value={formData.tanggalLahir}
                        onChange={handleChange}
                        className="w-full bg-transparent text-blue-900 font-bold outline-none"
                        required
                      />
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                      <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Jenis Kelamin</label>
                      <select
                        name="jenisKelamin"
                        value={formData.jenisKelamin}
                        onChange={handleChange}
                        className="w-full bg-transparent text-blue-900 font-bold outline-none cursor-pointer"
                        required
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                      <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Golongan Darah</label>
                      <select
                        name="golonganDarah"
                        value={formData.golonganDarah}
                        onChange={handleChange}
                        className="w-full bg-transparent text-blue-900 font-bold outline-none cursor-pointer"
                      >
                        <option value="">Pilih Golongan Darah</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                  <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Alamat Domisili Lengkap</label>
                  <input
                    type="text"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    className="w-full bg-transparent text-blue-900 font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase text-blue-900 tracking-widest italic border-b border-blue-50 pb-2 mb-6">2. Kontak Darurat (Opsional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                    <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Nama Kontak</label>
                    <input
                      type="text"
                      name="kontakDaruratNama"
                      value={formData.kontakDaruratNama}
                      onChange={handleChange}
                      className="w-full bg-transparent text-blue-900 font-bold outline-none"
                    />
                  </div>

                  <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                    <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">No. HP Kontak</label>
                    <input
                      type="text"
                      name="kontakDaruratTelepon"
                      value={formData.kontakDaruratTelepon}
                      onChange={handleChange}
                      className="w-full bg-transparent text-blue-900 font-bold outline-none"
                    />
                  </div>

                  <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
                    <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Relasi / Hubungan</label>
                    <input
                      type="text"
                      name="kontakDaruratRelasi"
                      value={formData.kontakDaruratRelasi}
                      onChange={handleChange}
                      className="w-full bg-transparent text-blue-900 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-2">Bergabung Sejak</span>
                <p className="text-blue-900 font-black italic pr-2">{formData.joinedYear}</p>
              </div>
            </div>
          </div>
        </form>

        {/* Change Password Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 p-10 border border-blue-50">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-blue-900 italic tracking-tight uppercase">Ubah Kata Sandi</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] italic ml-4">Kata Sandi Saat Ini</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] italic ml-4">Kata Sandi Baru</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] italic ml-4">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all transform hover:translate-y-[-2px] active:translate-y-0 uppercase tracking-widest text-sm"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}
