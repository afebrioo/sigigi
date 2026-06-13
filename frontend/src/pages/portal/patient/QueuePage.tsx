import { useState, useEffect } from 'react';
import PortalLayout from '@/components/portal/PortalLayout';
import { api, getDefaultHeaders } from '@/lib/api';

const maskName = (name: string) => {
  if (!name) return 'Pasien';
  const parts = name.trim().split(/\s+/);
  return parts
    .map(part => {
      if (part.length <= 2) {
        return part[0] + '*';
      }
      return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
    })
    .join(' ');
};

export default function QueuePage() {
  const [time, setTime] = useState(new Date());
  const [queueData, setQueueData] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueue = async () => {
      let currentUserId: number | null = null;
      let currentUserRole: string | null = null;
      
      const userStr = localStorage.getItem('portal_user') || localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          currentUserId = Number(userObj.id || userObj.id_users);
          currentUserRole = userObj.role;
          setUserRole(currentUserRole);
        } catch (e) {}
      }

      try {
        const response = await fetch(`${api.queueToday}`, {
          headers: getDefaultHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          
          const getServiceTime = (priority?: string) => {
            if (priority === 'Tinggi' || priority === 'HIGH') return 30;
            if (priority === 'Sedang' || priority === 'MEDIUM') return 20;
            return 15; // default / Rendah
          };

          let cumulativeWait = 0;
          const mapped = data.map((item: any, index: number) => {
            let waitTimeText = '';
            let statusText = 'Menunggu';

            if (item.status === 'serving') {
              statusText = 'Sedang Dilayani';
              waitTimeText = 'Sedang Dilayani';
              cumulativeWait += getServiceTime(item.priority_level);
            } else {
              statusText = 'Menunggu';
              const serviceDuration = getServiceTime(item.priority_level);
              if (currentUserRole === 'doctor' || currentUserRole === 'admin') {
                // Untuk staff: Estimasi Selesai = waktu tunggu + waktu pelayanan pasien itu sendiri
                waitTimeText = `± ${cumulativeWait + serviceDuration} Menit`;
              } else {
                // Untuk pasien biasa: Estimasi Mulai Pemeriksaan (waktu tunggu)
                waitTimeText = `± ${cumulativeWait} Menit`;
              }
              cumulativeWait += serviceDuration;
            }

            let parsedTriage = null;
            if (item.ai_triage_analysis) {
              parsedTriage = typeof item.ai_triage_analysis === 'string'
                ? JSON.parse(item.ai_triage_analysis)
                : item.ai_triage_analysis;
            }

            return {
              no: index + 1,
              name: item.patient_name || 'Tanpa Nama',
              estimate: waitTimeText,
              status: statusText,
              isUser: Number(item.user_id) === currentUserId,
              priority: item.priority_level || 'Rendah',
              ai_triage_analysis: parsedTriage
            };
          });
          setQueueData(mapped);
        }
      } catch (error) {
        console.error("Gagal fetch queue", error);
      }
    };

    fetchQueue();

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour12: false });
  };

  const userQueue = queueData.find(q => q.isUser);

  return (
    <PortalLayout role="patient">
      <div className="max-w-4xl mx-auto py-10 flex flex-col items-center">

        {/* Queue Header Badge */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm italic">
            Status Antrian Anda
          </span>
        </div>

        {/* Large Queue Number Box (Premium Design) */}
        <div className="relative group w-48 h-48 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-[3rem] flex flex-col items-center justify-center shadow-2xl shadow-blue-200/80 border-4 border-white transform transition-all hover:scale-105 hover:shadow-blue-300/80 duration-300 overflow-hidden mb-8">
          {/* Decorative floating blur bubbles */}
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl transition-all group-hover:scale-110 duration-500"></div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-300/20 rounded-full blur-xl transition-all group-hover:scale-110 duration-500"></div>
          
          <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.25em] italic mb-1 z-10 opacity-90">
            Nomor
          </span>
          <span className="text-7xl font-black text-white leading-none z-10 drop-shadow-md tracking-tighter">
            {userQueue?.no !== undefined ? String(userQueue.no).padStart(2, '0') : '--'}
          </span>
          <span className="text-[9px] font-black text-blue-100 uppercase tracking-widest mt-2 z-10 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">
            Antrian Aktif
          </span>
        </div>

        {/* Live Clock (Premium Style) */}
        <div className="flex flex-col items-center mb-12">
          <span className="text-[9px] font-black uppercase text-blue-400 tracking-[0.25em] italic mb-1">
            Waktu Lokal Sekarang
          </span>
          <div className="text-5xl font-black bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tighter drop-shadow-sm">
            {formatTime(time)}
          </div>
        </div>

        {/* AI Pre-triage Advice Card for Logged-in Patient */}
        {(() => {
          if (!userQueue?.ai_triage_analysis?.patient_friendly_advice) return null;
          return (
            <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50/50 p-6 rounded-[2rem] border-2 border-blue-500 shadow-xl shadow-blue-50/50 mb-10 space-y-3 text-left">
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] italic flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                Rekomendasi & Edukasi Pra-Pemeriksaan AI
              </p>
              <h4 className="text-lg font-black text-blue-900 italic uppercase tracking-tight">
                Tips Persiapan Kunjungan Gigi Anda
              </h4>
              <p className="text-slate-700 text-xs font-semibold leading-relaxed">
                {userQueue.ai_triage_analysis.patient_friendly_advice}
              </p>
            </div>
          );
        })()}

        {/* Queue Table */}
        <div className="w-full bg-blue-50/50 rounded-3xl p-6 border border-blue-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px] md:min-w-full">
              <thead>
                <tr className="border-b-2 border-blue-100">
                  <th className="py-3 px-4 text-blue-800 font-bold italic">No</th>
                  <th className="py-3 px-4 text-blue-800 font-bold italic">Nama Pasien</th>
                  <th className="py-3 px-4 text-blue-800 font-bold italic">
                    {userRole === 'doctor' || userRole === 'admin' ? 'Estimasi Selesai' : 'Estimasi Pemeriksaan'}
                  </th>
                  <th className="py-3 px-4 text-blue-800 font-bold italic">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {queueData.length > 0 ? queueData.map((item, idx) => (
                  <tr key={idx} className={`${item.isUser ? 'bg-blue-100/50' : ''} transition-colors`}>
                    <td className="py-4 px-4 text-blue-700 font-bold">{item.no}</td>
                    <td className="py-4 px-4 text-blue-700 font-medium whitespace-nowrap">
                      {item.isUser
                        ? `${item.name} (Anda)`
                        : (
                          <span className="select-none text-blue-600/60 font-bold tracking-wide italic blur-[0.5px]">
                            {maskName(item.name)}
                          </span>
                        )
                      }
                    </td>
                    <td className="py-4 px-4 text-blue-600 font-medium">{item.estimate}</td>
                    <td className="py-4 px-4">
                      <span className={`
                        px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm whitespace-nowrap
                        ${item.status === 'Sedang Dilayani' ? 'bg-blue-400 text-white' : ''}
                        ${item.status === 'Menunggu' ? 'bg-blue-200 text-blue-800' : ''}
                      `}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center py-10 font-bold text-blue-400">Belum ada antrian.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-8 text-blue-300 text-sm font-bold italic text-center px-10">
          * Harap tiba di klinik 10 menit sebelum estimasi waktu pemeriksaan anda.
        </p>

      </div>
    </PortalLayout>
  );
}
