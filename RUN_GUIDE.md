# Panduan Menjalankan Sistem SIGIGI 2.0 (Untuk Video Tutorial)

Sistem SIGIGI 2.0 menggunakan arsitektur modern yang terdiri dari tiga komponen utama:
1. **Backend API** (Laravel 11) - Port 8000
2. **Frontend App** (React + Vite) - Port 5173
3. **Machine Learning API** (FastAPI) - Port 8001

Ikuti langkah-langkah di bawah ini untuk menyalakan sistem secara keseluruhan. Pastikan **XAMPP (Apache & MySQL)** sudah dalam kondisi menyala.

---

## 1. Menjalankan Backend (Laravel)
Buka Terminal pertama (Terminal 1) dan arahkan ke folder `backend-api`:
```bash
cd backend-api
```
*(Opsional)* Jika ini pertama kali, jalankan:
```bash
composer install
php artisan key:generate
```
Lalu, nyalakan server:
```bash
php artisan serve
```
✅ **Backend API akan berjalan di `http://127.0.0.1:8000`**

---

## 2. Menjalankan Machine Learning API (FastAPI)
Buka Terminal kedua (Terminal 2) dan arahkan ke folder `ml-api`:
```bash
cd ml-api
```
*(Opsional)* Jika ini pertama kali, install library Python yang dibutuhkan:
```bash
pip install -r requirements.txt
```
Lalu, nyalakan server ML:
```bash
uvicorn main:app --reload --port 8001
```
✅ **ML API akan berjalan di `http://127.0.0.1:8001`**

---

## 3. Menjalankan Frontend (React + Vite)
Buka Terminal ketiga (Terminal 3) dan arahkan ke folder `frontend`:
```bash
cd frontend
```
*(Opsional)* Jika ini pertama kali, install node modules:
```bash
npm install
```
Lalu, jalankan server pengembangan:
```bash
npm run dev
```
✅ **Frontend Web akan berjalan di `http://localhost:5173`**

---

## 4. Cara Akses & Login di Video
1. Buka browser (Chrome/Edge) dan akses: [http://localhost:5173](http://localhost:5173)
2. Untuk login sebagai **Admin/Dokter**, gunakan kredensial berikut:
   - **Username**: `admin`
   - **Password**: `password`
3. Untuk pendaftaran **Pasien Baru**, gunakan halaman Registrasi Pasien dari menu Portal.

---

## 💡 Tips untuk Perekaman Video
- Siapkan **3 jendela terminal** berdampingan sebelum merekam, agar proses `start` terlihat mulus dan profesional.
- Tekankan bahwa model **EfficientNet-B0** telah dipisahkan ke microservice (Terminal 2) sehingga tidak membebani server utama (Terminal 1).
- Tunjukkan fitur integrasi interaktif **Odontogram** di halaman Dokter setelah AI berhasil menganalisis foto karies.
