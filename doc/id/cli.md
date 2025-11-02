---
prev:
  text: Inti
  link: /id/core.html
---

# Antarmuka Baris Perintah

Referensi lengkap untuk perintah dan opsi CLI LucidLines.

## Sinopsis

```bash
lucidlines [subcommand] [options]
```

## Output Bantuan

```
LucidLines - Server streaming terminal

Penggunaan:
  lucidlines [subcommand] [options]

Subperintah:
  init                    Buat file konfigurasi .lucidlines.json5

Opsi:
  -p, --port <port>          Port server (default: 8080)
  -c, --command <name:cmd>   Tambahkan perintah untuk dijalankan (dapat digunakan beberapa kali)
  -C, --config <file>        Path ke file konfigurasi JSON5 (default: .lucidlines.json5)
  -d, --dev                  Aktifkan mode pengembangan (logging konsol)
  -h, --help                 Tampilkan pesan bantuan ini

Contoh:
  lucidlines init
  lucidlines --port 3000 --command "server:npm run dev" --command "logs:tail -f /var/log/app.log"
  lucidlines -p 8081 -c "web:python app.py" -c "db:mongod" --dev
```

## Contoh

### Penggunaan Dasar

```bash
# Mulai dengan dua proses
lucidlines -c "frontend:npm run dev" -c "backend:npm run server"

# Gunakan port kustom
lucidlines -p 3000 -c "app:npm start"

# Mode pengembangan
lucidlines --dev -c "web:npm run dev" -c "logs:tail -f app.log"

# Gunakan file konfigurasi
lucidlines -C my-config.json5
```

### Contoh Lanjutan

```bash
# Beberapa layanan
lucidlines \
  -c "web:npm run dev" \
  -c "api:python -m flask run" \
  -c "db:docker run -p 5432:5432 postgres" \
  -c "redis:redis-server"

# Setup produksi
lucidlines -C production.json5

# Pengembangan dengan port kustom
lucidlines -p 3001 --dev -c "app:npm run dev"
```