---
next:
  text: Opsi Konfigurasi
  link: /id/configuration.html
---

# LucidLines

LucidLines adalah alat CLI yang menjalankan beberapa perintah terminal secara bersamaan dan mengalirkan outputnya ke antarmuka web modern. Sempurna untuk alur kerja pengembangan, memantau beberapa layanan, atau skenario apa pun di mana Anda perlu menonton output perintah beberapa secara bersamaan.

![Antarmuka Web LucidLines](/screenshot.png)

## Instalasi & Setup

<!--@include: ../.vitepress/includes/installation-code-group.md-->

Ini akan membuat file konfigurasi `.lucidlines.json5` di proyek Anda dan menambahkan skrip ke `package.json`:

<!--@include: ../.vitepress/includes/package-json-script.md-->

## Konfigurasi

File `.lucidlines.json5` berisi definisi proses dan pengaturan Anda. Setelah inisialisasi, edit file ini untuk menambahkan perintah Anda:

<!--@include: ../.vitepress/includes/configuration-basic.md-->

## Memulai LucidLines

Setelah konfigurasi Anda disiapkan, mulai LucidLines menggunakan salah satu metode ini:

<!--@include: ../.vitepress/includes/starting-commands.md-->

Ini akan memulai semua proses yang didefinisikan dalam file `.lucidlines.json5` Anda, output contoh:

![Pratinjau LucidLines Dimulai](/lucidlines-cli.png)

### Antarmuka Web

Setelah dimulai, buka browser Anda ke `http://localhost:8080` (atau port yang dikonfigurasi) untuk mengakses dasbor web.

## Kontrol Keyboard

Saat menjalankan LucidLines, Anda dapat menggunakan pintasan keyboard ini:

- `1`, `2`, `3`, dll. - Mulai ulang proses individual
- `r` - Mulai ulang semua proses
- `ctrl+c` - Keluar dari aplikasi