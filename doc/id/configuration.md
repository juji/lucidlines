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

```json5
{
  // Port server (default: 8080)
  port: 3000,

  // Aktifkan mode pengembangan (default: false)
  dev: true,

  // Perintah untuk dijalankan
  commands: [
    {
      name: "web",
      command: "npm run dev"
    },
    {
      name: "api",
      command: "python -m flask run"
    }
  ]
}
```

## Format Perintah

Perintah ditentukan dengan nama dan perintah:

```json5
commands: [
  {
    name: "web",
    command: "npm run dev"
  }
]
```

### Nama Perintah

- Harus tidak kosong
- Tidak boleh mengandung baris baru
- Harus deskriptif dan unik

### Contoh Perintah

```json5
commands: [
  // Aplikasi Node.js
  { name: "frontend", command: "npm run dev" },
  { name: "backend", command: "npm run server" },

  // Aplikasi Python
  { name: "api", command: "python -m flask run" },
  { name: "worker", command: "python worker.py" },

  // Database
  { name: "postgres", command: "docker run -p 5432:5432 postgres" },
  { name: "redis", command: "redis-server" },

  // Pemantauan log
  { name: "logs", command: "tail -f /var/log/app.log" },
  { name: "errors", command: "tail -f /var/log/error.log" }
]
```

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