---
prev:
  text: Antarmuka Web
  link: /id/web-interface.html
next:
  text: DataBank
  link: /id/databank.html
---

# Manajemen Proses

Cara LucidLines mengelola dan mengontrol proses Anda.

## Siklus Hidup Proses

### Memulai Proses

Ketika LucidLines dimulai, ia:

1. Mengurai perintah Anda dari CLI atau file konfigurasi
2. Membuat setiap proses menggunakan Node.js `child_process.spawn`
3. Mengatur streaming output ke antarmuka web
4. Memantau kesehatan proses dan kode keluar

### Konfigurasi Proses

Setiap proses didefinisikan dengan nama dan perintah:

<!--@include: ../.vitepress/includes/process-config-example.md-->

### Setup Lingkungan

LucidLines secara otomatis mengkonfigurasi lingkungan untuk output yang lebih baik:

- `FORCE_COLOR=1` - Memaksa output berwarna
- `CLICOLOR_FORCE=1` - Memaksa warna CLI
- `COLORTERM=truecolor` - Mengaktifkan dukungan warna sejati

## Kontrol Proses

### Kontrol Keyboard (Terminal Interaktif)

Ketika berjalan di terminal interaktif dengan perintah yang dikonfigurasi, Anda dapat mengontrol proses melalui keyboard:

- **Tombol Angka** (1, 2, 3...) - Mulai ulang proses tertentu
- **r** - Mulai ulang semua proses
- **ctrl+c** - Keluar aplikasi

### Kontrol Programatik

Proses dapat dikontrol secara programatik melalui API.

## Pemantauan Proses

### Output Real-time

- Semua stdout/stderr ditangkap dan dialirkan
- Output warna dipertahankan jika memungkinkan
- Output besar ditangani secara efisien

### Penyimpanan Data

Output proses disimpan menggunakan sistem **DataBank**:

- **Penyimpanan persisten** dengan database <a href="https://github.com/WiseLibs/better-sqlite3" target="_blank" rel="noopener noreferrer">better-sqlite3</a>
- **Persistensi file sementara** untuk retensi data
- **Arsitektur berbasis event** untuk pembaruan real-time
- **Pembersihan otomatis** saat keluar aplikasi

DataBank memisahkan output proses dari konsumsi antarmuka web, memungkinkan:

- **Buffering** pesan terbaru untuk klien baru
- **Query efisien** berdasarkan tipe proses dan timestamp
- **Manajemen memori** dengan batas yang dapat dikonfigurasi
- **Persistensi data** dengan keandalan SQLite

### Kesehatan Proses

- Kode keluar dipantau
- Proses yang gagal dicatat
- Kemampuan restart otomatis

## Manajemen Data

### Arsitektur DataBank

LucidLines menggunakan sistem manajemen data yang disebut **DataBank**:

<!--@include: ../.vitepress/includes/log-entry-interface.md-->

### Strategi Penyimpanan

- **Utama**: Database SQLite untuk persistensi yang andal
- **File sementara**: Dihapus otomatis saat proses keluar
- **Pembersihan**: Penghapusan otomatis saat proses keluar
- **Performa**: Indeks yang dioptimalkan pada timestamp dan tipe

### Alur Data

1. **Output Proses** → Ditangkap oleh NodeStream
2. **Penyimpanan DataBank** → Disimpan dengan metadata
3. **Emisi Event** → Pembaruan real-time ke subscriber
4. **Streaming WebSocket** → Dikirim ke klien yang terhubung

### Kemampuan Query

DataBank menyediakan query yang kaya untuk berbagai kasus penggunaan:

- **Pesan Terbaru**: Dapatkan output terbaru untuk klien baru
- **Filter Tipe**: Query berdasarkan proses tertentu
- **Berbasis Waktu**: Ambil pesan dalam rentang waktu
- **Paginasi**: Penanganan efisien dataset besar

### Manajemen Memori

- **Batas yang Dapat Dikonfigurasi**: Default 1000 pesan terbaru
- **Pembersihan Otomatis**: Dipicu saat proses berakhir
- **Pemantauan Resource**: Pelacakan penggunaan memori
- **Degradasi Graceful**: Performa di bawah beban