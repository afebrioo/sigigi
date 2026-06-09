# Panduan Lengkap Deployment SIGIGI 2.0 (Dari Nol)

Panduan ini dibuat super detail agar Anda bisa membawa aplikasi yang asalnya hanya jalan di laptop Windows (Localhost/XAMPP), menjadi sebuah website sungguhan yang bisa diakses orang lain lewat internet menggunakan **VPS (Virtual Private Server) Ubuntu Linux**.

---

## 1. Persiapan VPS Linux via IDCloudHost Console (Rekomendasi Skripsi/Capstone)

Untuk mendeploy aplikasi SIGIGI secara online selama 2-3 bulan, kita akan menggunakan **IDCloudHost Console (Pay-as-you-grow)** yang pembayarannya dihitung per jam dan bisa menggunakan GoPay/OVO/Transfer lokal tanpa kartu kredit.

### Langkah Setup IDCloudHost Console:
1. Buka dan daftarkan diri Anda di **[IDCloudHost Console](https://console.idcloudhost.com)**.
2. **Top-Up Saldo:**
   - Masuk ke menu **Billing** lalu klik **Top Up**.
   - Isi saldo sesuai kebutuhan (misal Rp50.000 atau Rp100.000). Anda bisa membayar menggunakan **GoPay, OVO, Dana, QRIS, atau Transfer Bank**.
3. **Membuat Virtual Machine (VM):**
   - Masuk ke dashboard dan klik **Create / + New Resource** -> **Virtual Machine**.
   - **Sistem Operasi (OS):** Pilih **Ubuntu 22.04 LTS** atau **Ubuntu 24.04 LTS**.
   - **Lokasi Server:** Pilih **Jakarta (ID-JKT)** agar akses aplikasi sangat cepat untuk pengguna di Indonesia.
   - **Spesifikasi (Size):** 
     - **Rekomendasi Minimal:** Pilih spesifikasi **RAM 2 GB, 1-2 vCPU** (misalnya tipe AMD eXtreme atau Intel eXtreme). RAM 2 GB adalah batas aman agar backend Laravel + MySQL + FastAPI ML model bisa berjalan berdampingan tanpa mati.
     - **Rekomendasi Lancar:** Pilih **RAM 4 GB** jika ingin model AI TensorFlow memproses foto gigi dengan lebih cepat dan tanpa lag.
   - **Autentikasi:** Pilih opsi **Password**. Tentukan **Username** (contoh: `root` atau `ubuntu`) dan masukkan **Password** yang kuat. *Catat dan ingat baik-baik username & password ini untuk masuk ke server!*
   - Klik **Create** dan tunggu beberapa detik sampai statusnya menjadi **Running**.
4. Setelah aktif, salin **IP Address** publik (misal: `103.176.79.89`) yang tertera pada detail VM Anda.

---

## 2. Cara Masuk (Login) ke Server Linux VPS

Untuk masuk ke layar hitam terminal server Linux Anda:
1. Buka **PowerShell** atau **Command Prompt** di laptop Windows Anda.
2. Ketik perintah: `ssh username@IP_VPS_ANDA` (ganti `username` dengan nama user saat pembuatan VM di IDCloudHost, misal `root` atau `ubuntu`, dan ganti `IP_VPS_ANDA` dengan IP Publik VM Anda).
   *Contoh:* `ssh root@103.176.79.89`
3. Jika muncul pertanyaan konfirmasi sidik jari (fingerprint), ketik **`yes`** lalu tekan **Enter**.
4. Masukkan **Password** yang sudah Anda buat di IDCloudHost Console tadi.
   *(Catatan: Saat mengetik password di layar hitam, kursor memang tidak bergerak dan karakter tidak muncul. Ketik saja dengan benar, lalu tekan **Enter**)*.
5. Jika sukses, baris input akan berubah menjadi `root@nama-vps-anda:~#` (atau sesuai username Anda).

---

## 2.1. Membuat Swap File (Memori Cadangan SSD)
Karena VPS 2 GB akan menjalankan MySQL, Laravel, dan AI TensorFlow secara bersamaan, sangat disarankan untuk mengaktifkan **Swap** (RAM Cadangan dari SSD sebesar 2 GB). Ini berfungsi mencegah server mendadak crash akibat kehabisan memori (Out Of Memory).

Jalankan perintah berikut satu per satu di terminal Linux Anda:
```bash
# 1. Alokasikan file swap sebesar 2 GB
sudo fallocate -l 2G /swapfile

# 2. Atur izin akses agar aman
sudo chmod 600 /swapfile

# 3. Ubah file tersebut menjadi ruang swap
sudo mkswap /swapfile

# 4. Aktifkan swap
sudo swapon /swapfile

# 5. Daftarkan secara permanen agar tetap aktif saat VPS di-restart
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
*(Anda bisa memverifikasi apakah swap aktif dengan mengetik perintah: `free -h`)*.

---

## 3. Cara Memindahkan Kode dari Laptop ke Server Linux

Cara paling gampang untuk memindahkan kode dari laptop Windows Anda ke Linux adalah lewat **GitHub**.
1. Pastikan seluruh kode Anda sudah di-upload (push) ke GitHub.
2. Di layar hitam Linux, install Git:
   ```bash
   sudo apt update
   sudo apt install git -y
   ```
3. Unduh (Clone) kode Anda ke dalam Linux:
   ```bash
   git clone https://github.com/USERNAME/sigigi-main.git
   ```

---

## 4. Install Semua Program yang Dibutuhkan Server

Server Linux masih kosong, jadi kita harus menginstal "XAMPP" versi Linux yang terdiri dari: **Nginx** (pengganti Apache), **MySQL**, **PHP**, dan **Python** (untuk AI).

Jalankan perintah ini di Linux (Copy-Paste lalu Enter):
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx mysql-server python3 python3-pip python3-venv docker.io docker-compose curl unzip -y
sudo apt install php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip -y
```

---

## 5. Deployment Step-by-Step

### Langkah 5.1: Setup Database MySQL di Linux
1. Masuk ke MySQL Linux:
   ```bash
   sudo mysql
   ```
2. Buat database dan user baru (Ketik ini satu per satu):
   ```sql
   CREATE DATABASE sigigi;
   CREATE USER 'sigigi_user'@'localhost' IDENTIFIED BY 'password123';
   GRANT ALL PRIVILEGES ON sigigi.* TO 'sigigi_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```
3. Import database Anda. Jika file `sigigi.sql` ada di dalam folder `sigigi-main` yang baru di-clone:
   ```bash
   sudo mysql sigigi < sigigi-main/sigigi.sql
   ```

### Langkah 5.2: Setup Backend (Laravel)
1. Pindahkan folder backend ke tempat khusus website:
   ```bash
   sudo mv sigigi-main/backend-api /var/www/sigigi-backend
   ```
2. Beri izin akses agar Laravel bisa menyimpan gambar pasien:
   ```bash
   sudo chown -R www-data:www-data /var/www/sigigi-backend/storage
   sudo chown -R www-data:www-data /var/www/sigigi-backend/bootstrap/cache
   ```
3. Masuk ke folder tersebut dan atur konfigurasi:
   ```bash
   cd /var/www/sigigi-backend
   cp .env.example .env
   nano .env
   ```
   *(Catatan: `nano` adalah teks editor layar hitam. Gunakan tombol panah untuk bergerak. Ubah bagian DB_DATABASE menjadi `sigigi`, DB_USERNAME menjadi `sigigi_user`, dan passwordnya. Untuk menyimpan dan keluar, tekan `Ctrl+X`, ketik `Y`, tekan `Enter`)*.
4. Install ekstensi Laravel (Composer), jalankan migrasi database, dan buat link storage:
   ```bash
   curl -sS https://getcomposer.org/installer | php
   sudo php composer.phar install --optimize-autoloader --no-dev
   php artisan key:generate
   php artisan migrate --force
   php artisan storage:link
   ```

### Langkah 5.3: Menyambungkan Website ke Domain (Nginx)
Kita harus menyuruh Nginx (Apache-nya Linux) untuk membuka Laravel.
1. Hapus pengaturan bawaan: `sudo rm /etc/nginx/sites-enabled/default`
2. Buat pengaturan baru: `sudo nano /etc/nginx/conf.d/sigigi.conf`
3. *Paste* kode ini ke dalamnya:
   ```nginx
   server {
       listen 80;
       server_name localhost; # Ganti localhost dengan domain Anda jika punya, misal: api.sigigi.com
       root /var/www/sigigi-backend/public;
       index index.php;

       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }

       location ~ \.php$ {
           include snippets/fastcgi-php.conf;
           fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
       }
   }
   ```
4. Simpan (`Ctrl+X`, `Y`, `Enter`), lalu restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```
   *(Sekarang, Backend sudah online!)*

### Langkah 5.4: Setup Machine Learning AI (FastAPI)
AI Python butuh tempat terpisah agar tidak *error*.
1. Pindahkan folder AI:
   ```bash
   sudo mv ~/sigigi-main/ml-api /opt/sigigi-ml
   cd /opt/sigigi-ml
   ```
2. Buat ruang Python (Virtual Environment) dan install AI:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Nyalakan AI selamanya di background (menggunakan Systemd):
   ```bash
   sudo nano /etc/systemd/system/sigigi-ml.service
   ```
   *Paste* kode berikut:
   ```ini
   [Unit]
   Description=SIGIGI ML API
   After=network.target

   [Service]
   User=root
   WorkingDirectory=/opt/sigigi-ml
   Environment="PATH=/opt/sigigi-ml/venv/bin"
   ExecStart=/opt/sigigi-ml/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8001

   [Install]
   WantedBy=multi-user.target
   ```
4. Simpan, lalu nyalakan:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start sigigi-ml
   sudo systemctl enable sigigi-ml
   ```
   *(Sekarang, AI sudah menyala 24 jam di background port 8001!)*

### Langkah 5.5: Deployment Frontend (React)
Frontend paling mudah karena tidak butuh masuk ke layar hitam Linux.
1. Buka browser komputer Anda, login ke **[Vercel.com](https://vercel.com)**.
2. Buat project baru, hubungkan dengan **GitHub** Anda, lalu pilih *repository* `sigigi-main`.
3. Di bagian **Root Directory**, pilih folder `frontend`.
4. Di bagian **Environment Variables**, masukkan:
   - Name: `VITE_API_URL`
   - Value: `http://IP_VPS_ANDA_ATAU_DOMAIN` (Atau `https://api.sigigi.com` jika menggunakan SSL/HTTPS)
5. Klik **Deploy**. Selesai! Vercel akan otomatis menyatukan React dan memberikannya link publik (contoh: `sigigi.vercel.app`).

---

## 6. Pengamanan SSL (HTTPS) dengan Certbot

Agar API aman (menggunakan HTTPS), kita harus menginstal SSL sertifikat gratis dari Let's Encrypt menggunakan Certbot.

1. Install Certbot Nginx plugin:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```
2. Jalankan Certbot untuk domain backend Anda (ganti `api.sigigi.com` dengan domain backend Anda yang sudah diarahkan ke IP VPS):
   ```bash
   sudo certbot --nginx -d api.sigigi.com
   ```
3. Ikuti petunjuk di layar (masukkan email, setujui terms, pilih redirect HTTP ke HTTPS). Certbot akan otomatis mengubah konfigurasi Nginx Anda menjadi aman.

---

## 7. Monitoring Server dengan Netdata

Netdata adalah alat pemantau kinerja server (CPU, RAM, Disk, Traffic) secara *real-time* dengan visualisasi dashboard web yang sangat interaktif dan modern.

1. Pasang Netdata di VPS Anda menggunakan script resmi sekali-jalan:
   ```bash
   wget -O /tmp/netdata-kickstart.sh https://get.netdata.cloud/kickstart.sh && sh /tmp/netdata-kickstart.sh --non-interactive
   ```
2. Setelah instalasi selesai, Netdata berjalan di port `19999`. Anda bisa langsung mengaksesnya lewat browser komputer Anda di:
   `http://IP_VPS_ANDA:19999`
3. Dashboard Netdata akan menampilkan visualisasi CPU usage, memory, disk activity, network traffic, dan process list. Tangkap layar (screenshot) dashboard ini saat melakukan load testing di bawah ini.

---

## 8. Stress & Load Testing dengan Locust

Locust adalah alat load testing berbasis Python. Kita menggunakannya untuk menembak API backend secara bersamaan (misal 50-100 request per detik) untuk melihat ketahanan server.

1. Buka folder proyek di komputer lokal Anda (Laptop Anda).
2. Pastikan Python sudah terinstal di laptop Anda, lalu install Locust:
   ```cmd
   pip install locust
   ```
3. File `locustfile.py` sudah tersedia di folder utama proyek `sigigi-main`. Jalankan Locust dengan mengetik:
   ```cmd
   locust -f locustfile.py
   ```
4. Buka browser komputer Anda di: `http://localhost:8089`
5. Masukkan parameter uji:
   - **Number of users**: `100` (Simulasi 100 user yang aktif bersamaan)
   - **Spawn rate**: `10` (Menambah 10 user baru setiap detik sampai mencapai 100)
   - **Host**: `http://IP_VPS_ANDA_ATAU_DOMAIN` (URL API backend Anda)
6. Klik **Start Swarming**.
7. Buka dashboard **Netdata** (`http://IP_VPS_ANDA:19999`) dan tangkap layar grafik CPU/RAM yang melonjak sebagai bukti monitoring saat pengujian performa server dilakukan.

---
🎉 **Selamat! Kini seluruh sistem Anda sudah online, diproteksi HTTPS, dan siap dimonitoring.**
- *Frontend* diakses pasien/dokter lewat Vercel.
- *Backend (Laravel)* di VPS merespon Vercel.
- *AI (FastAPI)* di VPS merespon permintaan Laravel dari *background*.
