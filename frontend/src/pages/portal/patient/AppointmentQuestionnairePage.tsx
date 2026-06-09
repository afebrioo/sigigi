import React, { useState, useEffect } from 'react';
import PortalLayout from '@/components/portal/PortalLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, getDefaultHeaders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AppointmentQuestionnairePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const reservationData = location.state?.reservationData || {};

  // Safeguard: if reservationData is missing mandatory fields, redirect to step 1
  useEffect(() => {
    if (!reservationData || !reservationData.namaLengkap || !reservationData.nomorHandphone || !reservationData.tanggalKunjungan) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Data registrasi tidak lengkap atau hilang. Silakan isi form dari awal.",
        variant: "destructive"
      });
      navigate('/portal/appointments/new');
    }
  }, [reservationData, navigate, toast]);

  const [answers, setAnswers] = useState<any>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
    q8: '',
    q9: '',
    q10: '',
    keluhan: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tindakan, setTindakan] = useState('Cabut Gigi');
  const [isLoading, setIsLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const questionsList = [
    { id: 'q1', text: 'Apakah Anda merasakan nyeri gigi secara terus-menerus selama lebih dari 2 hari?' },
    { id: 'q2', text: 'Apakah terdapat gigi berlubang yang terasa sangat sakit saat terkena makanan atau minuman?' },
    { id: 'q3', text: 'Apakah Anda mengalami pembengkakan pada area rahang atau wajah?' },
    { id: 'q4', text: 'Apakah Anda sulit tidur akibat rasa sakit pada gigi atau mulut?' },
    { id: 'q5', text: 'Apakah gusi Anda sering berdarah secara spontan (tanpa dipicu sikat gigi)?' },
    { id: 'q6', text: 'Apakah Anda mengalami kesulitan membuka mulut secara normal?' },
    { id: 'q7', text: 'Apakah gigi Anda terasa goyang atau tidak stabil?' },
    { id: 'q8', text: 'Apakah Anda merasa nyeri atau tidak nyaman saat mengunyah makanan?' },
    { id: 'q9', text: 'Apakah Anda mengalami demam yang disertai rasa sakit pada gigi atau gusi?' },
    { id: 'q10', text: 'Apakah Anda pernah mengalami cedera atau benturan pada area gigi atau rahang baru-baru ini?' }
  ];

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all 10 questions are answered
    const unanswered = questionsList.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      toast({
        title: "Kuesioner Belum Lengkap",
        description: "Mohon jawab semua pertanyaan kuesioner sebelum menyelesaikan pendaftaran.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const userStr = localStorage.getItem('portal_user');
      if (!userStr) throw new Error("Anda harus login kembali.");

      let imageUrl = null;

      if (image) {
        const formData = new FormData();
        formData.append('image', image);

        const uploadRes = await fetch(api.upload, {
          method: 'POST',
          headers: {
            'Authorization': getDefaultHeaders(false).Authorization || ''
          },
          body: formData
        });

        if (!uploadRes.ok) throw new Error('Gagal upload gambar');
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const inputDate = reservationData.tanggalKunjungan;
      const inputTime = reservationData.waktuKunjungan ? reservationData.waktuKunjungan.replace('.', ':') : '09:00';

      const response = await fetch(api.appointments, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          appointment_date: inputDate || new Date().toISOString().split('T')[0],
          appointment_time: inputTime,
          id_klinik: Number(reservationData.id_klinik || 1),
          patient_name: reservationData.namaLengkap,
          patient_phone: reservationData.nomorHandphone,
          patient_gender: reservationData.jenisKelamin,
          patient_birth_date: reservationData.tanggalLahir,
          patient_address: reservationData.alamat,
          action_type: tindakan,
          questionnaire: answers,
          image_url: imageUrl,
          nik: reservationData.nik,
          email: reservationData.email,
          tempat_lahir: reservationData.tempatLahir,
          golongan_darah: reservationData.golonganDarah,
          kontak_darurat_nama: reservationData.kontakDaruratNama,
          kontak_darurat_telepon: reservationData.kontakDaruratTelepon,
          kontak_darurat_relasi: reservationData.kontakDaruratRelasi
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        if (errData.errors) {
          const messages = Object.values(errData.errors).flat().join('\n');
          throw new Error(messages);
        }
        throw new Error(errData.message || 'Gagal menyimpan appointment');
      }

      toast({
        title: "Sukses",
        description: "Appointment berhasil disimpan!",
      });
      navigate('/portal/appointments');

    } catch (error: any) {
      toast({
        title: "Terjadi Kesalahan",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setIsAgreed(false);
    }
  };

  const handleSelectOption = (name: string, value: string) => {
    setAnswers({ ...answers, [name]: value });
  };

  // Helper to count answered questions for progress indicator
  const answeredCount = questionsList.filter(q => answers[q.id] && answers[q.id] !== '').length;

  return (
    <PortalLayout role="patient">
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Title and Progress Bar */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Appointment Baru</h1>
          <p className="text-slate-500 font-medium">Langkah Terakhir: Kuesioner Analisis Gigi & Mulut</p>
        </div>

        {/* Progress indicator */}
        <div className="max-w-2xl mx-auto mb-8 bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(answeredCount / 10) * 100}%` }}
          ></div>
          <div className="flex justify-between text-xs text-slate-400 font-semibold mt-1 px-1">
            <span>Progres Pengisian</span>
            <span>{answeredCount} dari 10 Terjawab</span>
          </div>
        </div>

        {/* Action Type Selection Dropdown */}
        <div className="max-w-xl mx-auto mb-10">
          <label className="block text-sm font-bold text-slate-600 mb-2 text-center">Tindakan Medis yang Diperlukan</label>
          <select
            value={tindakan}
            onChange={(e) => setTindakan(e.target.value)}
            className="w-full border border-slate-200 shadow-sm p-4 rounded-2xl text-center text-slate-700 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
          >
            <option value="Cabut Gigi">Cabut Gigi</option>
            <option value="Tambal Gigi">Tambal Gigi</option>
            <option value="Control">Control</option>
            <option value="Bersihkan Karang Gigi">Bersihkan Karang Gigi</option>
            <option value="Pasang Behel">Pasang Behel</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <form onSubmit={handleFinish} className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Silakan jawab kuesioner keluhan berikut:</h2>

          {/* Render 10 Questions Dynamically with premium buttons */}
          {questionsList.map((q, idx) => {
            const currentAnswer = answers[q.id];
            return (
              <div 
                key={q.id} 
                className={`p-6 rounded-3xl border transition-all duration-300 ${
                  currentAnswer 
                    ? 'bg-white border-slate-200 shadow-md shadow-slate-100/50' 
                    : 'bg-slate-50/50 border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div className="flex-grow">
                    <h3 className="text-base font-bold text-slate-800 leading-relaxed mb-4">
                      {q.text}
                    </h3>
                    
                    {/* Custom Premium Option Buttons (Ya = Red, Tidak = Blue on select) */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleSelectOption(q.id, 'YA')}
                        className={`py-3 px-5 rounded-2xl font-bold border-2 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 ${
                          currentAnswer === 'YA'
                            ? 'bg-red-50 border-red-500 text-red-600 shadow-sm shadow-red-100'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          currentAnswer === 'YA' ? 'border-red-500 bg-red-500' : 'border-slate-300'
                        }`}>
                          {currentAnswer === 'YA' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                        YA
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectOption(q.id, 'TIDAK')}
                        className={`py-3 px-5 rounded-2xl font-bold border-2 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 ${
                          currentAnswer === 'TIDAK'
                            ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm shadow-blue-100'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          currentAnswer === 'TIDAK' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                        }`}>
                          {currentAnswer === 'TIDAK' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                        TIDAK
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Textarea Deskripsi Keluhan Gigi */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm mt-8">
            <h3 className="text-base font-bold text-slate-850 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">✍</span>
              Deskripsi Keluhan Gigi Anda (Opsional)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tuliskan detail rasa sakit, lokasi gigi yang bermasalah, atau keluhan tambahan yang Anda rasakan secara bebas.
            </p>
            <textarea
              rows={4}
              value={answers.keluhan || ''}
              onChange={(e) => setAnswers({ ...answers, keluhan: e.target.value })}
              placeholder="Contoh: Gigi geraham belakang bawah kanan terasa ngilu sekali saat minum air dingin..."
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl p-4 focus:outline-none transition-all font-medium text-slate-800 text-sm"
            />
          </div>

          {/* Contoh Foto Gigi Section */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm mt-8">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">ℹ</span>
              Panduan & Contoh Foto Gigi
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Silakan ikuti contoh di bawah ini untuk mengambil foto gigi Anda agar analisis kecerdasan buatan dapat bekerja dengan akurat.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <img 
                src="/contoh_foto_gigi.png" 
                alt="Contoh Foto Gigi" 
                className="w-full md:w-48 h-48 md:h-32 object-cover rounded-xl border border-slate-200 shadow-sm"
              />
              <div className="flex-1 text-xs text-slate-600 space-y-2">
                <p className="font-bold text-slate-700 text-sm">Cara Mengambil Foto yang Baik:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Gunakan kamera belakang dengan pencahayaan terang (atau flash jika diperlukan).</li>
                  <li>Buka mulut cukup lebar sehingga gigi yang bermasalah terlihat jelas.</li>
                  <li>Posisikan kamera sejajar dengan gigi dan pastikan gambar fokus (tidak buram).</li>
                  <li>Hindari jari atau objek lain yang menutupi area gigi dan gusi.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="p-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-sm mt-8">
            <h3 className="text-base font-bold text-slate-800 text-center mb-1">Upload Foto Gigi (Opsional)</h3>
            <p className="text-xs text-slate-400 text-center mb-6">Foto gigi/rongga mulut akan dianalisis otomatis menggunakan kecerdasan buatan.</p>
            
            <div className="flex flex-col items-center gap-4 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="tooth-image-upload"
              />
              <label
                htmlFor="tooth-image-upload"
                className="cursor-pointer bg-slate-800 text-white font-bold px-8 py-3 rounded-2xl hover:bg-slate-900 transition-all shadow-md active:scale-98"
              >
                Pilih Foto
              </label>

              {preview && (
                <div className="mt-4 flex flex-col items-center w-full max-w-md">
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={preview} alt="Tooth preview" className="w-48 h-48 object-cover" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium mb-4">{image?.name}</p>
                  
                  {/* Checkbox Persetujuan */}
                  <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-all w-full text-left">
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="mt-1 w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed font-medium">
                      Saya menyetujui <span className="font-bold text-slate-800">Syarat & Ketentuan</span> analisis AI bahwa foto gigi yang diunggah akan digunakan untuk kepentingan diagnosis medis dan data privasi akan dijaga secara aman.
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={isLoading || (image !== null && !isAgreed)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-blue-100 hover:shadow-blue-200/50 transform hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-wide"
            >
              {isLoading ? 'Menyimpan...' : 'Selesaikan Pendaftaran'}
            </button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}

