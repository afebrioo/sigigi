import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getDefaultHeaders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { toast } = useToast();

  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${api.appointments}?status=pending&today=1`, {
        headers: getDefaultHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        const mapped = data.map((item: any) => ({
          id: item.id,
          id_klinik: item.id_klinik,
          name: item.patient_name || 'Tanpa Nama',
          phone: item.patient_phone || '-',
          time: item.appointment_time ? item.appointment_time.substring(0, 5).replace(':', '.') : '-',
          act: item.action_type || '-',
          hasAI: !!item.questionnaire?.ai_analysis,
          aiResult: item.questionnaire?.ai_analysis?.prediction || null,
          urgency: item.priority_level || 'Rendah',
          urgencyScore: item.urgency_score || 0,
          status: item.status
        }));
        setAllAppointments(mapped);
      }
    } catch (error) {
      console.error("Gagal mengambil data janji temu", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
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
    fetchAppointments();

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const displayedAppointments = allAppointments.filter(a => String(a.id_klinik) === selectedClinicId);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour12: false });
  };

  const handleCancelClick = () => {
    if (!selectedId) {
      toast({
        title: "Pilih Pasien",
        description: "Silakan pilih pasien terlebih dahulu dari daftar antrian.",
        variant: "destructive"
      });
      return;
    }
    setIsCancelConfirmOpen(true);
  };

  const executeCancel = async () => {
    setIsCancelConfirmOpen(false);
    try {
      const response = await fetch(`${api.appointments}/${selectedId}`, {
        method: 'PUT',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        setAllAppointments(prev => prev.filter(a => a.id !== selectedId));
        setSelectedId(null);
        toast({
          title: "Appointment Dibatalkan",
          description: "Janji temu pasien berhasil dibatalkan.",
        });
      } else {
        const errData = await response.json();
        toast({
          title: "Gagal Membatalkan",
          description: "Gagal membatalkan: " + (errData.message || 'Error Unknown'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Terjadi Kesalahan",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleStartService = async () => {
    if (!selectedId) {
      toast({
        title: "Pilih Pasien",
        description: "Silakan pilih pasien terlebih dahulu dari daftar antrian.",
        variant: "destructive"
      });
      return;
    }

    const selectedApp = allAppointments.find(a => a.id === selectedId);
    if (selectedApp && selectedApp.status === 'serving') {
      navigate(`/doctor/patient/${selectedId}`);
      return;
    }

    try {
      const response = await fetch(`${api.appointments}/${selectedId}`, {
        method: 'PUT',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ status: 'serving' })
      });

      if (response.ok) {
        navigate(`/doctor/patient/${selectedId}`);
      } else {
        const err = await response.json();
        toast({
          title: "Gagal Memulai Tindakan",
          description: err.message || "Terjadi kesalahan.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Terjadi Kesalahan",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center pt-8">

        {/* Clinic Switcher Tabs for Doctor */}
        <div className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-blue-100 shadow-xl">
          <span className="text-xs font-black uppercase text-blue-900 tracking-wider pl-4 italic">
            Monitoring Klinik Cabang:
          </span>
          <div className="flex flex-wrap gap-3 justify-center">
            {(clinics.length > 0 ? clinics : [
              { id_klinik: 1, nama_klinik: 'Klinik Lembang' },
              { id_klinik: 2, nama_klinik: 'Klinik Cibadak' }
            ]).map((clinic) => {
              const count = allAppointments.filter(a => Number(a.id_klinik) === Number(clinic.id_klinik)).length;
              const isActive = selectedClinicId === String(clinic.id_klinik);
              return (
                <button
                  key={clinic.id_klinik}
                  onClick={() => setSelectedClinicId(String(clinic.id_klinik))}
                  className={`px-8 py-3 rounded-2xl font-black italic uppercase tracking-wider text-[10px] border transition-all duration-300 flex items-center gap-3 relative overflow-hidden ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200/50 scale-105'
                      : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-50 hover:scale-[1.02]'
                  }`}
                >
                  {clinic.nama_klinik}
                  <span className={`h-5 px-2.5 rounded-full flex items-center justify-center font-black text-[10px] transition-colors ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-200/60 text-blue-800'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl shadow-blue-50 border-2 border-blue-600 mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px] md:min-w-full">
              <thead className="bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6 italic">No</th>
                  <th className="px-8 py-6 italic">Nama Pasien</th>
                  <th className="px-8 py-6 italic">No. HP</th>
                  <th className="px-8 py-6 italic">Waktu</th>
                  <th className="px-8 py-6 italic">Tindakan</th>
                  <th className="px-8 py-6 italic">AI</th>
                  <th className="px-8 py-6 italic">Urgensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20 bg-blue-50/50">
                      <p className="text-blue-400 font-black italic uppercase tracking-widest text-xl">Loading...</p>
                    </td>
                  </tr>
                ) : displayedAppointments.length > 0 ? displayedAppointments.map((item, idx) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`transition-all group cursor-pointer ${selectedId === item.id
                      ? 'bg-blue-100 border-l-8 border-blue-600'
                      : 'hover:bg-blue-50 border-l-8 border-transparent'
                      }`}
                  >
                    <td className="px-8 py-5 text-blue-700 font-black flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black transition-all ${selectedId === item.id ? 'bg-blue-600 text-white scale-110' : 'bg-blue-100 text-blue-600'
                        }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className={`px-8 py-5 font-black transition-colors ${selectedId === item.id ? 'text-blue-900 text-lg' : 'text-blue-900 opacity-80'}`}>
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.status === 'serving' && (
                          <span className="bg-blue-100 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            Sedang Dilayani
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-blue-700 font-bold">{item.phone}</td>
                    <td className="px-8 py-5 text-blue-900 font-black italic">{item.time}</td>
                    <td className="px-8 py-5">
                      <span className="bg-blue-50 text-blue-900 px-4 py-1.5 rounded-xl font-bold italic text-sm border border-blue-100">
                        {item.act}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      {item.hasAI ? (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.aiResult === 'karies' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {item.aiResult === 'karies' ? '⚠ Karies' : '✓ Sehat'}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-[10px] font-bold italic">—</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-center max-w-[90px] ${
                          item.urgency === 'HIGH' || item.urgency === 'Tinggi' ? 'bg-red-100 text-red-600 border border-red-200' :
                          item.urgency === 'MEDIUM' || item.urgency === 'Sedang' ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' :
                          'bg-green-100 text-green-600 border border-green-200'
                        }`}>
                          {item.urgency}
                        </span>
                        <span className="text-[10px] text-blue-400 font-bold mt-1 text-center max-w-[90px]">Score: {item.urgencyScore}</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-20 bg-blue-50/50">
                      <p className="text-blue-400 font-black italic uppercase tracking-widest text-xl">Tidak ada antrian hari ini</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mulai Dilayani Button */}
        <button
          disabled={!selectedId}
          onClick={handleStartService}
          className={`font-black py-4 px-16 rounded-[2rem] shadow-xl transition-all transform mb-12 uppercase tracking-widest text-sm ${selectedId
            ? 'bg-blue-600 hover:bg-blue-700 text-white hover:translate-y-[-2px] active:translate-y-0 shadow-blue-200'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
            }`}
        >
          {allAppointments.find(a => a.id === selectedId)?.status === 'serving' ? 'Lanjutkan Tindakan' : 'Mulai Dilayani'}
        </button>

        {/* Clock */}
        <div className="text-8xl font-black text-blue-900 mb-16 tracking-tighter italic">
          {formatTime(time)}
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-12">
          <button
            onClick={() => navigate('/doctor/pemeriksaan/new')}
            className="flex items-center gap-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-black py-4 px-10 rounded-[2rem] shadow-lg transition-all transform hover:translate-y-[-2px] active:translate-y-0"
          >
            <div className="bg-blue-600 rounded-full p-1.5 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span className="italic uppercase tracking-widest text-xs">Appointment Baru</span>
          </button>

          <button
            disabled={!selectedId}
            onClick={handleCancelClick}
            className={`flex items-center gap-4 font-black py-4 px-10 rounded-[2rem] shadow-lg transition-all transform border-2 ${selectedId
              ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:translate-y-[-2px] active:translate-y-0 shadow-red-50'
              : 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed opacity-50'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span className="italic uppercase tracking-widest text-xs">Batalkan Appointment</span>
          </button>
        </div>

        {isCancelConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] border-2 border-red-600 shadow-2xl p-8 max-w-md w-full space-y-6 text-center animate-fade-in-slide-down">
              <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-red-900 uppercase italic">Batalkan Appointment</h3>
                <p className="text-slate-500 font-semibold text-sm">Apakah Anda yakin ingin membatalkan janji temu pasien ini? Tindakan ini tidak dapat dibatalkan.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsCancelConfirmOpen(false)}
                  className="w-1/2 bg-white border-2 border-red-600 text-red-600 font-black py-3.5 rounded-xl uppercase tracking-widest text-xs hover:bg-red-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={executeCancel}
                  className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl shadow-lg shadow-red-200 uppercase tracking-widest text-xs transition-colors"
                >
                  Ya, Batalkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
