import { useState, useEffect } from 'react';
import PortalLayout from '@/components/portal/PortalLayout';
import { useNavigate } from 'react-router-dom';
import { api, getDefaultHeaders } from '@/lib/api';
import { rekamMedisService } from '@/services/tindakan-medis';
import { useToast } from '@/hooks/use-toast';

export default function PatientHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('portal_isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/portal/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${api.appointments}?status=completed`, {
          headers: getDefaultHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          const mapped = data.map((item: any) => {
            const q = typeof item.questionnaire === 'object' && item.questionnaire ? item.questionnaire : {};
            const ai = q.ai_analysis;

            const keluhanParts = [];
            if (q.q1) keluhanParts.push(`Nyeri gusi: ${q.q1}`);
            if (q.q2) keluhanParts.push(`Lubang gigi: ${q.q2}`);
            if (q.q3) keluhanParts.push(`Pembengkakan: ${q.q3}`);

            return {
              id: `RM-${item.id.toString().padStart(5, '0')}`,
              rawId: item.rekam_medis?.id_rekam_medis || null,
              date: new Date(item.appointment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
              doctor: 'Dokter Klinik Sigigi',
              action_type: item.action_type || '-',
              diagnosis: q.diagnosis || item.action_type || '-',
              treatment: q.treatment || item.action_type || '-',
              notes: q.notes || (keluhanParts.length > 0 ? keluhanParts.join(' | ') : 'Tidak ada catatan'),
              keluhan: keluhanParts.join(' | ') || 'Tidak ada',
              ai_prediction: ai ? ai.prediction : null,
              ai_confidence: ai ? ai.confidence : null,
              image_url: item.image_url || null,
              status: 'Selesai',
              price: q.price || 'Dibayar',
            };
          });
          setMedicalRecords(mapped);
        }
      } catch (error) {
        console.error("Gagal mengambil data riwayat", error);
      }

      setIsLoading(false);
    };

    fetchHistory();
  }, []);

  const handlePrint = async (rawId: number | string) => {
    try {
      const blob = await rekamMedisService.printRekamMedis(Number(rawId));
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error printing medical record:', error);
      toast({
        title: "Gagal Cetak",
        description: "Gagal mencetak rekam medis. Pastikan rekam medis sudah dibuat oleh dokter.",
        variant: "destructive"
      });
    }
  };

  return (
    <PortalLayout role="patient">
      <div className="max-w-5xl mx-auto py-10 px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-blue-900 italic tracking-tighter uppercase">Rekam Medis Saya</h1>
            <p className="text-blue-600 font-bold italic tracking-wide uppercase text-sm mt-1">Riwayat Kesehatan Gigi & Mulut</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="Cari diagnosis atau tindakan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-2 border-blue-100 rounded-2xl px-6 py-3 pl-12 outline-none focus:border-blue-600 transition-all font-bold text-blue-900 shadow-lg shadow-blue-50 w-full md:w-80"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-600 transition-colors">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="grid grid-cols-1 gap-8">
          {isLoading ? (
            <div className="text-center py-20 bg-blue-50/50 rounded-3xl">
              <p className="text-blue-400 font-black italic uppercase tracking-widest text-xl">Loading Data...</p>
            </div>
          ) : medicalRecords.length === 0 ? (
            <div className="text-center py-20 bg-blue-50/50 rounded-3xl border-2 border-dashed border-blue-200">
              <p className="text-blue-400 font-black italic uppercase tracking-widest text-xl">Belum ada Rekam Medis</p>
            </div>
          ) : (
            medicalRecords
            .filter(record =>
              record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
              record.treatment.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-[2.5rem] border-2 border-blue-50 hover:border-blue-600 transition-all shadow-xl shadow-blue-100 overflow-hidden group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Date Column */}
                  <div className="bg-blue-600 md:w-48 p-8 flex flex-col items-center justify-center text-center">
                    <span className="text-white/70 font-black uppercase tracking-widest text-[10px] mb-2">{record.id}</span>
                    <span className="text-white text-2xl font-black leading-tight italic">{record.date.split(' ')[0]}</span>
                    <span className="text-white/90 font-bold uppercase tracking-widest text-xs">{record.date.split(' ').slice(1).join(' ')}</span>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 p-8 md:p-10 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-blue-100 italic">
                            {record.doctor}
                          </span>
                          {record.ai_prediction && (
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${record.ai_prediction === 'karies' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              AI: {record.ai_prediction === 'karies' ? `⚠ Karies (${record.ai_confidence}%)` : `✓ Non-Karies (${record.ai_confidence}%)`}
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-black text-blue-900 tracking-tight italic uppercase">{record.treatment}</h2>
                      </div>
                      {record.rawId && (
                        <button
                          onClick={() => handlePrint(record.rawId)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-4 rounded-2xl transition-all active:scale-95 group/btn border border-blue-100"
                          title="Cetak PDF"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:scale-110 transition-transform">
                            <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-blue-50">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic">Diagnosis</p>
                        <p className="text-blue-900 font-bold">{record.diagnosis}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic">Biaya Layanan</p>
                        <p className="text-blue-600 font-black">{record.price}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic">Keluhan Awal</p>
                        <p className="text-blue-800/80 font-medium text-sm italic">{record.keluhan}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] italic">Catatan Dokter</p>
                        <p className="text-blue-800/80 font-medium text-sm italic">{record.notes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legend/Info Section */}
        <div className="mt-16 bg-blue-50/50 rounded-3xl p-8 border-2 border-dashed border-blue-200 text-center">
          <p className="text-blue-600 font-bold italic">Rekam medis ini bersifat rahasia dan dikelola sesuai protokol keamanan data kesehatan.</p>
          <p className="text-blue-400 text-sm mt-2">Hubungi admin sigigi jika terdapat ketidaksesuaian data.</p>
        </div>
      </div>
    </PortalLayout>
  );
}
