import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { api, getDefaultHeaders } from '@/lib/api';

export default function DoctorNewAppointment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    nik: '',
    tempat_lahir: '',
    golongan_darah: '',
    gender: '',
    birth_date: '',
    address: '',
    kontak_darurat_nama: '',
    kontak_darurat_telepon: '',
    kontak_darurat_relasi: '',
    treatment: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    id_klinik: '1'
  });

  const [clinics, setClinics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await fetch(`${api.klinik}/list`, {
          headers: getDefaultHeaders()
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && Array.isArray(resData.data)) {
            setClinics(resData.data);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data klinik", err);
      }
    };
    fetchClinics();
  }, []);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const inputTime = formData.time ? formData.time.replace('.', ':') : '09:00';

      const response = await fetch(api.appointments, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          patient_name: formData.name,
          patient_phone: formData.phone,
          patient_gender: formData.gender,
          patient_birth_date: formData.birth_date,
          patient_address: formData.address,
          appointment_date: formData.date,
          appointment_time: inputTime,
          action_type: formData.treatment,
          id_klinik: Number(formData.id_klinik || 1),
          status: 'pending',
          questionnaire: {},
          nik: formData.nik,
          email: formData.email,
          tempat_lahir: formData.tempat_lahir,
          golongan_darah: formData.golongan_darah,
          kontak_darurat_nama: formData.kontak_darurat_nama,
          kontak_darurat_telepon: formData.kontak_darurat_telepon,
          kontak_darurat_relasi: formData.kontak_darurat_relasi
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal menyimpan appointment.');
      }

      setMessage({ type: 'success', text: 'Appointment berhasil ditambahkan!' });

      setTimeout(() => {
        navigate('/doctor/pemeriksaan');
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal menyimpan appointment.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = (i + 9).toString().padStart(2, '0');
    return `${hour}.00`;
  });

  const treatments = [
    'Cabut Gigi',
    'Tambal Gigi',
    'Scaling Gigi',
    'Pembersihan Karang',
    'Konsultasi Rutin',
    'Ekstraksi Gigi'
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={() => navigate('/doctor/pemeriksaan')}
            className="h-14 w-14 rounded-2xl bg-white border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-all shadow-lg active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-4xl font-black text-blue-900 italic tracking-tighter uppercase">Appointment Baru</h1>
            <p className="text-blue-600 font-bold italic tracking-wide uppercase text-sm mt-1">Manual Input by Doctor</p>
          </div>
        </div>

        {message && (
          <div className={`mb-10 p-6 rounded-[2rem] font-black text-center shadow-xl ${message.type === 'success' ? 'bg-green-50 text-green-600 border-2 border-green-100' : 'bg-red-50 text-red-600 border-2 border-red-100'}`}>
            {message.text.toUpperCase()}
          </div>
        )}

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-100 border-2 border-blue-600 overflow-hidden">
          <div className="bg-blue-600 px-10 py-6">
            <h2 className="text-white font-black italic uppercase tracking-widest flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
              Data Pasien & Jadwal
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Side: Patient Credentials */}
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Nama Lengkap Pasien</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                    placeholder="Masukkan nama..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Nomor HP</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                    placeholder="08..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Jenis Kelamin</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                    >
                      <option value="">Pilih</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Tgl Lahir</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                      placeholder="patient@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">NIK</label>
                    <input
                      type="text"
                      name="nik"
                      value={formData.nik}
                      onChange={handleChange}
                      className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                      placeholder="NIK Pasien"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Tempat Lahir</label>
                    <input
                      type="text"
                      name="tempat_lahir"
                      value={formData.tempat_lahir}
                      onChange={handleChange}
                      className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                      placeholder="Tempat Lahir"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Golongan Darah</label>
                    <select
                      name="golongan_darah"
                      value={formData.golongan_darah}
                      onChange={handleChange}
                      className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                    >
                      <option value="">Pilih Gol Darah</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Alamat</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                    placeholder="Masukkan alamat..."
                    rows={2}
                  />
                </div>

                <div className="border-t border-blue-100 pt-6 mt-6">
                  <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] italic mb-4 ml-4">Kontak Darurat</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Nama</label>
                      <input
                        type="text"
                        name="kontak_darurat_nama"
                        value={formData.kontak_darurat_nama}
                        onChange={handleChange}
                        className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                        placeholder="Nama Kontak Darurat..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Telepon</label>
                        <input
                          type="text"
                          name="kontak_darurat_telepon"
                          value={formData.kontak_darurat_telepon}
                          onChange={handleChange}
                          className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                          placeholder="Nomor Telepon..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Relasi</label>
                        <input
                          type="text"
                          name="kontak_darurat_relasi"
                          value={formData.kontak_darurat_relasi}
                          onChange={handleChange}
                          className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                          placeholder="Relasi..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Appointment Details */}
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Lokasi Klinik</label>
                  <select
                    name="id_klinik"
                    required
                    value={formData.id_klinik}
                    onChange={handleChange}
                    className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner appearance-none cursor-pointer"
                  >
                    {(clinics.length > 0 ? clinics : [
                      { id_klinik: 1, nama_klinik: 'Klinik Lembang' },
                      { id_klinik: 2, nama_klinik: 'Klinik Cibadak' }
                    ]).map((c) => (
                      <option key={c.id_klinik} value={c.id_klinik}>{c.nama_klinik}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Tindakan Medis</label>
                  <select
                    name="treatment"
                    required
                    value={formData.treatment}
                    onChange={handleChange}
                    className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="">Pilih Tindakan</option>
                    {treatments.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Tanggal Kunjungan</label>
                  <input
                    type="date"
                    name="date"
                    required
                    min={today}
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic ml-4">Waktu Kunjungan</label>
                  <select
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="">Pilih Jam</option>
                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-blue-50">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all transform hover:translate-y-[-4px] active:translate-y-0 uppercase tracking-widest text-lg flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                {isLoading ? 'Menyimpan...' : 'Konfirmasi Appointment'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
