---
prev:
  text: Konfigurasi
  link: /id/configuration.html
next:
  text: Manajemen Proses
  link: /id/process-management.html
---

# Antarmuka Web

LucidLines menyediakan dasbor web modern untuk memantau dan mengontrol proses Anda secara real-time. Antarmuka dibangun menggunakan <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">Vite</a> dan <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a> untuk performa optimal dan pengalaman pengembang yang baik.

## Mengakses Dasbor

Setelah LucidLines berjalan, buka browser Anda ke:

```
http://localhost:8080
```

(atau port yang dikonfigurasi)

## Ikhtisar Antarmuka

### Tampilan Terminal Dasar
Antarmuka web menampilkan proses yang dikonfigurasi dalam jendela terminal individual, menunjukkan output real-time saat mengalir dari setiap proses.

<p style="text-align: center;">
  <img src="/basic.gif" alt="Dasar Antarmuka Web LucidLines" style="display: block; margin: 0 auto; max-width: 100%;">
</p>

### Seleksi Terminal
Anda dapat menyalakan dan mematikan terminal individual tanpa memengaruhi proses yang mendasarinya. Ini memungkinkan Anda fokus pada output tertentu sambil menjaga proses berjalan di latar belakang.

<p style="text-align: center;">
  <img src="/select.gif" alt="Seleksi Antarmuka Web LucidLines" style="display: block; margin: 0 auto; max-width: 100%;">
</p>

### Riwayat
Akses log historis dari sesi saat ini. Semua output terminal disimpan ke SQLite, memungkinkan Anda menggulir kembali melalui log masa lalu bahkan setelah menutup dan membuka kembali browser Anda.

<p style="text-align: center;">
  <img src="/history.gif" alt="Riwayat Antarmuka Web LucidLines" style="display: block; margin: 0 auto; max-width: 100%;">
</p>

### Kustomisasi Antarmuka
Dasbor menawarkan beberapa opsi kustomisasi:
- **Ukuran Teks**: Sesuaikan ukuran font untuk keterbacaan yang lebih baik
- **Kustomisasi Warna**: Terapkan skema warna HSL ke semua output terminal

<p style="text-align: center;">
  <img src="/option.gif" alt="Opsi Antarmuka Web LucidLines" style="display: block; margin: 0 auto; max-width: 100%;">
</p>

### Penyusunan Ulang Terminal
Terminal dapat disusun ulang menggunakan fungsi drag-and-drop, memungkinkan Anda mengorganisir ruang kerja sesuai preferensi Anda. Fitur ini didukung oleh pustaka <a href="https://swapy.tahazsh.com/" target="_blank" rel="noopener noreferrer">Swapy</a>.

<p style="text-align: center;">
  <img src="/dnd.gif" alt="Drag and Drop Antarmuka Web LucidLines" style="display: block; margin: 0 auto; max-width: 100%;">
</p>



## Dukungan Browser

LucidLines berfungsi di browser desktop modern:

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

**Browser mobile tidak didukung.** Gunakan browser desktop untuk pengalaman terbaik.

## Pemecahan Masalah

### Masalah Koneksi

Jika dasbor gagal dimuat:

1. Verifikasi bahwa LucidLines berjalan dan dapat diakses
2. Konfirmasi Anda menggunakan nomor port yang benar
3. Periksa konsol pengembang browser untuk pesan kesalahan
4. Pastikan koneksi WebSocket diizinkan oleh jaringan/firewall Anda

### Keterbatasan Perangkat Mobile

**Browser mobile tidak didukung.**

LucidLines dirancang khusus untuk lingkungan pengembangan desktop. Untuk pengalaman terbaik:

- Gunakan komputer desktop atau laptop
- Pastikan lebar layar minimal 1024px
- Gunakan browser desktop modern

Persyaratan antarmuka terminal yang kompleks membuat dukungan browser mobile tidak praktis.