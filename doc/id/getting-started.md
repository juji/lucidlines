---
prev:
  text: Memulai
  link: /id/index.html
---

# Memulai

Selamat datang di LucidLines! Jika belum, lihat [halaman utama](./) untuk instruksi instalasi dan setup dasar.

Panduan ini mencakup topik memulai lanjutan dan praktik terbaik untuk menggunakan LucidLines secara efektif.

## Prasyarat

- Node.js 18 atau lebih tinggi
- npm atau yarn

## Struktur Proyek

Setelah instalasi, proyek Anda akan memiliki:

```
your-project/
├── .lucidlines.json5    # File konfigurasi
├── package.json         # Dependensi proyek Anda
└── ...                  # Kode aplikasi Anda
```

## Konfigurasi Lanjutan

Untuk opsi konfigurasi yang lebih lanjutan, lihat [Panduan Konfigurasi](./configuration).

## Alur Kerja Pengembangan

### Menjalankan dalam Mode Pengembangan

```bash
# Aktifkan mode pengembangan dengan logging konsol
npx lucidlines --dev
```

### Menambahkan Lebih Banyak Proses

Anda dapat menambahkan sebanyak proses yang diperlukan ke `.lucidlines.json5` Anda:

```json5
{
  port: 8080,
  dev: true,
  commands: [
    { name: "frontend", command: "npm run dev" },
    { name: "backend", command: "npm run server" },
    { name: "database", command: "docker-compose up db" },
    { name: "tests", command: "npm run test:watch" }
  ]
}
```

## Kontrol Keyboard

Ketika menjalankan LucidLines di terminal:

- **Tombol angka** (1, 2, 3...) - Mulai ulang proses individual
- **r** - Mulai ulang semua proses
- **ctrl+c** - Keluar aplikasi

## Pemecahan Masalah

### Masalah Umum

- **Port sudah digunakan**: Ubah port di file `.lucidlines.json5` Anda
- **Proses tidak mau mulai**: Periksa bahwa perintah benar dan dependensi terinstal
- **Antarmuka web tidak dimuat**: Pastikan server dimulai dengan sukses dan periksa port

## Langkah Selanjutnya

- Pelajari tentang [opsi konfigurasi](./configuration)
- Jelajahi [referensi CLI](./cli)
- Lihat [dokumentasi API](./core)