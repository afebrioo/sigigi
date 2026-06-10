import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';

export default function PortalRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Semua field akun dasar harus diisi!' });
        return;
      }
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Kata sandi minimal harus 6 karakter!' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok!' });
        return;
      }
      setMessage(null);
      setStep(2);
    } else if (step === 2) {
      if (!formData.tempatLahir || !formData.tanggalLahir || !formData.jenisKelamin || !formData.alamat) {
        setMessage({ type: 'error', text: 'Harap lengkapi semua data wajib pada biodata diri!' });
        return;
      }
      setMessage(null);
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(api.portal.register, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
          phone: formData.phone,
          tempat_lahir: formData.tempatLahir,
          tanggal_lahir: formData.tanggalLahir,
          jenis_kelamin: formData.jenisKelamin,
          alamat: formData.alamat,
          golongan_darah: formData.golonganDarah,
          kontak_darurat_nama: formData.kontakDaruratNama,
          kontak_darurat_telepon: formData.kontakDaruratTelepon,
          kontak_darurat_relasi: formData.kontakDaruratRelasi,
          role: 'patient'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMsg = 'Gagal registrasi.';
        if (result.message) {
          errorMsg = result.message;
        } else if (result.error) {
          if (typeof result.error === 'object') {
            errorMsg = Object.values(result.error).flat().join(', ');
          } else {
            errorMsg = String(result.error);
          }
        }
        throw new Error(errorMsg);
      }

      setMessage({ type: 'success', text: 'Registrasi berhasil! Silakan login.' });
      setTimeout(() => {
        navigate('/portal/login');
      }, 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan saat registrasi.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 border-2 border-white transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black text-center leading-tight text-white border-4 border-blue-50 shadow-xl mb-4">
            SIGIGI
          </div>
          <h1 className="text-3xl font-black text-blue-900 italic tracking-tight">Daftar Akun</h1>
          <p className="text-blue-600 font-bold italic text-sm mt-1">Lengkapi data diri Anda sekali untuk kemudahan layanan</p>
        </div>

        {/* Stepper Indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${step >= 1 ? 'bg-blue-600 text-white border-2 border-blue-600' : 'bg-blue-50 text-blue-300 border-2 border-transparent'}`}>1</span>
            <span className={`text-[10px] font-black uppercase tracking-wider hidden sm:inline ${step >= 1 ? 'text-blue-600' : 'text-blue-300'}`}>Akun</span>
          </div>
          <div className="w-10 h-0.5 bg-blue-100"></div>
          <div className="flex items-center gap-2">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${step >= 2 ? 'bg-blue-600 text-white border-2 border-blue-600' : 'bg-blue-50 text-blue-300 border-2 border-transparent'}`}>2</span>
            <span className={`text-[10px] font-black uppercase tracking-wider hidden sm:inline ${step >= 2 ? 'text-blue-600' : 'text-blue-300'}`}>Biodata</span>
          </div>
          <div className="w-10 h-0.5 bg-blue-100"></div>
          <div className="flex items-center gap-2">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${step >= 3 ? 'bg-blue-600 text-white border-2 border-blue-600' : 'bg-blue-50 text-blue-300 border-2 border-transparent'}`}>3</span>
            <span className={`text-[10px] font-black uppercase tracking-wider hidden sm:inline ${step >= 3 ? 'text-blue-600' : 'text-blue-300'}`}>Kontak Darurat</span>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl font-bold text-center text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.text}
          </div>
        )}

        {/* Step 1: Kredensial Akun */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                  placeholder="Nama Lengkap Anda"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Nomor HP</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                  placeholder="Contoh: 0812..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                placeholder="email@contoh.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Kata Sandi</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Konfirmasi Sandi</label>
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
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all transform hover:translate-y-[-2px] uppercase tracking-widest mt-6"
            >
              Lanjut ke Biodata
            </button>
          </form>
        )}

        {/* Step 2: Biodata Diri */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Golongan Darah</label>
              <select
                name="golonganDarah"
                value={formData.golonganDarah}
                onChange={handleChange}
                className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner appearance-none"
              >
                <option value="">Pilih Golongan Darah</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleChange}
                  className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                  placeholder="Kota Lahir"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Jenis Kelamin</label>
              <div className="flex gap-6 pl-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-blue-900">
                  <input
                    type="radio"
                    name="jenisKelamin"
                    value="L"
                    checked={formData.jenisKelamin === 'L'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-blue-200 focus:ring-blue-500"
                    required
                  />
                  Laki-laki
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-blue-900">
                  <input
                    type="radio"
                    name="jenisKelamin"
                    value="P"
                    checked={formData.jenisKelamin === 'P'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-blue-200 focus:ring-blue-500"
                    required
                  />
                  Perempuan
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Alamat Lengkap</label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                placeholder="Masukkan alamat domisili lengkap saat ini..."
                rows={2}
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/3 border-2 border-blue-600 text-blue-600 font-black py-4 rounded-2xl transition-all hover:bg-blue-50 uppercase tracking-widest"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all transform hover:translate-y-[-2px] uppercase tracking-widest"
              >
                Lanjut
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Kontak Darurat */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50/30 p-6 rounded-3xl border border-blue-100 space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Nama Kontak Darurat</label>
                <input
                  type="text"
                  name="kontakDaruratNama"
                  value={formData.kontakDaruratNama}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-blue-100 focus:border-blue-600 rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                  placeholder="Nama kerabat terdekat..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Nomor HP</label>
                  <input
                    type="text"
                    name="kontakDaruratTelepon"
                    value={formData.kontakDaruratTelepon}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-blue-100 focus:border-blue-600 rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                    placeholder="Nomor HP kerabat..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-blue-600 ml-4 tracking-[0.2em] italic">Relasi</label>
                  <input
                    type="text"
                    name="kontakDaruratRelasi"
                    value={formData.kontakDaruratRelasi}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-blue-100 focus:border-blue-600 rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                    placeholder="Contoh: Istri, Ayah, Ibu..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/3 border-2 border-blue-600 text-blue-600 font-black py-4 rounded-2xl transition-all hover:bg-blue-50 uppercase tracking-widest"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all transform hover:translate-y-[-2px] uppercase tracking-widest disabled:opacity-50"
              >
                {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-blue-300 font-bold italic text-sm">
            Sudah punya akun?{' '}
            <Link to="/portal/login" className="text-blue-600 hover:underline hover:text-blue-800">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
