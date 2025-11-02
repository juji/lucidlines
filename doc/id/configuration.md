---
prev:
  text: Memulai
  link: /id/index.html
next:
  text: Antarmuka Web
  link: /id/web-interface.html
---

# Konfigurasi

LucidLines dapat dikonfigurasi melalui file konfigurasi.

## File Konfigurasi

LucidLines mencari file `.lucidlines.json5` di direktori saat ini. Anda juga dapat menentukan file konfigurasi kustom dengan flag `-C`.

### Konfigurasi Dasar

<!--@include: ../.vitepress/includes/configuration-basic.md-->

## Format Perintah

Perintah ditentukan dengan nama dan perintah:

<!--@include: ../.vitepress/includes/configuration-command-format.md-->

### Nama Perintah

- Harus tidak kosong
- Tidak boleh mengandung baris baru
- Harus deskriptif dan unik

### Contoh Perintah

<!--@include: ../.vitepress/includes/configuration-command-examples.md-->

## Variabel Lingkungan

LucidLines secara otomatis mengatur variabel lingkungan ini untuk output yang lebih baik:

- `FORCE_COLOR=1` - Paksa output berwarna
- `CLICOLOR_FORCE=1` - Paksa warna CLI
- `COLORTERM=truecolor` - Aktifkan dukungan warna sejati

## Mode Pengembangan

Ketika `dev: true` disetel:

- Logging konsol diaktifkan
- Output lebih verbose

## Prioritas Konfigurasi

Nilai konfigurasi digabung dalam urutan ini (yang terakhir menimpa yang sebelumnya):

1. Nilai default
2. File konfigurasi
3. Argumen baris perintah