# SIGIGI — Sistem Informasi Klinik Gigi

Aplikasi manajemen klinik gigi berbasis web yang mencakup sistem pencatatan tindakan medis untuk staf (admin/dokter) dan portal layanan mandiri untuk pasien. Dikembangkan untuk mendukung klinik praktek pribadi mandiri dengan multi-cabang.

> **Lisensi**: Source code ini dapat dimodifikasi untuk keperluan pribadi/akademik. Tidak diperkenankan untuk dijual atau digunakan secara komersial kepada pihak lain.

---

## ✨ Fitur Utama

### 👨‍⚕️ Dashboard Staf (Admin / Dokter)
- **Manajemen Klinik** — Kelola data multi-cabang klinik
- **Manajemen Dokter & Asisten** — Data dokter dan klinik yang terhubung
- **Manajemen Pasien** — CRUD data pasien lengkap dengan nomor rekam medis
- **Master Data** — Kelola obat, tindakan, kode penyakit, dan harga per-klinik
- **Rekam Medis** — Pencatatan tindakan, resep obat, dan biaya per kunjungan
- **Odontogram Digital** — Peta gigi interaktif per pasien
- **Cetak PDF** — Generate rekam medis dan resep dalam format PDF
- **Dashboard Statistik** — Ringkasan kunjungan, pendapatan, dan tindakan terpopuler

### 🧑 Portal Pasien
- **Registrasi & Login** — Daftar via email/password atau Google OAuth
- **Booking Appointment** — Pilih klinik, tanggal, dan slot waktu yang tersedia
- **Kuesioner Medis** — Isi 10 pertanyaan gejala sebelum kunjungan (menentukan prioritas antrian)
- **Upload Foto X-Ray** — Upload foto gigi untuk dianalisis AI secara otomatis
- **Antrian Real-time** — Pantau posisi antrian hari ini secara live
- **Riwayat Appointment** — Lihat rekap kunjungan sebelumnya
- **Profil & Biodata** — Kelola data diri dan kontak darurat

### 🤖 AI Deteksi Karies
- Analisis foto gigi pasien menggunakan model **EfficientNet-B0**
- Mendeteksi kondisi **karies** vs **non-karies** secara otomatis saat appointment dibuat
- Hasil analisis ditampilkan ke dokter di halaman antrian

### 🏥 Sistem Prioritas Antrian
- Skor urgensi dihitung dari jawaban kuesioner (0–10)
- Level prioritas: **Rendah** (0–3) / **Sedang** (4–7) / **Tinggi** (8–10)
- Pasien dengan prioritas tinggi otomatis diprioritaskan di antrian

---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite 6 |
| **Styling** | Tailwind CSS 3 + Radix UI + shadcn/ui |
| **State Management** | TanStack Query v5 + Zustand |
| **Backend API** | Laravel 11 (PHP 8.2+) |
| **Auth** | Laravel Sanctum (token-based) + Google OAuth |
| **Database** | MySQL |
| **PDF** | barryvdh/laravel-dompdf |
| **ML API** | FastAPI (Python) + TensorFlow/Keras |
| **ML Model** | EfficientNet-B0 (binary classification) |

---

## 📁 Struktur Proyek

```
sigigi-main/
├── frontend/               # React + Vite SPA
│   └── src/
│       ├── pages/
│       │   ├── portal/     # Halaman portal pasien
│       │   ├── dashboard/  # Dashboard admin
│       │   ├── tindakan/   # Manajemen rekam medis
│       │   └── ...
│       ├── components/     # Komponen reusable
│       ├── services/       # API service layer
│       └── lib/api.ts      # Konfigurasi endpoint
├── backend-api/            # Laravel 11 REST API
│   ├── app/Http/Controllers/
│   ├── app/Models/
│   └── routes/api.php
├── ml-api/                 # FastAPI ML microservice
│   ├── main.py
│   └── requirements.txt
└── best_efficientnetb0_model.keras  # Model ML
```

---

## 🚀 Cara Menjalankan Lokal

Pastikan **XAMPP (Apache & MySQL)**, **PHP 8.2+**, **Node.js**, dan **Python 3.x** sudah terinstall.

### 1. Backend (Laravel) — Port 8000

```bash
cd backend-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

### 2. ML API (FastAPI) — Port 8001

```bash
cd ml-api
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### 3. Frontend (React) — Port 5173

```bash
cd frontend
npm install
npm run dev
```

### 4. Akses Aplikasi

| Alamat | Keterangan |
|---|---|
| `http://localhost:5173` | Halaman utama (Portal Pasien) |
| `http://localhost:5173/auth/login` | Login Admin / Dokter |
| `http://localhost:5173/portal/login` | Login Pasien |
| `http://localhost:8000/api` | Backend REST API |
| `http://localhost:8001` | ML API (EfficientNet) |

**Kredensial default staf:**
- Username: `admin` / Password: `password`

---

## 🌐 Deployment

Aplikasi ini sudah berjalan di:
- **Frontend**: [sigigi.my.id](https://sigigi.my.id)
- **Backend API**: Terpisah di server PHP

Lihat [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) untuk panduan deploy lengkap ke VPS/shared hosting.

---

## 📋 Catatan Pengembangan

- Sistem belum terintegrasi dengan platform **Satu Sehat** atau **BPJS Kesehatan**
- Validasi jadwal klinik bersifat hardcoded per klinik (Lembang: Jumat 16.00–20.00, Cibadak: Senin–Kamis 16.00–20.00 & Sabtu 16.00–18.00) dengan interval/jeda reservasi per **30 menit** (sesuai kondisi operasional di lapangan).
- Model ML berjalan sebagai microservice terpisah agar tidak membebani server utama.
- Penjelasan akademis mengenai perbaikan ketangguhan model AI dalam mengenali citra yang tidak sesuai petunjuk (kamera depan/webcam laptop) dan penanganan citra non-gigi (OOD detection) terdokumentasi lengkap di [`MODEL_IMPROVEMENTS.md`](./MODEL_IMPROVEMENTS.md).