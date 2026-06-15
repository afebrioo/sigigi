# Tabel Pengujian Black Box: Fitur LLM Triage & Late-Fusion Analysis (SIGIGI 2.0)

Pengujian *Black Box* ini bertujuan untuk memvalidasi bahwa modul **LLM Triage & Late-Fusion Analysis** dapat menerima berbagai kombinasi masukan keluhan, kuesioner, dan hasil CNN karies, lalu mengolahnya untuk menghasilkan keluaran analisis klasifikasi urgensi dan anamnesis yang sesuai dengan spesifikasi fungsional sistem.

---

## Spesifikasi Pengujian

*   **Metode Pengujian:** *Equivalence Partitioning* dan *Boundary Value Analysis* menggunakan skenario kasus klinis.
*   **Unit yang Diuji:** Endpoint `/triage` (FastAPI / `ml-api`) yang diintegrasikan dengan Laravel Backend.
*   **Parameter Uji:**
    *   **Input:** Keluhan Utama (Teks Bebas), Jawaban Kuesioner (10 Pertanyaan), Status Citra CNN (`karies` / `non-karies`), & Tingkat Keyakinan CNN (%).
    *   **Output:** `extracted_symptoms` (pain_trigger, duration_days, location), `anamnesis_draft`, `urgency_level`, `urgency_score` (0-10), `clinical_reasoning`, `patient_friendly_advice`, & `post_treatment_advice`.

---

## Tabel Hasil Pengujian Black Box

| ID Uji | Skenario Pengujian | Detail Input (Test Case) | Hasil yang Diharapkan (Expected Output) | Hasil Aktual (Actual Output) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TB-LLM-01** | Klasifikasi Kedaruratan Akut (Urgensi Tinggi) | **Keluhan:** *"Pipi kanan bengkak sejak kemarin, gigi geraham bawah sakit berdenyut sampai tidak bisa tidur dan badan demam."*<br>**Kuesioner:** Q1=Ya, Q2=Ya, Q3=Ya, Q4=Ya, Q9=Ya.<br>**CNN:** `non-karies` (0.0%). | <ul><li>`urgency_level`: `"Tinggi"`</li><li>`urgency_score`: 8 - 10</li><li>`anamnesis_draft`: Mencantumkan indikasi abses/infeksi sistemik.</li><li>`patient_friendly_advice`: Menyuruh segera ke klinik dengan bahasa ramah.</li></ul> | Sesuai (Hasil JSON valid dengan level `"Tinggi"`, skor `9`, draf anamnesis menyebutkan tanda infeksi, dan anjuran segera ke dokter). | **BERHASIL (PASS)** |
| **TB-LLM-02** | Klasifikasi Gejala Karies Aktif (Urgensi Sedang) | **Keluhan:** *"Gigi geraham belakang ngilu sekali saat minum es teh manis."*<br>**Kuesioner:** Q2=Ya, Q8=Ya.<br>**CNN:** `karies` (95.40%). | <ul><li>`urgency_level`: `"Sedang"`</li><li>`urgency_score`: 4 - 7</li><li>`extracted_symptoms`: trigger `"Rangsangan dingin/manis"`, lokasi `"Gigi geraham"`.</li><li>`anamnesis_draft`: Draf klinis pulpitis reversibel/karies media.</li></ul> | Sesuai (Hasil JSON mencatat trigger dingin/manis, tingkat `"Sedang"`, skor `6`, dan draf pulpitis). | **BERHASIL (PASS)** |
| **TB-LLM-03** | Klasifikasi Pemeriksaan Rutin / Non-Nyeri (Urgensi Rendah) | **Keluhan:** *"Hanya ingin membersihkan karang gigi (scaling) rutin saja."*<br>**Kuesioner:** Semua Q1 - Q10 = Tidak.<br>**CNN:** `non-karies` (99.10%). | <ul><li>`urgency_level`: `"Rendah"`</li><li>`urgency_score`: 0 - 3</li><li>`clinical_reasoning`: Menyatakan pasien datang untuk pemeriksaan rutin/elektif tanpa gejala akut.</li></ul> | Sesuai (Hasil JSON melabeli level `"Rendah"`, skor `1`, dan reasoning mencatat tindakan preventif rutin). | **BERHASIL (PASS)** |
| **TB-LLM-04** | Validasi Kebersihan *Post-Treatment Advice* (Halaman Rekam Medis) | **Keluhan & Tindakan:** Mengakses riwayat rekam medis pasca-perawatan gigi berlubang. | <ul><li>`post_treatment_advice`: Berisi tips menjaga tambalan gusi/gigi.</li><li>**Penting:** Sama sekali tidak ada kalimat promosi/ajakan reservasi janji temu baru.</li></ul> | Sesuai (Hasil saran pasca-tindakan bersih dari kalimat penawaran janji temu baru atau ajakan kembali ke klinik). | **BERHASIL (PASS)** |
| **TB-LLM-05** | Penanganan Kegagalan / Fallback Modul (Key API Tidak Ada) | **Input:** Request triage dikirim, tetapi server kehilangan akses ke `GEMINI_API_KEY` (kosong). | <ul><li>Sistem tidak boleh crash (Error 500).</li><li>Mengembalikan respons fallback standar yang aman dengan status `"Sedang"` dan skor `5`.</li></ul> | Sesuai (Sistem mendeteksi kegagalan API, menangkap eksepsi secara elegan, dan mengembalikan draf default). | **BERHASIL (PASS)** |

---

> [!NOTE]
> Seluruh kasus pengujian di atas telah disimulasikan dan diverifikasi secara langsung pada server lokal maupun server produksi `sigigi.my.id`. Hasil integrasi data menunjukkan respons 100% konsisten dan valid sesuai format skema JSON yang ditentukan.
