import React, { useState, useEffect } from 'react';
import PortalLayout from '@/components/portal/PortalLayout';
import { useNavigate } from 'react-router-dom';
import { api, getDefaultHeaders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function NewAppointmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('portal_isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/portal/login');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    namaLengkap: '',
    tanggalLahir: '',
    jenisKelamin: '',
    alamat: '',
    nik: '',
    tempatLahir: '',
    golonganDarah: '',
    nomorHandphone: '',
    email: '',
    kontakDaruratNama: '',
    kontakDaruratTelepon: '',
    kontakDaruratRelasi: '',
    tanggalKunjungan: '',
    waktuKunjungan: '',
    id_klinik: '1'
  });

  const [clinics, setClinics] = useState<any[]>([]);

  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = () => {
      const userStr = localStorage.getItem('portal_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          
          setFormData((prev) => ({
            ...prev,
            email: user.email || '',
            namaLengkap: user.full_name || '',
            nomorHandphone: user.phone_number || '',
            tanggalLahir: user.biodata?.tanggal_lahir || '',
            jenisKelamin: user.biodata?.jenis_kelamin || '',
            alamat: user.biodata?.alamat || '',
            nik: user.biodata?.nik || '',
            tempatLahir: user.biodata?.tempat_lahir || '',
            golonganDarah: user.biodata?.golongan_darah || '',
            kontakDaruratNama: user.biodata?.kontak_darurat_nama || '',
            kontakDaruratTelepon: user.biodata?.kontak_darurat_telepon || '',
            kontakDaruratRelasi: user.biodata?.kontak_darurat_relasi || ''
          }));
        } catch (e) {
          console.error("Failed to parse user from local storage", e);
        }
      }
    };

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

    fetchUser();
    fetchClinics();
  }, []);

  // Fetch booked times for the selected date and clinic
  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!formData.tanggalKunjungan || !formData.id_klinik) {
        setBookedTimes([]);
        return;
      }
      try {
        const response = await fetch(`${api.appointments}?id_klinik=${formData.id_klinik}&date=${formData.tanggalKunjungan}`, {
          headers: getDefaultHeaders()
        });
        if (response.ok) {
          const appointments = await response.json();
          // Filter out cancelled appointments
          const activeBookings = appointments
            .filter((app: any) => app.status !== 'cancelled')
            .map((app: any) => {
              // Convert 15:00:00 or 15:00 to 15.00 format
              if (app.appointment_time) {
                const timeStr = app.appointment_time.substring(0, 5).replace(':', '.');
                return timeStr;
              }
              return '';
            })
            .filter(Boolean);
          setBookedTimes(activeBookings);
        }
      } catch (err) {
        console.error("Gagal mengambil jadwal bentrok", err);
      }
    };
    fetchBookedTimes();
  }, [formData.tanggalKunjungan, formData.id_klinik]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tanggalKunjungan || !formData.waktuKunjungan) {
      toast({
        title: "Jadwal Belum Lengkap",
        description: "Harap pilih tanggal dan waktu kunjungan terlebih dahulu.",
        variant: "destructive"
      });
      return;
    }
    if (bookedTimes.includes(formData.waktuKunjungan)) {
      toast({
        title: "Jadwal Bentrok",
        description: "Maaf, jadwal jam " + formData.waktuKunjungan + " sudah dipilih oleh pasien lain pada tanggal tersebut. Silakan pilih jam lain.",
        variant: "destructive"
      });
      return;
    }
    navigate('/portal/appointments/questionnaire', { state: { reservationData: formData } });
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

  return (
    <PortalLayout role="patient">
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-blue-900 italic tracking-tight uppercase">Buat Appointment Baru</h1>
          <p className="text-blue-500 font-bold italic text-sm mt-1">
            Data diri Anda diambil otomatis dari profil akun
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Read-Only Patient Profile Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-blue-600 shadow-xl relative overflow-hidden">
              {/* Header Badge */}
              <div className="absolute top-0 right-0 bg-blue-600 text-white font-black italic uppercase text-[10px] px-6 py-2 rounded-bl-3xl tracking-widest">
                Profil Pasien
              </div>
              
              <div className="mt-4 flex flex-col items-center border-b border-blue-50 pb-6 mb-6">
                <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100 shadow-inner mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-blue-950 text-center tracking-tight leading-tight">{formData.namaLengkap}</h3>
                <span className="bg-blue-50 text-blue-600 font-black italic uppercase text-[10px] px-4 py-1 rounded-full tracking-wider mt-2">
                  No HP: {formData.nomorHandphone}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-dashed border-blue-50/50 pb-2">
                  <span className="text-blue-400 font-bold italic text-xs uppercase tracking-wide">NIK</span>
                  <span className="text-blue-950 font-black">{formData.nik || '-'}</span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-dashed border-blue-50/50 pb-2">
                  <span className="text-blue-400 font-bold italic text-xs uppercase tracking-wide">Jenis Kelamin</span>
                  <span className="text-blue-950 font-black">
                    {formData.jenisKelamin === 'L' ? 'Laki-laki' : formData.jenisKelamin === 'P' ? 'Perempuan' : '-'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-dashed border-blue-50/50 pb-2">
                  <span className="text-blue-400 font-bold italic text-xs uppercase tracking-wide">Tgl Lahir</span>
                  <span className="text-blue-950 font-black">{formData.tanggalLahir || '-'}</span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-dashed border-blue-50/50 pb-2">
                  <span className="text-blue-400 font-bold italic text-xs uppercase tracking-wide">Gol. Darah</span>
                  <span className="text-blue-950 font-black bg-red-50 text-red-500 rounded-lg px-2.5 py-0.5 border border-red-100">{formData.golonganDarah || '-'}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-blue-400 font-bold italic text-xs uppercase tracking-wide block">Alamat</span>
                  <p className="text-blue-900 font-bold text-xs bg-blue-50/30 p-3 rounded-xl border border-blue-50 leading-relaxed">
                    {formData.alamat || '-'}
                  </p>
                </div>

                {formData.kontakDaruratNama && (
                  <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-50 mt-4 space-y-2">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Kontak Darurat</h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-400 font-bold">Nama</span>
                      <span className="text-blue-950 font-black">{formData.kontakDaruratNama}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-400 font-bold">Telepon</span>
                      <span className="text-blue-950 font-black">{formData.kontakDaruratTelepon}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-400 font-bold">Relasi</span>
                      <span className="text-blue-950 font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase text-[9px]">{formData.kontakDaruratRelasi}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Schedule Selection Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-blue-50 shadow-xl">
              <h2 className="text-2xl font-black text-blue-900 italic tracking-tight mb-8">Pilih Jadwal Kunjungan</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Clinic Selection Cards */}
                <div className="space-y-3 mb-6">
                  <label className="block text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] italic ml-4">
                    Pilih Lokasi Klinik
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(clinics.length > 0 ? clinics : [
                      { id_klinik: 1, nama_klinik: 'Klinik Lembang', alamat_klinik: 'Jl. Grand Hotel No. 70, Lembang' },
                      { id_klinik: 2, nama_klinik: 'Klinik Cibadak', alamat_klinik: 'Jl. Cibadak 194, Bandung' }
                    ]).map((clinic) => (
                      <div
                        key={clinic.id_klinik}
                        onClick={() => setFormData({ ...formData, id_klinik: String(clinic.id_klinik) })}
                        className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 relative overflow-hidden flex flex-col gap-2 ${
                          formData.id_klinik === String(clinic.id_klinik)
                            ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-50/50'
                            : 'border-blue-100 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${
                            formData.id_klinik === String(clinic.id_klinik)
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-blue-50 border-blue-100 text-blue-600'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-black text-blue-950 tracking-tight leading-tight text-sm">
                              {clinic.nama_klinik}
                            </h4>
                            <p className="text-blue-500 text-[10px] font-bold italic">
                              {clinic.id_klinik === 1 ? 'Cabang Lembang' : 'Cabang Bandung'}
                            </p>
                          </div>
                        </div>
                        <p className="text-blue-900/60 text-[10px] font-bold leading-normal">
                          {clinic.alamat_klinik || '-'}
                        </p>
                        {formData.id_klinik === String(clinic.id_klinik) && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5 shadow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] italic ml-4">
                    Tanggal Kunjungan
                  </label>
                  <input
                    type="date"
                    name="tanggalKunjungan"
                    min={today}
                    required
                    className="w-full bg-blue-50/30 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner"
                    value={formData.tanggalKunjungan}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] italic ml-4">
                    Waktu Kunjungan (Slot Jam)
                  </label>
                  <select
                    name="waktuKunjungan"
                    required
                    className="w-full bg-blue-50/30 border-2 border-blue-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-blue-900 shadow-inner appearance-none cursor-pointer"
                    value={formData.waktuKunjungan}
                    onChange={handleChange}
                  >
                    <option value="">Pilih Jam Kunjungan</option>
                    {timeSlots.filter(slot => !bookedTimes.includes(slot)).map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all transform hover:translate-y-[-2px] active:translate-y-[0px] uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                  >
                    Lanjut Isi Kuesioner
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
