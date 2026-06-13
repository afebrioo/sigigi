import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getDefaultHeaders, getCleanImageUrl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";

import { DataTable } from '@/pages/tindakan/components/data-table';
import { treatmentColumns } from '@/pages/tindakan/components/columns';
import { TreatmentForm } from '@/pages/tindakan/components/treatment-form';
import { PrescriptionForm } from '@/pages/tindakan/components/prescription-form';
import { TreatmentData, PrescriptionData } from '@/services/tindakan-medis';
import { Odontogram } from '@/pages/tindakan/components/odontogram';

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('info');
  const [treatments, setTreatments] = useState<TreatmentData[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [complaints, setComplaints] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [odontogramData, setOdontogramData] = useState<any[]>([]);
  const [odontogramUpdates, setOdontogramUpdates] = useState<any[]>([]);
  const [isOdontogramModalOpen, setIsOdontogramModalOpen] = useState(false);
  const [selectedToothForModal, setSelectedToothForModal] = useState<{ number: string, position: string } | null>(null);
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${api.appointments}/${id}`, {
          headers: getDefaultHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          setAppointment(data);
          // Set initial complaints from keluhan or notes if available
          if (data.questionnaire?.keluhan) {
            setComplaints(data.questionnaire.keluhan);
          } else if (data.questionnaire?.notes) {
            setComplaints(data.questionnaire.notes);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil detail pasien", error);
      }
      setIsLoading(false);
    };
    if (id) fetchDetail();
  }, [id]);

  useEffect(() => {
    if (appointment?.master_pasien?.id_pasien) {
      fetch(`${api.odontogram}/${appointment.master_pasien.id_pasien}`, { headers: getDefaultHeaders() })
        .then(res => res.json())
        .then(data => {
          if (data.data) setOdontogramData(data.data);
        })
        .catch(err => console.error("Gagal load odontogram", err));
    }
  }, [appointment?.master_pasien?.id_pasien]);

  const handleSelectTooth = (toothNumber: string, position: string) => {
    setSelectedToothForModal({ number: toothNumber, position: position });
    setIsOdontogramModalOpen(true);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const response = await fetch(api.analyzeAppointment(id!), {
        method: 'POST',
        headers: getDefaultHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Analisis gagal.');
      }
      setAppointment(data.appointment);
    } catch (err: any) {
      setAnalyzeError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateTotalCost = () => {
    const treatmentCost = treatments.reduce((sum, t) => sum + (t.totalCost || 0), 0);
    const prescriptionCost = prescriptions.reduce((sum, p) => sum + (p.cost || 0), 0);
    return treatmentCost + prescriptionCost;
  };

  const calculateFinalTotal = () => {
    return calculateTotalCost() - discount;
  };

  const handleAddTreatment = (treatmentData: TreatmentData) => {
    setTreatments([...treatments, treatmentData]);
  };

  const handleDeleteTreatment = (index: number) => {
    setTreatments(treatments.filter((_, i) => i !== index));
  };

  const handleAddPrescription = (prescriptionData: PrescriptionData) => {
    setPrescriptions([...prescriptions, prescriptionData]);
  };

  const handleDeletePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleFinishClick = () => {
    setIsFinishConfirmOpen(true);
  };

  const executeFinish = async () => {
    setIsFinishConfirmOpen(false);
    setIsSaving(true);
    try {
      const payload = {
        keluhan: complaints,
        catatan_dokter: doctorNotes,
        treatments: treatments.map(t => ({
          id_penyakit: t.diseaseId,
          id_tindakan: t.treatmentId,
          nomor_gigi: t.location,
          posisi_gigi: null,
          catatan: t.notes,
          totalCost: t.totalCost
        })),
        prescriptions: prescriptions.map(p => ({
          id_obat: p.drugId,
          jumlah: p.quantity,
          aturan_pakai: p.dosage,
          catatan: p.notes,
          cost: p.cost
        })),
        biaya_akhir: calculateFinalTotal(),
        diskon: discount,
        status_pembayaran: 'Belum Bayar'
      };

      const response = await fetch(api.finalizeAppointment(id!), {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error Unknown');
      }

      // Save odontogram if there are updates
      if (odontogramUpdates.length > 0) {
         try {
           await fetch(`${api.odontogram}/batch`, {
             method: 'POST',
             headers: getDefaultHeaders(),
             body: JSON.stringify({
               id_pasien: appointment.master_pasien.id_pasien,
               updates: odontogramUpdates
             })
           });
         } catch (e) {
           console.error("Gagal simpan odontogram", e);
         }
      }

      toast({
        title: "Pemeriksaan Selesai",
        description: "Laporan pemeriksaan dan rekam medis berhasil disimpan.",
      });
      navigate('/doctor/pemeriksaan');
    } catch (err: any) {
      toast({
        title: "Gagal Menyimpan",
        description: "Gagal: " + err.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} tahun`;
  };

  if (isLoading) return <div className="p-20 text-center font-black text-blue-500">Loading Patient Data...</div>;
  if (!appointment) return <div className="p-20 text-center font-black text-red-500">Data Tidak Ditemukan!</div>;

  const mp = appointment.master_pasien || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100 border-2 border-blue-600 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-blue-900 italic tracking-tighter uppercase">{appointment.patient_name || 'Tanpa Nama'}</h1>
                <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">Tipe: {appointment.action_type || 'Umum'}</span>
              </div>
              <p className="text-blue-600 font-bold italic mt-1 tracking-wide uppercase text-sm">Rekam Medis Pasien {mp.no_rekam_medis ? `(${mp.no_rekam_medis})` : ''}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/doctor/pemeriksaan')}
              className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-black px-8 py-4 rounded-2xl shadow-lg transition-all transform active:scale-95 uppercase tracking-widest text-xs"
            >
              Kembali
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Patient Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info Card */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-blue-50 border border-blue-50">
              <h2 className="text-xl font-black text-blue-900 mb-8 italic uppercase tracking-widest border-b-2 border-blue-100 pb-2">Informasi Kontak</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">No. RM</p>
                    <p className="text-blue-900 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase">{mp.no_rekam_medis || '-'}</p>
                  </div>
                  <div className="group">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">NIK</p>
                    <p className="text-blue-900 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase">{mp.nik || '-'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Jenis Kelamin</p>
                    <p className="text-blue-900 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase">
                      {appointment.patient_gender === 'L' ? 'Laki-laki' : appointment.patient_gender === 'P' ? 'Perempuan' : '-'}
                    </p>
                  </div>
                  <div className="group">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Gol. Darah</p>
                    <p className="text-blue-900 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase">{mp.golongan_darah || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Tempat Lahir</p>
                    <p className="text-blue-900 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase">{mp.tempat_lahir || '-'}</p>
                  </div>
                  <div className="group">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Tgl Lahir</p>
                    <p className="text-blue-900 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase">{appointment.patient_birth_date || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Usia</p>
                    <p className="text-blue-900 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase">{calculateAge(appointment.patient_birth_date)}</p>
                  </div>
                  <div className="group">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Telepon</p>
                    <p className="text-blue-900 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase">{appointment.patient_phone || '-'}</p>
                  </div>
                </div>
                
                <div className="group">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Email</p>
                  <p className="text-blue-900 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase">{mp.email || '-'}</p>
                </div>

                <div className="group">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Alamat</p>
                  <p className="text-blue-900 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase">{appointment.patient_address || '-'}</p>
                </div>
                <div className="group">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Tindakan Diminta</p>
                  <p className="text-blue-900 font-bold text-lg group-hover:text-blue-600 transition-colors">{appointment.action_type || '-'}</p>
                </div>
                <div className="group">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Kuesioner Keluhan (Kondisi Gigi)</p>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 mt-2">
                    {appointment.questionnaire && typeof appointment.questionnaire === 'object' ? (
                      (() => {
                        const questionsList = [
                          { id: 'q1', label: 'Nyeri Gigi > 2 Hari' },
                          { id: 'q2', label: 'Gigi Berlubang Sakit' },
                          { id: 'q3', label: 'Bengkak Rahang/Wajah' },
                          { id: 'q4', label: 'Sulit Tidur' },
                          { id: 'q5', label: 'Gusi Berdarah Spontan' },
                          { id: 'q6', label: 'Sulit Buka Mulut' },
                          { id: 'q7', label: 'Gigi Goyang' },
                          { id: 'q8', label: 'Nyeri Mengunyah' },
                          { id: 'q9', label: 'Demam + Sakit Gigi' },
                          { id: 'q10', label: 'Cedera Gigi/Rahang' }
                        ];

                        const hasAnswers = questionsList.some(q => appointment.questionnaire[q.id] !== undefined);

                        if (!hasAnswers) {
                          return <p className="text-blue-400 italic text-xs">Tidak ada jawaban kuesioner</p>;
                        }

                        return questionsList.map((q) => {
                          const ans = appointment.questionnaire[q.id];
                          const isYa = String(ans).toUpperCase() === 'YA';
                          return (
                            <div key={q.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
                              <span className="text-xs font-bold text-slate-700">{q.label}</span>
                              {ans ? (
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                  isYa 
                                    ? 'bg-red-50 text-red-600 border border-red-100' 
                                    : 'bg-green-50 text-green-600 border border-green-100'
                                }`}>
                                  {isYa ? 'YA' : 'TIDAK'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold italic">-</span>
                              )}
                            </div>
                          );
                        });
                      })()
                    ) : (
                      <p className="text-blue-400 italic text-xs">Data tidak tersedia</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis & Treatment Planning */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Analysis Integration */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-blue-50 border border-blue-50">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black text-blue-900 italic uppercase tracking-widest border-b-2 border-blue-100 pb-2">Analisis AI (CNN + LLM)</h2>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  appointment.questionnaire?.ai_analysis || appointment.ai_triage_analysis
                    ? 'bg-green-50 text-green-600 border-green-100'
                    : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                }`}>
                  {appointment.questionnaire?.ai_analysis || appointment.ai_triage_analysis ? 'Analisis Selesai' : 'Belum Dianalisis'}
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100">
                <div className="w-56 h-56 bg-white rounded-3xl border-2 border-blue-600 border-dashed flex items-center justify-center relative shadow-inner group overflow-hidden flex-shrink-0">
                  {appointment.image_url ? (
                    <img src={getCleanImageUrl(appointment.image_url)} alt="XRay" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  )}
                  {appointment.image_url && (
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors flex items-center justify-center cursor-pointer" onClick={() => window.open(getCleanImageUrl(appointment.image_url), '_blank')}>
                      <span className="text-white font-black italic text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">Lihat Penuh</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Hasil Citra CNN</p>
                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        {isAnalyzing ? 'Menganalisis...' : 'Jalankan Analisis AI'}
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {appointment.questionnaire?.ai_analysis ? (
                        <span className={`text-white px-3 py-1 rounded-lg text-xs font-black italic ${appointment.questionnaire.ai_analysis.prediction === 'karies' ? 'bg-red-500' : 'bg-green-500'}`}>
                          {appointment.questionnaire.ai_analysis.prediction === 'karies' ? 'Karies' : 'Non-Karies'} ({appointment.questionnaire.ai_analysis.confidence}%)
                        </span>
                      ) : (
                        <span className="bg-gray-400 text-white px-3 py-1 rounded-lg text-xs font-black italic">Tidak Ada Citra Scan</span>
                      )}
                      {analyzeError && (
                        <span className="text-red-500 text-[10px] font-bold italic block w-full mt-1">{analyzeError}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-blue-600 font-bold italic text-xs px-2">* Analisis citra dihasilkan oleh EfficientNet-B0 dan late-fusion anamnesis dianalisis oleh Gemini.</p>
                </div>
              </div>

              {/* LLM Late-Fusion Triage Section */}
              {appointment.ai_triage_analysis && (
                <div className="mt-8 border-t border-blue-100 pt-8 space-y-6">
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider italic">Hasil Late-Fusion LLM Triage</h3>
                  
                  {/* Urgency and Score */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                      <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mb-1 italic">Prioritas Antrian (Triage)</p>
                      <p className="text-red-900 font-black text-sm uppercase tracking-wider">
                        {appointment.priority_level || appointment.ai_triage_analysis.urgency_level || 'Rendah'}
                      </p>
                    </div>
                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                      <p className="text-[9px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1 italic">Skor Urgensi (0-10)</p>
                      <p className="text-purple-900 font-black text-sm">
                        {appointment.urgency_score ?? appointment.ai_triage_analysis.urgency_score ?? 0} / 10
                      </p>
                    </div>
                  </div>

                  {/* Symptoms Extracted */}
                  {appointment.ai_triage_analysis.extracted_symptoms && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Gejala Utama Terdeteksi (LLM)</p>
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-700">
                        <div>
                          <span className="block text-[8px] text-slate-400 font-black uppercase">Pemicu Nyeri</span>
                          <span className="italic">{appointment.ai_triage_analysis.extracted_symptoms.pain_trigger || '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-black uppercase">Durasi</span>
                          <span className="italic">{appointment.ai_triage_analysis.extracted_symptoms.duration_days ? `${appointment.ai_triage_analysis.extracted_symptoms.duration_days} hari` : '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-black uppercase">Lokasi Gigi</span>
                          <span className="italic">{appointment.ai_triage_analysis.extracted_symptoms.location || '-'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Anamnesis Draft with Copy Button */}
                  <div className="space-y-2 bg-blue-50/30 p-5 rounded-2xl border border-blue-100/70 relative group/draft">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] italic">Draf Anamnesis Formal (Dokter)</p>
                      <button
                        type="button"
                        onClick={() => {
                          const draft = appointment.anamnesis_draft || appointment.ai_triage_analysis?.anamnesis_draft;
                          if (draft) {
                            setDoctorNotes(draft);
                            toast({
                              title: "Draf Disalin",
                              description: "Draf anamnesis berhasil disalin ke Catatan Dokter."
                            });
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider transition-colors active:scale-95 transform"
                      >
                        Salin ke Catatan Dokter
                      </button>
                    </div>
                    <p className="text-blue-950 font-semibold text-xs leading-relaxed italic">
                      {appointment.anamnesis_draft || appointment.ai_triage_analysis.anamnesis_draft}
                    </p>
                  </div>

                  {/* Clinical Reasoning */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Justifikasi Klinis</p>
                    <p className="text-slate-650 text-xs leading-relaxed font-semibold italic text-slate-600">
                      {appointment.ai_triage_analysis.clinical_reasoning}
                    </p>
                  </div>

                  {/* Patient Friendly Advice */}
                  <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Saran Edukasi Pasien (Sisi Pasien)</p>
                    <p className="text-slate-700 text-xs leading-relaxed font-medium">
                      {appointment.ai_triage_analysis.patient_friendly_advice}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tindakan Medis - Tabs */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-blue-50 border border-blue-50">
              <h2 className="text-xl font-black text-blue-900 mb-8 italic uppercase tracking-widest border-b-2 border-blue-100 pb-2">Rencana Tindakan Medis</h2>
              
              <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 w-full flex overflow-x-auto bg-blue-50/50 p-2 rounded-2xl">
                  <TabsTrigger value="info" className="rounded-xl flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold italic tracking-wide">Pemeriksaan</TabsTrigger>
                  <TabsTrigger value="odontogram" className="rounded-xl flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold italic tracking-wide">Odontogram</TabsTrigger>
                  <TabsTrigger value="treatment" className="rounded-xl flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold italic tracking-wide">Tindakan</TabsTrigger>
                  <TabsTrigger value="prescription" className="rounded-xl flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold italic tracking-wide">Resep Obat</TabsTrigger>
                  <TabsTrigger value="summary" className="rounded-xl flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold italic tracking-wide">Ringkasan</TabsTrigger>
                </TabsList>
                
                {/* Tab Informasi Kunjungan */}
                <TabsContent value="info">
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-0 space-y-6">
                      <div className="space-y-3">
                        <label htmlFor="complaints" className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-4 italic">Keluhan Pasien</label>
                        <textarea
                          id="complaints"
                          rows={4}
                          className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-3xl p-6 outline-none transition-all font-bold text-blue-900 shadow-inner"
                          value={complaints}
                          onChange={(e) => setComplaints(e.target.value)}
                          placeholder="Masukkan keluhan utama..."
                        />
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="doctorNotes" className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-4 italic">Catatan Dokter</label>
                        <textarea
                          id="doctorNotes"
                          rows={4}
                          className="w-full bg-blue-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-3xl p-6 outline-none transition-all font-bold text-blue-900 shadow-inner"
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="Masukkan diagnosis atau observasi klinis..."
                        />
                      </div>
                      <Button onClick={() => setActiveTab('odontogram')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs mt-4">
                        Lanjut ke Odontogram
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Tab Odontogram */}
                <TabsContent value="odontogram">
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-0">
                      <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm overflow-x-auto flex justify-center">
                        <Odontogram data={odontogramData} onSelectTooth={handleSelectTooth} />
                      </div>
                      <div className="flex gap-4 mt-8">
                        <Button variant="outline" onClick={() => setActiveTab('info')} className="w-1/3 border-2 border-blue-600 text-blue-600 font-black py-6 rounded-2xl uppercase tracking-widest text-xs">
                          Kembali
                        </Button>
                        <Button onClick={() => setActiveTab('treatment')} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">
                          Lanjut ke Tindakan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Tab Tindakan */}
                <TabsContent value="treatment">
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-0">
                      <div className="space-y-8">
                        <TreatmentForm onAddTreatment={handleAddTreatment} clinicId={appointment.id_klinik} />
                        
                        <div className="mt-8 border-t-2 border-blue-50 pt-8">
                          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 italic">Daftar Tindakan Terpilih</h3>
                          <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden">
                            <DataTable columns={treatmentColumns(handleDeleteTreatment)} data={treatments} />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8">
                        <Button variant="outline" onClick={() => setActiveTab('odontogram')} className="w-1/3 border-2 border-blue-600 text-blue-600 font-black py-6 rounded-2xl uppercase tracking-widest text-xs">
                          Kembali
                        </Button>
                        <Button onClick={() => setActiveTab('prescription')} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">
                          Lanjut ke Resep Obat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Tab Resep Obat */}
                <TabsContent value="prescription">
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-0">
                      <PrescriptionForm 
                        onAddPrescription={handleAddPrescription} 
                        existingPrescriptions={prescriptions}
                        onDeletePrescription={handleDeletePrescription}
                        clinicId={appointment.id_klinik}
                      />
                      <div className="flex gap-4 mt-8">
                        <Button variant="outline" onClick={() => setActiveTab('treatment')} className="w-1/3 border-2 border-blue-600 text-blue-600 font-black py-6 rounded-2xl uppercase tracking-widest text-xs">
                          Kembali
                        </Button>
                        <Button onClick={() => setActiveTab('summary')} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">
                          Lanjut ke Ringkasan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Tab Ringkasan */}
                <TabsContent value="summary">
                  <Card className="border-0 shadow-none bg-blue-50/30 rounded-3xl p-4">
                    <CardContent className="p-4 space-y-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic border-b-2 border-blue-100 pb-1">Keluhan & Catatan</h3>
                          <p className="text-sm font-bold text-blue-900"><span className="text-blue-500">Keluhan:</span> {complaints || '-'}</p>
                          <p className="text-sm font-bold text-blue-900 mt-1"><span className="text-blue-500">Catatan:</span> {doctorNotes || '-'}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic border-b-2 border-blue-100 pb-1">Tindakan ({treatments.length})</h3>
                          {treatments.length > 0 ? (
                            <ul className="list-disc list-inside text-sm font-bold text-blue-900 space-y-1">
                              {treatments.map((t, i) => (
                                <li key={i}>
                                  {t.treatmentName} {t.location ? `(${t.location})` : ''} - 
                                  {t.quantity > 1 ? `${t.quantity} x ` : ''}
                                  Rp {t.totalCost?.toLocaleString()}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm font-bold text-blue-400 italic">Tidak ada tindakan</p>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic border-b-2 border-blue-100 pb-1">Resep Obat ({prescriptions.length})</h3>
                          {prescriptions.length > 0 ? (
                            <ul className="list-disc list-inside text-sm font-bold text-blue-900 space-y-1">
                              {prescriptions.map((p, i) => (
                                <li key={i}>{p.drugName} - {p.quantity} {p.unit} ({p.dosage}) - Rp {p.cost?.toLocaleString()}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm font-bold text-blue-400 italic">Tidak ada resep obat</p>
                          )}
                        </div>
                        
                        <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-md">
                          <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 italic">Kalkulasi Biaya</h3>
                          <div className="grid grid-cols-2 gap-3 text-sm font-bold text-blue-900">
                            <div className="opacity-70">Biaya Tindakan:</div>
                            <div className="text-right">Rp {treatments.reduce((sum, t) => sum + (t.totalCost || 0), 0).toLocaleString()}</div>
                            <div className="opacity-70">Biaya Obat:</div>
                            <div className="text-right">Rp {prescriptions.reduce((sum, p) => sum + (p.cost || 0), 0).toLocaleString()}</div>
                            <div className="opacity-70 pt-2 border-t border-blue-100">Subtotal:</div>
                            <div className="text-right pt-2 border-t border-blue-100">Rp {calculateTotalCost().toLocaleString()}</div>
                            
                            <div className="opacity-70 flex items-center">Diskon:</div>
                            <div className="flex items-center justify-end">
                              <Input 
                                type="number" 
                                value={discount}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscount(Number(e.target.value))} 
                                min="0"
                                max={calculateTotalCost()}
                                className="w-28 h-8 mr-2 text-right font-bold"
                              />
                            </div>
                            
                            <div className="text-lg font-black text-blue-600 pt-3 border-t-2 border-blue-100 uppercase mt-1">Total Akhir:</div>
                            <div className="text-xl font-black text-blue-600 text-right pt-3 border-t-2 border-blue-100 mt-1">Rp {calculateFinalTotal().toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mt-8">
                        <Button variant="outline" onClick={() => setActiveTab('prescription')} className="w-1/3 border-2 border-blue-600 text-blue-600 font-black py-6 rounded-2xl uppercase tracking-widest text-xs">
                          Kembali
                        </Button>
                        <Button 
                          onClick={handleFinishClick} 
                          disabled={isSaving}
                          className="w-2/3 bg-green-500 hover:bg-green-600 text-white font-black py-6 rounded-2xl shadow-xl shadow-green-200 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                          {isSaving ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Menyimpan...</>
                          ) : (
                            <><Save className="h-5 w-5" /> Selesaikan Kunjungan</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
      </div>

       {/* Custom Modals */}
       {isOdontogramModalOpen && selectedToothForModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-[2rem] border-2 border-blue-600 shadow-2xl p-8 max-w-md w-full space-y-6 animate-fade-in-slide-down">
             <div className="flex justify-between items-center border-b border-blue-100 pb-3">
               <h3 className="text-lg font-black text-blue-900 uppercase italic">Update Gigi {selectedToothForModal.number} ({selectedToothForModal.position})</h3>
               <button onClick={() => { setIsOdontogramModalOpen(false); setSelectedToothForModal(null); }} className="text-slate-400 hover:text-slate-600">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               {[
                 { name: 'Normal', color: '#FFFFFF', bg: 'bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50' },
                 { name: 'Karies', color: '#ef4444', bg: 'bg-red-500 text-white hover:bg-red-600' },
                 { name: 'Tambalan', color: '#3b82f6', bg: 'bg-blue-500 text-white hover:bg-blue-600' },
                 { name: 'Gigi Tiruan', color: '#eab308', bg: 'bg-yellow-500 text-white hover:bg-yellow-600' },
                 { name: 'Missing', color: '#000000', bg: 'bg-black text-white hover:bg-zinc-900' },
                 { name: 'Perawatan Saluran Akar', color: '#22c55e', bg: 'bg-green-500 text-white hover:bg-green-600' }
               ].map((cond) => (
                 <button
                   key={cond.name}
                   onClick={() => {
                     const toothNumber = selectedToothForModal.number;
                     const position = selectedToothForModal.position;
                     const condition = cond.name;
                     const color = cond.color;
                     
                     const update = { nomor_gigi: toothNumber, posisi_gigi: position, kondisi_gigi: condition, warna_odontogram: color };
                     setOdontogramData(prev => {
                        const filtered = prev.filter(p => !(p.nomor_gigi === toothNumber && p.posisi_gigi === position));
                        return [...filtered, update];
                     });
                     setOdontogramUpdates(prev => {
                        const filtered = prev.filter(p => !(p.nomor_gigi === toothNumber && p.posisi_gigi === position));
                        return [...filtered, update];
                     });
                     setIsOdontogramModalOpen(false);
                     setSelectedToothForModal(null);
                     toast({
                       title: "Kondisi Gigi Diperbarui",
                       description: `Gigi ${toothNumber} (${position}) diatur ke ${condition}.`,
                     });
                   }}
                   className={`py-3 px-4 rounded-xl font-bold text-xs text-center shadow transition-all hover:scale-[1.03] active:scale-95 ${cond.bg}`}
                 >
                   {cond.name}
                 </button>
               ))}
             </div>
           </div>
         </div>
       )}

       {isFinishConfirmOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-[2rem] border-2 border-blue-600 shadow-2xl p-8 max-w-md w-full space-y-6 text-center animate-fade-in-slide-down">
             <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
             </div>
             <div className="space-y-2">
               <h3 className="text-xl font-black text-blue-900 uppercase italic">Konfirmasi Selesai</h3>
               <p className="text-slate-500 font-semibold text-sm">Apakah Anda yakin ingin menyimpan laporan pemeriksaan dan menyelesaikan antrian pasien ini?</p>
             </div>
             <div className="flex gap-4">
               <button
                 onClick={() => setIsFinishConfirmOpen(false)}
                 className="w-1/2 bg-white border-2 border-blue-600 text-blue-600 font-black py-3.5 rounded-xl uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors"
               >
                 Batal
               </button>
               <button
                 onClick={executeFinish}
                 className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl shadow-lg shadow-blue-200 uppercase tracking-widest text-xs transition-colors"
               >
                 Ya, Selesaikan
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
