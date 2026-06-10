<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\MasterPasien;
use App\Models\RekamMedisPasien;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Appointment::query();

        // Patients can only see their own appointments
        if ($user && $user->role === 'patient') {
            $query->where('user_id', $user->id_users);
        }
        // Doctors/admins see all appointments (including walk-in with null user_id)

        if ($request->has('id_klinik')) {
            $query->where('id_klinik', $request->id_klinik);
        }

        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->whereIn('status', ['pending', 'serving']);
            } else {
                $query->where('status', $request->status);
            }
        }

        // Filter by today's date for queue display
        if ($request->has('today') && $request->today == '1') {
            $query->where('appointment_date', now()->toDateString());
        }

        // Filter by specific date if provided
        if ($request->has('date')) {
            $query->where('appointment_date', $request->date);
        }

        $appointments = $query->orderBy('appointment_date', 'asc')
                              ->orderBy('appointment_time', 'asc')
                              ->orderBy('id', 'asc')
                              ->get();

        $serving = $appointments->filter(function ($a) {
            return $a->status === 'serving';
        });

        $pending = $appointments->filter(function ($a) {
            return $a->status === 'pending';
        });

        $others = $appointments->filter(function ($a) {
            return $a->status !== 'serving' && $a->status !== 'pending';
        });

        $pending = $this->applyUrgencyQueueSwaps($pending);

        $appointments = $serving->merge($pending)->merge($others);

        foreach ($appointments as $appointment) {
            if ($appointment->status === 'completed') {
                $pasien = null;
                if ($appointment->user_id) {
                    $u = \App\Models\User::find($appointment->user_id);
                    if ($u) {
                        $pasien = \App\Models\MasterPasien::where('email', $u->email)->first();
                    }
                }
                if (!$pasien) {
                    $pasien = \App\Models\MasterPasien::where('telepon', $appointment->patient_phone)
                        ->orWhere('nama_lengkap', $appointment->patient_name)
                        ->first();
                }
                if ($pasien) {
                    $rekamMedis = \App\Models\RekamMedisPasien::where('id_pasien', $pasien->id_pasien)
                        ->orderBy('created_at', 'desc')
                        ->first();
                    $appointment->setRelation('rekam_medis', $rekamMedis);
                }
            }
        }

        return response()->json($appointments);
    }

    public function queueToday(Request $request)
    {
        $query = Appointment::where('appointment_date', now()->toDateString())
            ->whereIn('status', ['pending', 'serving']);

        if ($request->has('id_klinik')) {
            $query->where('id_klinik', $request->id_klinik);
        }

        $appointments = $query->orderBy('appointment_time', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $serving = $appointments->filter(function ($a) {
            return $a->status === 'serving';
        });

        $pending = $appointments->filter(function ($a) {
            return $a->status === 'pending';
        });

        $pending = $this->applyUrgencyQueueSwaps($pending);

        $appointments = $serving->merge($pending);

        $appointments->transform(function ($appointment) use ($request) {
            $user = auth('sanctum')->user();
            $isOwn = $user && $user->id_users === $appointment->user_id;

            if (!$isOwn) {
                // Mask name
                $name = $appointment->patient_name;
                if (strlen($name) > 2) {
                    $appointment->patient_name = substr($name, 0, 2) . str_repeat('*', strlen($name) - 2);
                } else {
                    $appointment->patient_name = '***';
                }

                // Clear sensitive data
                $appointment->patient_phone = null;
                $appointment->patient_birth_date = null;
                $appointment->patient_address = null;
                $appointment->nik = null;
                $appointment->email = null;
                $appointment->kontak_darurat_nama = null;
                $appointment->kontak_darurat_telepon = null;
                $appointment->kontak_darurat_relasi = null;
                $appointment->questionnaire = null;
            }

            return $appointment;
        });

        return response()->json($appointments);
    }

    public function show(Request $request, $id)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        $user = $request->user();
        if ($user && $user->role === 'patient' && $appointment->user_id !== $user->id_users) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $pasien = \App\Models\MasterPasien::where('telepon', $appointment->patient_phone)
            ->orWhere('nama_lengkap', $appointment->patient_name)
            ->first();

        $appointmentData = $appointment->toArray();
        if ($pasien) {
            $appointmentData['master_pasien'] = $pasien->toArray();
        }

        return response()->json($appointmentData);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'appointment_date' => 'required|date',
                'appointment_time' => 'required|string',
                'id_klinik'        => 'nullable|integer|exists:klinik,id_klinik',
                'patient_name'     => 'required|string',
                'patient_phone'    => 'required|string',
                'patient_gender'   => 'nullable|string',
                'patient_birth_date' => 'nullable|date',
                'patient_address'  => 'nullable|string',
                'action_type'      => 'nullable|string',
                'questionnaire'    => 'nullable|array',
                'image_url'        => 'nullable|string',
                'email'            => 'nullable|email',
                'tempat_lahir'     => 'nullable|string',
                'golongan_darah'   => 'nullable|string',
                'kontak_darurat_nama'    => 'nullable|string',
                'kontak_darurat_telepon' => 'nullable|string',
                'kontak_darurat_relasi'  => 'nullable|string'
            ]);

            // Only assign user_id if the request comes from a PATIENT role user.
            // Doctors/admins create appointments on behalf of walk-in patients → user_id = null
            $userId = null;
            $authUser = $request->user();
            if ($authUser && $authUser->role === 'patient') {
                $userId = $authUser->id_users;
            }

            // Validasi slot tanggal + jam bentrok
            $timeToCheck1 = str_replace('.', ':', $request->appointment_time);
            $timeToCheck2 = str_replace(':', '.', $request->appointment_time);

            $exists = Appointment::where('appointment_date', $request->appointment_date)
                ->where(function ($query) use ($timeToCheck1, $timeToCheck2) {
                    $query->where('appointment_time', $timeToCheck1)
                          ->orWhere('appointment_time', $timeToCheck2);
                })
                ->whereIn('status', ['pending', 'completed', 'serving'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Slot tanggal dan jam ini sudah penuh atau bentrok. Silakan pilih jadwal lain.'
                ], 422);
            }

            $appointment = Appointment::create([
                'user_id'           => $userId,
                'id_klinik'         => $request->id_klinik ?? 1,
                'appointment_date'  => $request->appointment_date,
                'appointment_time'  => $request->appointment_time,
                'status'            => 'pending',
                'patient_name'      => $request->patient_name,
                'patient_phone'     => $request->patient_phone,
                'patient_gender'    => $request->patient_gender,
                'patient_birth_date'=> $request->patient_birth_date,
                'patient_address'   => $request->patient_address,
                'action_type'       => $request->action_type,
                'questionnaire'     => $request->questionnaire,
                'image_url'         => $request->image_url
            ]);

            // Calculate initial urgency
            try {
                $this->calculateUrgency($appointment);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('calculateUrgency failed: ' . $e->getMessage());
            }

            // Sync to master pasien table (non-critical — don't fail if this errors)
            try {
                $this->syncToMasterPasien($appointment, $request->all());
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('syncToMasterPasien failed: ' . $e->getMessage());
            }

            // AI analysis: trigger automatically on creation if image exists
            if ($appointment->image_url) {
                try {
                    $this->runAiAnalysis($appointment);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('AI Analysis on store failed: ' . $e->getMessage());
                }
            }

            return response()->json($appointment->fresh(), 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function analyze(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $user = $request->user();
        if ($user && $user->role === 'patient' && $appointment->user_id !== $user->id_users) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!$appointment->image_url) {
            return response()->json(['message' => 'No image found for this appointment.'], 422);
        }

        $result = $this->runAiAnalysis($appointment);

        if ($result) {
            return response()->json([
                'message' => 'Analysis complete.',
                'ai_analysis' => $result,
                'appointment' => $appointment->fresh()
            ]);
        }

        return response()->json(['message' => 'ML API not available or image not found.'], 503);
    }

    public function finalize(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $user = $request->user();
        if ($user && $user->role === 'patient') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $keluhan       = $request->input('keluhan', $request->input('notes', ''));
        $catatanDokter = $request->input('catatan_dokter', $request->input('diagnosis', ''));
        $treatments    = $request->input('treatments', []);
        $prescriptions = $request->input('prescriptions', []);
        $biayaAkhir    = $request->input('biaya_akhir', 0);
        $statusPembayaran = $request->input('status_pembayaran', 'Belum Bayar');

        // Update appointment status
        $questionnaire = $appointment->questionnaire ?? [];
        $questionnaire['keluhan']        = $keluhan;
        $questionnaire['catatan_dokter'] = $catatanDokter;
        $questionnaire['biaya_akhir']    = $biayaAkhir;

        $appointment->questionnaire = $questionnaire;
        $appointment->status = 'completed';
        $appointment->save();

        // Sync to master pasien
        $this->syncToMasterPasien($appointment);

        DB::beginTransaction();
        try {
            $pasien = MasterPasien::where('telepon', $appointment->patient_phone)
                ->orWhere('nama_lengkap', $appointment->patient_name)
                ->first();

            if ($pasien) {
                // Find a dokter_klinik — use first available as default
                $dokterKlinik = DB::table('dokter_klinik')->first();
                $idDokterKlinik = $dokterKlinik ? $dokterKlinik->id_dokter_klinik : 1;

                // Create Rekam Medis
                $rekamMedis = RekamMedisPasien::create([
                    'id_pasien'        => $pasien->id_pasien,
                    'id_dokter_klinik' => $idDokterKlinik,
                    'tanggal_kunjungan'=> now(),
                    'keluhan'          => $keluhan,
                    'catatan_dokter'   => $catatanDokter,
                    'biaya'            => $biayaAkhir,
                    'status_pembayaran' => $statusPembayaran,
                ]);

                // Insert Treatments (Tindakan)
                $allowedPositions = ['M', 'D', 'O', 'B', 'L', 'P', 'R'];
                foreach ($treatments as $treatment) {
                    $locationRaw = $treatment['nomor_gigi'] ?? '';
                    $kondisiGigi = $this->getKondisiGigiDariTindakan($treatment['id_tindakan'] ?? null);
                    $warnaOdontogram = $this->getWarnaOdontogramDariTindakan($treatment['id_tindakan'] ?? null);
                    $formattedDate = now()->format('Y-m-d H:i:s');

                    if (!empty($locationRaw)) {
                        // Support multiple locations separated by comma e.g. "23D, 24M"
                        $locations = array_map('trim', explode(',', $locationRaw));

                        foreach ($locations as $loc) {
                            // Parse "23D" -> nomorGigi="23", posisiGigi="D"
                            preg_match('/^(\d+)([A-Za-z]?)$/', $loc, $matches);
                            $nomorGigi = $matches[1] ?? $loc;
                            $rawPos    = isset($matches[2]) ? strtoupper($matches[2]) : null;
                            $posisiGigi = in_array($rawPos, $allowedPositions) ? $rawPos : null;

                            \App\Models\RekamMedisTindakan::create([
                                'id_rekam_medis'          => $rekamMedis->id_rekam_medis,
                                'id_master_kode_penyakit' => $treatment['id_penyakit'] ?? null,
                                'id_master_tindakan'      => $treatment['id_tindakan'] ?? null,
                                'nomor_gigi'              => $nomorGigi,
                                'posisi_gigi'             => $posisiGigi,
                                'catatan_tindakan'        => $treatment['catatan'] ?? null,
                            ]);

                            // Hanya update odontogram jika posisi gigi valid
                            if ($posisiGigi) {
                                DB::table('odontogram_pasien')->updateOrInsert(
                                    [
                                        'id_pasien'       => $pasien->id_pasien,
                                        'nomor_gigi'      => $nomorGigi,
                                        'posisi_gigi'     => $posisiGigi,
                                        'tanggal_periksa' => $formattedDate
                                    ],
                                    [
                                        'kondisi_gigi'    => $kondisiGigi,
                                        'warna_odontogram'=> $warnaOdontogram,
                                        'keterangan'      => $treatment['catatan'] ?? null,
                                        'created_at'      => now(),
                                        'updated_at'      => now()
                                    ]
                                );
                            }
                        }
                    } else {
                        // Tindakan tanpa lokasi spesifik gigi
                        \App\Models\RekamMedisTindakan::create([
                            'id_rekam_medis'          => $rekamMedis->id_rekam_medis,
                            'id_master_kode_penyakit' => $treatment['id_penyakit'] ?? null,
                            'id_master_tindakan'      => $treatment['id_tindakan'] ?? null,
                            'nomor_gigi'              => null,
                            'posisi_gigi'             => null,
                            'catatan_tindakan'        => $treatment['catatan'] ?? null,
                        ]);
                    }
                }

                // Insert Prescriptions (Resep)
                $resepCounter = 1;
                foreach ($prescriptions as $resep) {
                    \App\Models\ResepTindakan::create([
                        'id_resep_tindakan' => $resepCounter++,
                        'id_rekam_medis' => $rekamMedis->id_rekam_medis,
                        'id_obat'        => $resep['id_obat'] ?? null,
                        'jumlah'         => $resep['jumlah'] ?? 1,
                        'aturan_pakai'   => $resep['aturan_pakai'] ?? '',
                        'catatan'        => $resep['catatan'] ?? '',
                    ]);
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Rekam Medis creation error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal menyimpan rekam medis: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Pemeriksaan selesai.', 'appointment' => $appointment->fresh()]);
    }

    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $user = $request->user();
        if ($user && $user->role === 'patient' && $appointment->user_id !== $user->id_users) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($request->has('appointment_date') || $request->has('appointment_time')) {
            $date = $request->input('appointment_date', $appointment->appointment_date);
            $time = $request->input('appointment_time', $appointment->appointment_time);

            $timeToCheck1 = str_replace('.', ':', $time);
            $timeToCheck2 = str_replace(':', '.', $time);

            $exists = Appointment::where('id', '!=', $appointment->id)
                ->where('appointment_date', $date)
                ->where(function ($query) use ($timeToCheck1, $timeToCheck2) {
                    $query->where('appointment_time', $timeToCheck1)
                          ->orWhere('appointment_time', $timeToCheck2);
                })
                ->whereIn('status', ['pending', 'completed', 'serving'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Slot tanggal dan jam ini sudah penuh atau bentrok. Silakan pilih jadwal lain.'
                ], 422);
            }
        }

        $oldImageUrl = $appointment->image_url;
        $appointment->fill($request->all());
        $appointment->save();

        // If a new image is provided on update, trigger scan automatically
        if ($appointment->image_url && $appointment->image_url !== $oldImageUrl) {
            try {
                $this->runAiAnalysis($appointment);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('AI Analysis on update failed: ' . $e->getMessage());
            }
        }

        // If completed, sync to master pasien table
        if ($appointment->status === 'completed') {
            $this->syncToMasterPasien($appointment);
        }

        return response()->json($appointment->fresh());
    }

    private function runAiAnalysis(Appointment $appointment): ?array
    {
        try {
            $filename = basename($appointment->image_url);

            // Check new public disk path first, then fallback to old private path
            $imagePath = storage_path('app/public/xrays/' . $filename);
            if (!file_exists($imagePath)) {
                $imagePath = storage_path('app/private/public/xrays/' . $filename);
            }

            if (!file_exists($imagePath)) {
                return null;
            }

            $response = \Illuminate\Support\Facades\Http::attach(
                'file', file_get_contents($imagePath), $filename
            )->post(config('services.ml.url', 'http://127.0.0.1:8002/predict'));

            if ($response->successful()) {
                $mlResult = $response->json();

                $questionnaire = $appointment->questionnaire ?? [];
                $questionnaire['ai_analysis'] = [
                    'prediction' => $mlResult['prediction'] ?? 'Unknown',
                    'confidence' => $mlResult['confidence'] ?? 0
                ];

                $appointment->questionnaire = $questionnaire;
                $appointment->save();

                // Recalculate urgency score with AI analysis results included
                try {
                    $this->calculateUrgency($appointment);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('calculateUrgency in AI analysis failed: ' . $e->getMessage());
                }

                return $questionnaire['ai_analysis'];
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('AI Prediction Error: ' . $e->getMessage());
        }

        return null;
    }

    private function syncToMasterPasien(Appointment $appointment, array $extraData = [])
    {
        // Try to find existing patient by phone or name
        $pasien = MasterPasien::where('telepon', $appointment->patient_phone)
            ->orWhere('nama_lengkap', $appointment->patient_name)
            ->first();

        $data = [
            'nama_lengkap' => $appointment->patient_name,
            'telepon' => $appointment->patient_phone,
            'jenis_kelamin' => $appointment->patient_gender,
            'tanggal_lahir' => $appointment->patient_birth_date,
            'alamat' => $appointment->patient_address,
            'id_klinik' => $appointment->id_klinik ?? 1,
        ];

        if (!empty($extraData['tempat_lahir'])) $data['tempat_lahir'] = $extraData['tempat_lahir'];
        if (!empty($extraData['golongan_darah'])) $data['golongan_darah'] = $extraData['golongan_darah'];
        if (!empty($extraData['email'])) $data['email'] = $extraData['email'];
        if (!empty($extraData['kontak_darurat_nama'])) $data['kontak_darurat_nama'] = $extraData['kontak_darurat_nama'];
        if (!empty($extraData['kontak_darurat_telepon'])) $data['kontak_darurat_telepon'] = $extraData['kontak_darurat_telepon'];
        if (!empty($extraData['kontak_darurat_relasi'])) $data['kontak_darurat_relasi'] = $extraData['kontak_darurat_relasi'];

        if (!$pasien) {
            // Generate No Rekam Medis dynamically based on clinic prefix
            $id_klinik = $data['id_klinik'] ?? 1;
            $prefix = 'RM';
            try {
                $klinik = \App\Models\MasterKlinik::find($id_klinik);
                if ($klinik) {
                    $namaKlinik = preg_replace('/^Klinik\s+/i', '', $klinik->nama_klinik);
                    $prefix = strtoupper(substr($namaKlinik, 0, 3));
                }
            } catch (\Exception $e) {}

            $lastNumber = MasterPasien::where('no_rekam_medis', 'like', $prefix.'%')
                ->orderBy('no_rekam_medis', 'desc')
                ->value('no_rekam_medis');
            
            if ($lastNumber) {
                preg_match('/[A-Z]+(\d+)/', $lastNumber, $matches);
                $nextNumber = isset($matches[1]) ? intval($matches[1]) + 1 : 1;
            } else {
                $nextNumber = 1;
            }

            $data['no_rekam_medis'] = $prefix . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            MasterPasien::create($data);
        } else {
            $pasien->update($data);
        }
    }

    private function calculateUrgency(Appointment $appointment)
    {
        $score = 0;
        $q = $appointment->questionnaire ?? [];

        // Count "YA" answers from q1 to q10
        for ($i = 1; $i <= 10; $i++) {
            $ans = $q['q' . $i] ?? '';
            if (strcasecmp($ans, 'YA') === 0 || strcasecmp($ans, 'Ya') === 0) {
                $score += 1;
            }
        }

        // === PRIORITY LEVEL ===
        // 0 – 3: Rendah
        // 4 – 7: Sedang
        // 8 – 10: Tinggi
        $priority = 'Rendah';
        if ($score >= 8) {
            $priority = 'Tinggi';
        } elseif ($score >= 4) {
            $priority = 'Sedang';
        }

        $appointment->urgency_score = $score;
        $appointment->priority_level = $priority;
        $appointment->saveQuietly();
    }

    private function applyUrgencyQueueSwaps($appointments)
    {
        $items = is_array($appointments) ? $appointments : $appointments->all();
        $n = count($items);

        for ($i = 1; $i < $n; $i++) {
            $current = $items[$i];
            $prev = $items[$i - 1];

            $currentVal = $current->priority_level === 'Tinggi' ? 3 : ($current->priority_level === 'Sedang' ? 2 : 1);
            $prevVal = $prev->priority_level === 'Tinggi' ? 3 : ($prev->priority_level === 'Sedang' ? 2 : 1);

            if ($currentVal > $prevVal) {
                $items[$i] = $prev;
                $items[$i - 1] = $current;
                $i++; // skip next to limit swapping to at most 1 position per item
            }
        }

        return collect($items);
    }

    private function getKondisiGigiDariTindakan($treatmentID) {
        switch($treatmentID) {
            case 1:
                return 'Karies';
            default:
                return 'Perawatan Ortodonti';
        }
    }

    private function getWarnaOdontogramDariTindakan($treatmentId) {
        // Logika untuk menentukan warna berdasarkan ID tindakan
        switch ($treatmentId) {
            case 1: return '#FF0000'; // merah untuk tambalan
            case 2: return '#000000'; // hitam untuk ekstraksi
            default: return '#0000FF'; // biru default
        }
    }
}
