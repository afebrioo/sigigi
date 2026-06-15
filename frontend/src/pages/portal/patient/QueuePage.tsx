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

            return {
              no: index + 1,
              name: item.patient_name || 'Tanpa Nama',
              estimate: waitTimeText,
              status: statusText,
              isUser: Number(item.user_id) === currentUserId,
              priority: item.priority_level || 'Rendah'
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

        <h2 className="text-xl font-bold text-blue-600 mb-6 italic text-center">Kamu Antrian Nomor</h2>

        {/* Large Queue Number Box */}
        <div className="w-48 h-48 bg-blue-100 rounded-[2.5rem] flex items-center justify-center shadow-inner border border-blue-200 mb-6">
          <span className="text-[100px] font-black text-blue-600 leading-none">
            {userQueue?.no || '-'}
          </span>
        </div>

        {/* Live Clock */}
        <div className="text-7xl font-black text-blue-700 mb-12 tracking-tighter">
          {formatTime(time)}
        </div>

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
