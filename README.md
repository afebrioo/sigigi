# sigigi
SIGIGI ini merupakan aplikasi pencatatan tindakan dokter gigi pada klinik praktek pribadi mandiri. 
Sesuai lisensi, source code ini dapat dimodifikasi namun tidak diperkenankan untuk digunakan secara komersial (dijual kepada pihak lain).

Fitur yang tersedia:
1. Setting multi klinik praktek pribadi (karena 1 dokter gigi punya 3 STR).
2. Setting kondisi penyakit dan tindakan.
3. Setting harga tindakan.
4. Setting obat
5. Tindakan & pembayaran

Aplikasi ini masih sederhana karena memang fokusnya hanya untuk pencatatan tindakan beserta biaya jasanya. 
Saat ini masih belum terhubung dengan platform Satu Sehat maupun BPJS Kesehatan.

## Arsitektur Sistem
Arsitektur utama sistem ini dirancang untuk mendukung kehandalan, kinerja, keamanan, dan skalabilitas. Sistem ini dapat diakses melalui internet untuk mengelola praktik dokter gigi. 

Front-end dibangun menggunakan **React** dengan **TypeScript** dan **Vite**, serta menggunakan **Tailwind CSS** untuk desain UI yang responsif dan modern. Front-end berkomunikasi dengan back-end yang dibangun menggunakan framework **Laravel 11** (PHP) untuk memastikan efisiensi dan keamanan sistem. **MySQL** digunakan sebagai manajemen database untuk penyimpanan data yang terstruktur. 