import { useState, useEffect, Fragment } from 'react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Link } from 'react-router-dom';
import { api, getDefaultHeaders } from '@/lib/api';

export default function PatientAppointments() {
  const [queueData, setQueueData] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('1');
  const [isAiAdviceExpanded, setIsAiAdviceExpanded] = useState(true);

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
  }, []);

  useEffect(() => {
    const fetchQueue = async () => {
      setIsLoading(true);

      const userStr = localStorage.getItem('portal_user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          setCurrentUserId(Number(userObj.id || userObj.id_users));
        } catch(e){}
      }

      try {
        const response = await fetch(`${api.queueToday}?id_klinik=${selectedClinicId}`, {
          headers: getDefaultHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          const mapped = data.map((item: any, index: number) => {
            let parsedTriage = null;
            if (item.ai_triage_analysis) {
              parsedTriage = typeof item.ai_triage_analysis === 'string'
                ? JSON.parse(item.ai_triage_analysis)
                : item.ai_triage_analysis;
            }
            let parsedQuestionnaire = null;
            if (item.questionnaire) {
              parsedQuestionnaire = typeof item.questionnaire === 'string'
                ? JSON.parse(item.questionnaire)
                : item.questionnaire;
            }
            return {
              no: index + 1,
              name: item.patient_name || 'Tanpa Nama',
              phone: item.patient_phone || '-',
              time: item.appointment_time ? item.appointment_time.substring(0, 5).replace(':', '.') : '-',
              act: item.action_type || '-',
              patient_id: Number(item.user_id),
              urgency: item.priority_level || 'Rendah',
              ai_triage_analysis: parsedTriage,
              questionnaire: parsedQuestionnaire
            };
          });
          setQueueData(mapped);
        }
      } catch (error) {
        console.error("Gagal mengambil data antrian", error);
      }

      setIsLoading(false);
    };

    fetchQueue();
  }, [selectedClinicId]);

  const maskName = (name: string, _isUser: boolean) => {
    return name;
  };

  const maskPhone = (phone: string, _isUser: boolean) => {
    return phone || '-';
  };

  return (
    <PortalLayout role="patient">
      <div className="flex flex-col items-center pt-8">
        <h1 className="text-2xl font-black text-blue-900 mb-8 italic uppercase tracking-tighter">List Antrian Klinik</h1>

        {/* Clinic Switcher Tabs */}
        <div className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-blue-100 shadow-xl">
          <span className="text-xs font-black uppercase text-blue-900 tracking-wider pl-4 italic">
            Lokasi Klinik Aktif:
          </span>
          <div className="flex gap-3">
            {(clinics.length > 0 ? clinics : [
              { id_klinik: 1, nama_klinik: 'Klinik Lembang' },
              { id_klinik: 2, nama_klinik: 'Klinik Cibadak' }
            ]).map((clinic) => (
              <button
                key={clinic.id_klinik}
                onClick={() => setSelectedClinicId(String(clinic.id_klinik))}
                className={`px-6 py-2.5 rounded-2xl font-black italic uppercase tracking-wider text-[10px] border transition-all ${
                  selectedClinicId === String(clinic.id_klinik)
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {clinic.nama_klinik}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl shadow-blue-50 border-2 border-blue-600">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left min-w-[700px] md:min-w-full">
              <thead className="bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6 italic">No</th>
                  <th className="px-8 py-6 italic">Nama Pasien</th>
                  <th className="px-8 py-6 italic">No. HP</th>
                  <th className="px-8 py-6 italic">Waktu Kunjungan</th>
                  <th className="px-8 py-6 italic">Tindakan</th>
                  <th className="px-8 py-6 italic">Urgensi</th>
                  <th className="px-8 py-6 italic"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20 bg-blue-50/50">
                      <p className="text-blue-400 font-black italic uppercase tracking-widest text-xl">Loading Antrian...</p>
                    </td>
                  </tr>
                ) : queueData.length > 0 ? (
                  queueData.map((item) => {
                    const isUser = item.patient_id === currentUserId;
                    return (
                      <Fragment key={item.no}>
                        <tr className={`${isUser ? 'bg-blue-50' : 'hover:bg-blue-50/30'} transition-colors`}>
                          <td className="px-8 py-5 text-blue-700 font-black">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black ${isUser ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                              {item.no}
                            </div>
                          </td>
                          <td className={`px-8 py-5 font-black ${isUser ? 'text-blue-900' : 'text-blue-600 opacity-60'}`}>
                            {maskName(item.name, isUser)}
                            {isUser && <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Anda</span>}
                          </td>
                          <td className={`px-8 py-5 font-bold ${isUser ? 'text-blue-700' : 'text-blue-300'}`}>
                            {maskPhone(item.phone, isUser)}
                          </td>
                          <td className="px-8 py-5 text-blue-900 font-black italic">{item.time}</td>
                          <td className="px-8 py-5">
                            <span className="bg-blue-50 text-blue-900 px-4 py-1.5 rounded-xl font-bold italic text-sm border border-blue-100">
                              {item.act}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider ${
                                item.urgency === 'HIGH' || item.urgency === 'Tinggi' ? 'bg-red-100 text-red-600 border border-red-200' :
                                item.urgency === 'MEDIUM' || item.urgency === 'Sedang' ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' :
                                'bg-green-100 text-green-600 border border-green-200'
                              }`}>
                                {item.urgency}
                              </span>
                              {isUser && item.questionnaire?.ai_analysis && (
                                <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider ${
                                  item.questionnaire.ai_analysis.prediction === 'karies'
                                    ? 'bg-red-100 text-red-600 border border-red-200'
                                    : 'bg-green-100 text-green-600 border border-green-200'
                                }`}>
                                  AI: {item.questionnaire.ai_analysis.prediction === 'karies' ? '⚠ Karies' : '✓ Non-Karies'}
                                  {item.questionnaire.ai_analysis.confidence !== undefined && ` (${item.questionnaire.ai_analysis.confidence}%)`}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            {isUser && item.ai_triage_analysis?.patient_friendly_advice && (
                              <button
                                onClick={() => setIsAiAdviceExpanded(!isAiAdviceExpanded)}
                                className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-xl bg-blue-50 border border-blue-100 active:scale-95 transform inline-flex items-center justify-center"
                                title={isAiAdviceExpanded ? "Sembunyikan Analisis AI" : "Tampilkan Analisis AI"}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isAiAdviceExpanded ? 'rotate-180' : ''}`}>
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                        {isUser && item.ai_triage_analysis?.patient_friendly_advice && (
                          <tr className="bg-blue-50/50">
                            <td colSpan={7} className="p-0 border-none">
                              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                isAiAdviceExpanded
                                  ? 'max-h-[500px] opacity-100 py-6 px-8 border-t border-blue-100'
                                  : 'max-h-0 opacity-0 py-0 px-8 border-t-transparent'
                              }`}>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-6 rounded-3xl border border-blue-100 space-y-2 text-left">
                                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] italic flex items-center gap-2">
                                    <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                                    Rekomendasi & Edukasi Pra-Pemeriksaan AI
                                  </p>
                                  <h4 className="text-sm font-black text-blue-900 italic uppercase tracking-tight">
                                    Tips Persiapan Kunjungan Gigi Anda
                                  </h4>
                                  <p className="text-slate-700 text-xs font-semibold leading-relaxed">
                                    {item.ai_triage_analysis.patient_friendly_advice}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-20 bg-blue-50/50">
                      <p className="text-blue-400 font-black italic uppercase tracking-widest text-xl">Tidak ada antrian saat ini</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Appointment Button */}
        <Link
          to="/portal/appointments/new"
          className="mt-12 group flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-12 rounded-[2rem] shadow-xl shadow-blue-100 transition-all transform hover:translate-y-[-2px] active:translate-y-0"
        >
          <div className="bg-white rounded-full p-2 shadow-inner group-hover:rotate-90 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span className="italic uppercase tracking-widest text-sm">Appointment Baru</span>
        </Link>
      </div>
    </PortalLayout>
  );
}
