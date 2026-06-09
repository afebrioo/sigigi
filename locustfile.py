import time
from locust import HttpUser, task, between

class SigigiUser(HttpUser):
    # Waktu tunggu antara setiap tugas/action acak (1 hingga 3 detik)
    wait_time = between(1, 3)

    def on_start(self):
        """
        Method ini otomatis dijalankan saat satu virtual user (VU) dibuat.
        Melakukan simulasi login untuk mendapatkan token API.
        """
        # Simulasi login sebagai Pasien (dapat disesuaikan jika ingin menguji akun staff)
        self.auth_token = None
        
        login_data = {
            "email": "pasien@example.com",     # Sesuaikan dengan email testing di database Anda
            "password": "password123"           # Sesuaikan dengan password testing
        }
        
        # Kirim request login ke endpoint portal pasien
        with self.client.post("/api/portal/login", json=login_data, catch_response=True) as response:
            if response.status_code == 200:
                response_json = response.json()
                if "token" in response_json:
                    # Ambil token dari response
                    self.auth_token = response_json["token"]
                elif "data" in response_json and "token" in response_json["data"]:
                    self.auth_token = response_json["data"]["token"]
                
                if self.auth_token:
                    # Atur default header Authorization untuk request selanjutnya
                    self.headers = {"Authorization": f"Bearer {self.auth_token}"}
                    response.success()
                else:
                    response.failure("Token tidak ditemukan dalam respons login")
            else:
                # Jika gagal login, user akan tetap mencoba mengirim request tanpa token untuk menguji handler 401/403
                self.headers = {}
                response.failure(f"Login gagal dengan status code {response.status_code}")

    @task(3)
    def view_queue_today(self):
        """
        Tugas 1: Melihat daftar antrean hari ini (endpoint publik/terbuka)
        """
        self.client.get("/api/queue/today?id_klinik=1", headers=getattr(self, 'headers', {}))

    @task(2)
    def view_appointments(self):
        """
        Tugas 2: Melihat riwayat appointment sendiri (membutuhkan autentikasi)
        """
        if hasattr(self, 'headers') and self.auth_token:
            self.client.get("/api/appointments", headers=self.headers)

    @task(1)
    def check_session(self):
        """
        Tugas 3: Memeriksa session token (membutuhkan autentikasi)
        """
        if hasattr(self, 'headers') and self.auth_token:
            self.client.get("/api/check-session", headers=self.headers)

    @task(1)
    def view_public_homepage(self):
        """
        Tugas 4: Akses homepage publik / CSRF cookie (tanpa token)
        """
        self.client.get("/sanctum/csrf-cookie")
